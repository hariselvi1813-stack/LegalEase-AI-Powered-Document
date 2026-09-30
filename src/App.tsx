import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { DocumentPreview } from './components/DocumentPreview';
import { HistoryView, HistoryRecord } from './components/HistoryView';
import { StatusView } from './components/StatusView';
import { CodebaseView } from './components/CodebaseView';
import { DOCUMENT_TEMPLATES } from './lib/templates';
import { Sparkles, FileText, Scale } from 'lucide-react';

const STORAGE_KEY = 'legalease_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('generator');
  const [docContent, setDocContent] = useState<string>('');
  const [docType, setDocType] = useState<string>('NDA');
  const [docMode, setDocMode] = useState<'live' | 'demo'>('demo');
  const [fallbackNotice, setFallbackNotice] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [lastRequestParams, setLastRequestParams] = useState<any>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [geminiOnline, setGeminiOnline] = useState<boolean>(true);

  // Initialize with initial sample document and load history
  useEffect(() => {
    // 1. Initial document preview
    const defaultTemplate = DOCUMENT_TEMPLATES.NDA;
    const initialText = defaultTemplate.template(
      defaultTemplate.defaultParties,
      defaultTemplate.suggestedTerms,
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    );
    setDocContent(initialText);

    // 2. Load History from localStorage and backend
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistoryRecords(JSON.parse(stored));
      } else {
        // Sample record
        const sampleRecord: HistoryRecord = {
          id: 'hist-init-1',
          timestamp: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          doc_type: 'NDA',
          parties: ['Vanguard Innovations Inc.', 'Apex Research Partners LLC'],
          terms: ['2-year mutual non-disclosure duration', 'Governing jurisdiction: State of Delaware'],
          effective_date: new Date().toISOString().split('T')[0],
          content: initialText,
          mode: 'demo',
          status: 'Success (Verified Template)',
        };
        setHistoryRecords([sampleRecord]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleRecord]));
      }
    } catch (e) {
      console.error('History load warning:', e);
    }

    // 3. Check backend
    fetch('/health')
      .then((res) => {
        if (res.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      })
      .catch(() => setBackendOnline(false));
  }, []);

  // Save history helper
  const addHistoryRecord = (record: Omit<HistoryRecord, 'id'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newRecord, ...historyRecords].slice(0, 50);
    setHistoryRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Also post to backend history API
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      }).catch(() => {});
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  };

  // Generation Handler: exactly ONE call, disables button immediately, zero crash
  const handleGenerate = async (params: {
    docType: string;
    parties: string[];
    terms: string[];
    effectiveDate: string;
    forceDemo: boolean;
  }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setFallbackNotice(undefined);
    setLastRequestParams(params);
    setDocType(params.docType);

    // If forced to demo mode: generate immediately with verified templates
    if (params.forceDemo) {
      const def = DOCUMENT_TEMPLATES[params.docType] || DOCUMENT_TEMPLATES.Custom;
      const text = def.template(params.parties, params.terms, params.effectiveDate);
      setDocContent(text);
      setDocMode('demo');
      setFallbackNotice('Generated via verified offline demo mode.');
      setIsProcessing(false);

      addHistoryRecord({
        timestamp: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        doc_type: params.docType,
        parties: params.parties,
        terms: params.terms,
        effective_date: params.effectiveDate,
        content: text,
        mode: 'demo',
        status: 'Success (Demo Mode)',
      });
      return;
    }

    try {
      // Exactly ONE POST request
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: params.docType,
          parties: params.parties,
          terms: params.terms,
          effective_date: params.effectiveDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocContent(data.content || '');
        setDocMode(data.mode || 'demo');
        setFallbackNotice(data.fallbackNotice);

        addHistoryRecord({
          timestamp: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          doc_type: params.docType,
          parties: params.parties,
          terms: params.terms,
          effective_date: params.effectiveDate,
          content: data.content,
          mode: data.mode || 'demo',
          status: data.mode === 'live' ? 'Success (Live AI)' : 'Success (Demo Fallback)',
        });
      } else if (res.status === 429) {
        setErrorMessage('Gemini API usage limit reached. Please try again later or use Demo Mode.');
      } else {
        setErrorMessage(`Backend returned status ${res.status}. You can switch to Demo Mode.`);
      }
    } catch (err: any) {
      console.warn('Network or backend failure, using guaranteed fallback:', err);
      // Safe offline fallback
      const def = DOCUMENT_TEMPLATES[params.docType] || DOCUMENT_TEMPLATES.Custom;
      const text = def.template(params.parties, params.terms, params.effectiveDate);
      setDocContent(text);
      setDocMode('demo');
      setFallbackNotice('Offline safe fallback activated.');

      addHistoryRecord({
        timestamp: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        doc_type: params.docType,
        parties: params.parties,
        terms: params.terms,
        effective_date: params.effectiveDate,
        content: text,
        mode: 'demo',
        status: 'Success (Offline Safe)',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (lastRequestParams) {
      handleGenerate(lastRequestParams);
    }
  };

  const handleUseDemo = () => {
    if (lastRequestParams) {
      handleGenerate({ ...lastRequestParams, forceDemo: true });
    } else {
      const def = DOCUMENT_TEMPLATES[docType] || DOCUMENT_TEMPLATES.Custom;
      const text = def.template(def.defaultParties, def.suggestedTerms, '');
      setDocContent(text);
      setDocMode('demo');
      setErrorMessage(null);
    }
  };

  const handleLoadFromHistory = (rec: HistoryRecord) => {
    setDocContent(rec.content);
    setDocType(rec.doc_type);
    setDocMode(rec.mode);
    setActiveTab('generator');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDeleteHistoryRecord = (id: string) => {
    const updated = historyRecords.filter((r) => r.id !== id);
    setHistoryRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
    localStorage.removeItem(STORAGE_KEY);
    fetch('/api/history', { method: 'DELETE' }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#1A202C] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={historyRecords.length}
        backendOnline={backendOnline}
        geminiOnline={geminiOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'generator' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center sm:text-left space-y-2 pb-2 border-b border-[#E6DFD5]">
              <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#0B1F3A] tracking-tight">
                Legal documents, made simple.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
                Draft binding agreements with verified legal structures in seconds. Operates entirely on free tiers with guaranteed offline demo resilience and zero server crashes.
              </p>
            </div>

            {/* Error / Notice Banner */}
            {errorMessage && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-xs uppercase tracking-wide bg-amber-200/80 px-2 py-0.5 rounded">
                    Status
                  </span>
                  <span className="text-xs sm:text-sm">{errorMessage}</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleUseDemo}
                    className="text-xs font-semibold px-3 py-1.5 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#132D52] transition-colors"
                  >
                    Use Demo Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-xs font-medium px-3 py-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Clear error"
                  >
                    Clear Error ✕
                  </button>
                </div>
              </div>
            )}

            {/* Form Section */}
            <GeneratorForm onGenerate={handleGenerate} isProcessing={isProcessing} />

            {/* Results / Paper Preview Section */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif-heading font-semibold text-[#0B1F3A]">
                    Executed Document Preview
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review, customize, and export your legal agreement in multiple formats.
                  </p>
                </div>
              </div>

              {isProcessing ? (
                /* Loading Paper Skeleton */
                <div className="bg-white rounded-xl border border-[#E6DFD5] p-12 shadow-sm text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#0B1F3A] flex items-center justify-center mx-auto animate-pulse">
                    <Scale className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif-heading text-lg font-semibold text-[#0B1F3A]">
                      Drafting Legal Agreement...
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Formulating operative clauses, severability covenants, and execution blocks.
                    </p>
                  </div>
                  <div className="w-48 h-1.5 bg-[#FAF6EE] rounded-full mx-auto overflow-hidden">
                    <div className="w-full h-full bg-[#0B1F3A] animate-[shimmer_1.5s_infinite]" />
                  </div>
                </div>
              ) : (
                <DocumentPreview
                  content={docContent}
                  docType={docType}
                  mode={docMode}
                  fallbackNotice={fallbackNotice}
                  onContentChange={setDocContent}
                  onRetry={handleRetry}
                  onUseDemo={handleUseDemo}
                  onClearError={() => setErrorMessage(null)}
                  error={errorMessage}
                />
              )}
            </section>
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryView
            records={historyRecords}
            onLoadDocument={handleLoadFromHistory}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'status' && <StatusView />}

        {activeTab === 'codebase' && <CodebaseView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E6DFD5] py-8 text-xs text-slate-500 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0B1F3A]" />
            <span className="font-serif-heading font-semibold text-[#0B1F3A]">
              LegalEase
            </span>
            <span>·</span>
            <span>Automated Legal Drafter</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            Not legal advice · Free Tier & Demo Mode Compliant · v1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}
