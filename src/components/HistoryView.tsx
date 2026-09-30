import React from 'react';
import { History, Trash2, ArrowUpRight, FileText, Calendar, Users, Shield } from 'lucide-react';

export interface HistoryRecord {
  id: string;
  timestamp: string;
  doc_type: string;
  parties: string[];
  terms: string[];
  effective_date: string;
  content: string;
  mode: 'live' | 'demo';
  status: string;
}

interface HistoryViewProps {
  records: HistoryRecord[];
  onLoadDocument: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onLoadDocument,
  onDeleteRecord,
  onClearHistory,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-[#E6DFD5] p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-serif-heading font-semibold text-[#0B1F3A]">
            Generation History
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Local session records on this device. Privacy preserved: no API keys are ever stored.
          </p>
        </div>

        {records.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all generation history?')) {
                onClearHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E6DFD5] p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#0B1F3A] flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-serif-heading font-semibold text-slate-800">
            No Documents in History Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Generate your first legal agreement using the Draft Document tab. All drafted records will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-[#E6DFD5] p-5 shadow-xs hover:border-slate-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif-heading text-base font-semibold text-[#0B1F3A]">
                    {rec.doc_type}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                      rec.mode === 'live'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {rec.mode === 'live' ? 'Live Gemini AI' : 'Demo Template'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-legal flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {rec.timestamp}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Parties:{' '}
                    <strong className="text-slate-700">
                      {rec.parties.join(' · ') || 'Undersigned'}
                    </strong>
                  </span>
                </div>

                {rec.terms && rec.terms.length > 0 && (
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    Clauses: {rec.terms.join(', ')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  onClick={() => onLoadDocument(rec)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#FAF6EE] text-[#0B1F3A] border border-[#E6DFD5] hover:bg-[#F3EBDD]"
                >
                  <span>Load in Drafter</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteRecord(rec.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
