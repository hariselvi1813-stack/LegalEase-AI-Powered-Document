import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Edit3,
  Eye,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { downloadTxt, downloadDocx, downloadPdf } from '../lib/export';

interface DocumentPreviewProps {
  content: string;
  docType: string;
  mode: 'live' | 'demo';
  fallbackNotice?: string;
  onContentChange: (newContent: string) => void;
  onRetry?: () => void;
  onUseDemo?: () => void;
  onClearError?: () => void;
  error?: string | null;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  docType,
  mode,
  fallbackNotice,
  onContentChange,
  onRetry,
  onUseDemo,
  onClearError,
  error,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = content.split('\n').length;
  const baseFilename = `${docType.replace(/\s+/g, '_')}_Agreement`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    downloadTxt(`${baseFilename}.txt`, content);
  };

  const handleDownloadDocx = async () => {
    setExportingType('docx');
    await downloadDocx(`${baseFilename}.docx`, docType, content);
    setExportingType(null);
  };

  const handleDownloadPdf = () => {
    setExportingType('pdf');
    downloadPdf(`${baseFilename}.pdf`, docType, content);
    setExportingType(null);
  };

  // If there's an error, show clear error state with [Retry], [Use Demo Mode], and [Clear Error]
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-amber-200 p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Generation Notice
                </h3>
                <p className="text-sm text-slate-600 mt-1">{error}</p>
              </div>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded"
                  title="Clear notice"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0B1F3A] text-white hover:bg-[#132D52]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Request</span>
                </button>
              )}

              {onUseDemo && (
                <button
                  type="button"
                  onClick={onUseDemo}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#FAF6EE] text-[#0B1F3A] border border-[#E6DFD5] hover:bg-[#F3EBDD]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B48C36]" />
                  <span>Use Verified Demo Mode</span>
                </button>
              )}

              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  <span>Clear Error & View Document</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Action & Metadata Bar */}
      <div className="bg-white rounded-xl border border-[#E6DFD5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {mode === 'demo' ? (
            <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 font-semibold px-2.5 py-1 rounded">
              Demo mode: sample text
            </span>
          ) : (
            <span className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold px-2.5 py-1 rounded flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Live AI Generated
            </span>
          )}

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{lineCount} lines</span>
          </div>

          {fallbackNotice && (
            <span className="text-[11px] text-slate-500 italic">
              ({fallbackNotice})
            </span>
          )}
        </div>

        {/* Edit & Mode Toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isEditing
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                : 'bg-[#FAF6EE] text-[#0B1F3A] border-[#E6DFD5] hover:bg-[#F3EBDD]'
            }`}
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Paper Preview</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Document</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-[#E6DFD5] hover:bg-slate-50"
            title="Copy document text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      {isEditing ? (
        <div className="bg-white rounded-xl border border-[#E6DFD5] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">Direct Document Editor</span>
            <span>All downloads will reflect edits made here.</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-[520px] p-4 font-mono-legal text-xs text-slate-800 bg-[#FAF6EE]/30 border border-[#E6DFD5] rounded-lg focus:outline-none focus:border-[#0B1F3A] leading-relaxed resize-y"
          />
        </div>
      ) : (
        /* Paper-Style Preview */
        <div className="legal-paper rounded-xl p-8 sm:p-14 text-slate-800">
          {/* Subtle paper watermark or header */}
          <div className="border-b border-slate-200 pb-4 mb-8 flex items-center justify-between text-xs text-slate-400 font-mono-legal">
            <span>LEGAL-DRAFT-REF // {baseFilename.toUpperCase()}</span>
            <span>STANDARD EXECUTION COPY</span>
          </div>

          <article className="prose prose-slate max-w-none">
            <pre className="font-serif-heading text-[13.5px] leading-relaxed text-slate-800 whitespace-pre-wrap font-normal select-text">
              {content}
            </pre>
          </article>

          <div className="border-t border-slate-200 pt-6 mt-12 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <span>Prepared via LegalEase automated document engine</span>
            <span>Page 1 of 1 · Non-negotiable without mutual execution</span>
          </div>
        </div>
      )}

      {/* Export Action Bar: TXT, DOCX, PDF */}
      <div className="bg-[#FAF6EE] rounded-xl border border-[#E6DFD5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#0B1F3A]">Export Agreement</div>
          <div className="text-[11px] text-slate-500">
            Download formatted legal files directly to your device.
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white text-slate-800 border border-[#E6DFD5] hover:border-slate-400 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Download .TXT</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={exportingType === 'docx'}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white text-[#0B1F3A] border border-[#0B1F3A]/30 hover:border-[#0B1F3A] shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-[#132D52]" />
            <span>{exportingType === 'docx' ? 'Building DOCX...' : 'Download .DOCX'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={exportingType === 'pdf'}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0B1F3A] text-[#FAF6EE] hover:bg-[#132D52] shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#CBA24B]" />
            <span>{exportingType === 'pdf' ? 'Rendering PDF...' : 'Download .PDF'}</span>
          </button>
        </div>
      </div>

      {/* Legal Advice Notice */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-slate-700">Not Legal Advice:</strong> LegalEase generates automated contract templates and drafts for convenience and business planning. This does not constitute attorney-client representation. You should consult a licensed legal professional in your jurisdiction before executing any agreement.
        </div>
      </div>
    </div>
  );
};
