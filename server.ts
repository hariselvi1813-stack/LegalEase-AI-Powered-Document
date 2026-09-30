/**
 * LegalEase Fullstack Server (Express + Vite)
 * Implements the backend contract with Gemini AI integration and Demo Mode fallback.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HISTORY_FILE = path.resolve(process.cwd(), 'history.json');

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client with aistudio-build telemetry
const apiKey = process.env.GEMINI_API_KEY;
const isKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('MY_GEMINI_API_KEY'));

let ai: GoogleGenAI | null = null;
if (isKeyConfigured) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Gemini SDK initialization note:', err);
    ai = null;
  }
}

// Fallback demo templates
function buildDemoFallback(docType: string, parties: string[], terms: string[], effectiveDate: string): string {
  const p1 = parties[0] || 'First Party';
  const p2 = parties[1] || 'Second Party';
  const dateStr = effectiveDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formattedTerms = terms.length > 0
    ? terms.map((t, i) => `  4.${i + 1}. ${t}`).join('\n')
    : '  4.1. Standard confidentiality covenants apply.\n  4.2. Mutual good faith execution of all agreed milestones.';

  return `${docType.toUpperCase()} AGREEMENT

This Agreement is made and entered into as of ${dateStr} (the "Effective Date"), by and between:

PARTIES:
- Party One: ${p1}
- Party Two: ${p2}

1. PURPOSE & PREAMBLE
The Parties wish to formalize their mutual rights, responsibilities, and covenants with respect to their ongoing relationship and the matters set forth herein.

2. STANDARD OF PERFORMANCE & CONFIDENTIALITY
Each Party agrees to perform its obligations with professional diligence and hold any proprietary or confidential information disclosed in connection herewith in strictest confidence.

3. DURATION AND TERMINATION
This Agreement shall commence on the Effective Date and continue in full force unless terminated in writing by either Party with thirty (30) days prior notice.

4. SPECIFIC OPERATIONAL TERMS & CLAUSES
${formattedTerms}

5. SEVERABILITY & GOVERNING LAW
This Agreement shall be interpreted and enforced under the laws of the applicable jurisdiction. If any provision is deemed unenforceable, the remainder shall remain in full force.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.

____________________________________            ____________________________________
Signature: ${p1}                                Signature: ${p2}
Date: ${dateStr}                                Date: ${dateStr}`;
}

// 1. Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 2. System Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    backend: 'operational',
    geminiConfigured: isKeyConfigured,
    model: 'gemini-3.1-flash-lite',
    demoModeAvailable: true,
    version: '1.0.0',
  });
});

// 3. Document Generation
const handleGenerate = async (req: Request, res: Response) => {
  try {
    const { doc_type, parties = [], terms = [], effective_date } = req.body;

    if (!doc_type || typeof doc_type !== 'string' || !doc_type.trim()) {
      return res.status(400).json({ error: 'Document type is required.' });
    }

    if (doc_type.length > 150) {
      return res.status(400).json({ error: 'Document type exceeds maximum character length.' });
    }

    const cleanParties = Array.isArray(parties) ? parties.filter(p => typeof p === 'string' && p.trim()) : [];
    const cleanTerms = Array.isArray(terms) ? terms.filter(t => typeof t === 'string' && t.trim()) : [];
    const dateStr = effective_date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // If Gemini is configured, execute AI call with fallback model chain and timeout
    if (ai && isKeyConfigured) {
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      const prompt = `You are a professional legal drafting assistant.
Create a formal, clean, clear ${doc_type} ready for execution.
Effective Date: ${dateStr}
Parties involved: ${cleanParties.join(', ') || 'Undersigned Parties'}
Key terms and clauses to include:
${cleanTerms.map(t => `- ${t}`).join('\n') || '- Standard commercial covenants and obligations'}

Instructions:
- Write out the complete legal contract with formal title, preamble, numbered sections, covenants, and signature execution lines.
- Do NOT use markdown bold stars (**) inside section titles. Keep it clean, formal, and editorial.
- Include standard severability, confidentiality, and governing law clauses.
- Make the language clear, balanced, and ready to print.`;

      for (const modelName of candidateModels) {
        try {
          // Timeout race at 8 seconds so requests never hang
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Model generation timed out')), 8000)
          );

          const genPromise = ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert contract attorney assistant producing clean, formal legal agreements.',
              temperature: 0.2,
            },
          });

          const response = await Promise.race([genPromise, timeoutPromise]);
          const text = response?.text?.trim();
          if (text && text.length > 50) {
            return res.json({ content: text, mode: 'live' });
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} encountered error or timeout, checking next fallback:`, modelErr?.message || modelErr);
          // continue loop to next candidate model
        }
      }

      // If all models failed or hit quotas, safely provide realistic fallback template
      console.warn('All Gemini models encountered limit/unavailable, using verified template');
      const demoContent = buildDemoFallback(doc_type, cleanParties, cleanTerms, dateStr);
      return res.json({
        content: demoContent,
        mode: 'demo',
        fallbackNotice: 'Drafted via verified template (AI model was temporarily experiencing high demand).'
      });
    }

    // Default to realistic Demo Mode if key is not present
    const demoDoc = buildDemoFallback(doc_type, cleanParties, cleanTerms, dateStr);
    return res.json({ content: demoDoc, mode: 'demo' });
  } catch (err: any) {
    console.error('Unexpected generation handler error, falling back:', err);
    const demoDoc = buildDemoFallback(req.body?.doc_type || 'Legal Agreement', [], [], '');
    return res.json({
      content: demoDoc,
      mode: 'demo',
      fallbackNotice: 'Drafted via safe offline recovery template.'
    });
  }
};

app.post('/generate', handleGenerate);
app.post('/api/generate', handleGenerate);

// 4. DOCX Export Endpoint
const handleDocxExport = async (req: Request, res: Response) => {
  try {
    const { title = 'Legal_Document', content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Document content cannot be empty.' });
    }

    const lines = content.split('\n');
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300, before: 100 },
      })
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        continue;
      }
      const isHeading = /^[0-9]+\.\s+[A-Z\s&]+$/.test(trimmed) || trimmed === 'PARTIES:' || trimmed === 'PREAMBLE';
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: isHeading,
              font: 'Georgia',
              size: isHeading ? 24 : 21,
              color: isHeading ? '0B1F3A' : '1E293B',
            }),
          ],
          spacing: { after: isHeading ? 160 : 80, line: 320 },
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: paragraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeFilename = `${title.replace(/\s+/g, '_')}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    return res.send(buffer);
  } catch (err) {
    console.error('DOCX Export error:', err);
    return res.status(500).json({ error: 'Unable to generate DOCX document. Please try again.' });
  }
};

app.post('/generate-docx', handleDocxExport);
app.post('/api/generate-docx', handleDocxExport);

// 5. PDF Export Endpoint
const handlePdfExport = (req: Request, res: Response) => {
  try {
    const { title = 'Legal_Document', content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Document content cannot be empty.' });
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const margin = 54;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = margin;

    // Header Title
    pdf.setFont('times', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(11, 31, 58);
    const titleLines = pdf.splitTextToSize(title.toUpperCase(), maxLineWidth);
    pdf.text(titleLines, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += titleLines.length * 20 + 20;

    // Body Lines
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(30, 41, 59);

    const lines = content.split('\n');
    for (const line of lines) {
      if (!line.trim()) {
        cursorY += 12;
        if (cursorY > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }
        continue;
      }

      const isHeading = /^[0-9]+\.\s+[A-Z\s&]+$/.test(line.trim()) || line.trim() === 'PARTIES:' || line.trim() === 'PREAMBLE';
      if (isHeading) {
        pdf.setFont('times', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(11, 31, 58);
      } else {
        pdf.setFont('times', 'normal');
        pdf.setFontSize(10.5);
        pdf.setTextColor(30, 41, 59);
      }

      const wrapped = pdf.splitTextToSize(line, maxLineWidth);
      for (const wLine of wrapped) {
        if (cursorY > pageHeight - margin - 30) {
          pdf.addPage();
          cursorY = margin;
        }
        pdf.text(wLine, margin, cursorY);
        cursorY += 14;
      }
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const safeFilename = `${title.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF Export error:', err);
    return res.status(500).json({ error: 'Unable to generate PDF document. Please try again.' });
  }
};

app.post('/generate-pdf', handlePdfExport);
app.post('/api/generate-pdf', handlePdfExport);

// 6. History Endpoints
app.get('/api/history', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/history', (req: Request, res: Response) => {
  try {
    const entry = req.body;
    let list: any[] = [];
    if (fs.existsSync(HISTORY_FILE)) {
      try {
        list = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
      } catch {
        list = [];
      }
    }
    list.unshift({ ...entry, id: `hist-${Date.now()}` });
    list = list.slice(0, 50); // limit to 50
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return res.json({ success: true, count: list.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save history' });
  }
});

app.delete('/api/history', (_req: Request, res: Response) => {
  try {
    fs.writeFileSync(HISTORY_FILE, '[]', 'utf-8');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegalEase Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup failure:', err);
});
