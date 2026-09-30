/**
 * LegalEase Document Exporter (DOCX, PDF, TXT)
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { jsPDF } from "jspdf";

export function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadDocx(filename: string, title: string, content: string) {
  try {
    const lines = content.split("\n");
    const paragraphs: Paragraph[] = [];

    // Document Title Header
    paragraphs.push(
      new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300, before: 100 },
      })
    );

    // Body Lines
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 120 } }));
        continue;
      }

      const isHeading = /^[0-9]+\.\s+[A-Z\s&]+$/.test(trimmed) || trimmed === "PARTIES:" || trimmed === "PREAMBLE";
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: isHeading,
              font: "Georgia",
              size: isHeading ? 24 : 21, // 12pt or 10.5pt
              color: isHeading ? "0B1F3A" : "1E293B",
            }),
          ],
          spacing: { after: isHeading ? 160 : 80, line: 320 },
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("DOCX generation error:", error);
    // Fallback to text file if docx rendering fails
    downloadTxt(`${filename}.txt`, content);
    return false;
  }
}

export function downloadPdf(filename: string, title: string, content: string) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });

    const margin = 54; // 0.75 inch
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = margin;

    // Header on Page 1
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(11, 31, 58); // Deep navy
    const titleLines = doc.splitTextToSize(title.toUpperCase(), maxLineWidth);
    doc.text(titleLines, pageWidth / 2, cursorY, { align: "center" });
    cursorY += titleLines.length * 20 + 20;

    // Body
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);

    const lines = content.split("\n");
    for (const line of lines) {
      if (!line.trim()) {
        cursorY += 12;
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        continue;
      }

      const isHeading = /^[0-9]+\.\s+[A-Z\s&]+$/.test(line.trim()) || line.trim() === "PARTIES:" || line.trim() === "PREAMBLE";
      if (isHeading) {
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        doc.setTextColor(11, 31, 58);
      } else {
        doc.setFont("times", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
      }

      const wrapped = doc.splitTextToSize(line, maxLineWidth);
      for (const wLine of wrapped) {
        if (cursorY > pageHeight - margin - 30) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(wLine, margin, cursorY);
        cursorY += 14;
      }
    }

    // Page Numbering Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `LegalEase · Confidential Document · Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 24,
        { align: "center" }
      );
    }

    doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    downloadTxt(`${filename}.txt`, content);
    return false;
  }
}
