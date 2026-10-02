import React, { useState } from 'react';
import { Plus, X, Calendar, Sparkles, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { DOCUMENT_TEMPLATES, DocTemplateDefinition } from '../lib/templates';

interface GeneratorFormProps {
  onGenerate: (data: {
    docType: string;
    parties: string[];
    terms: string[];
    effectiveDate: string;
    forceDemo: boolean;
  }) => void;
  isProcessing: boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isProcessing }) => {
  const [selectedType, setSelectedType] = useState<string>('NDA');
  const templateDef: DocTemplateDefinition = DOCUMENT_TEMPLATES[selectedType] || DOCUMENT_TEMPLATES.Custom;

  const [parties, setParties] = useState<string[]>([...templateDef.defaultParties]);
  const [terms, setTerms] = useState<string[]>([...templateDef.suggestedTerms]);
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newClause, setNewClause] = useState<string>('');
  const [forceDemo, setForceDemo] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // When changing document type, load matching defaults
  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
    const def = DOCUMENT_TEMPLATES[newType] || DOCUMENT_TEMPLATES.Custom;
    setParties([...def.defaultParties]);
    setTerms([...def.suggestedTerms]);
    setValidationError(null);
  };

  const handlePartyChange = (index: number, val: string) => {
    const updated = [...parties];
    updated[index] = val;
    setParties(updated);
  };

  const addParty = () => {
    if (parties.length >= 6) return;
    setParties([...parties, '']);
  };

  const removeParty = (index: number) => {
    if (parties.length <= 1) return;
    setParties(parties.filter((_, i) => i !== index));
  };

  const handleAddClause = () => {
    const trimmed = newClause.trim();
    if (!trimmed) return;
    if (terms.includes(trimmed)) {
      setNewClause('');
      return;
    }
    setTerms([...terms, trimmed]);
    setNewClause('');
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleAddPresetTerm = (clauseText: string) => {
    if (!terms.includes(clauseText)) {
      setTerms([...terms, clauseText]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanParties = parties.map(p => p.trim()).filter(Boolean);
    if (cleanParties.length === 0) {
      setValidationError('Please specify at least one valid party name.');
      return;
    }

    if (cleanParties.some(p => p.length > 150)) {
      setValidationError('Party names must not exceed 150 characters.');
      return;
    }

    onGenerate({
      docType: selectedType,
      parties: cleanParties,
      terms: terms.map(t => t.trim()).filter(Boolean),
      effectiveDate,
      forceDemo,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#E6DFD5] shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-[#E6DFD5] bg-[#FAF6EE]/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-serif-heading font-semibold text-[#0B1F3A]">
            Configure Document Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in the signatories, agreed terms, and effective date below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceDemo}
              onChange={(e) => setForceDemo(e.target.checked)}
              className="rounded border-[#C6D4E6] text-[#0B1F3A] focus:ring-0"
            />
            <span>Force Offline Demo</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Document Type Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-[#0B1F3A] uppercase tracking-wider mb-2">
            1. Document Classification
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {Object.keys(DOCUMENT_TEMPLATES).map((key) => {
              const def = DOCUMENT_TEMPLATES[key];
              const isSelected = selectedType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeChange(key)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-sm'
                      : 'border-[#E6DFD5] bg-[#FAF6EE]/30 text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="font-serif-heading text-sm font-semibold truncate">
                    {def.id}
                  </div>
                  <div className={`text-[11px] line-clamp-2 mt-1 ${isSelected ? 'text-[#FAF6EE]/80' : 'text-slate-500'}`}>
                    {def.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Parties & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Parties Involved */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#0B1F3A] uppercase tracking-wider">
                2. Parties Involved ({parties.length})
              </label>
              {parties.length < 6 && (
                <button
                  type="button"
                  onClick={addParty}
                  className="text-xs text-[#0B1F3A] hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Party</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {parties.map((party, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16 text-right font-mono-legal flex-shrink-0">
                    {idx === 0 ? 'Party A:' : idx === 1 ? 'Party B:' : `Party ${idx + 1}:`}
                  </span>
                  <input
                    type="text"
                    value={party}
                    onChange={(e) => handlePartyChange(idx, e.target.value)}
                    placeholder={`e.g. Legal entity or individual name`}
                    className="flex-1 text-sm bg-white border border-[#E6DFD5] rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0B1F3A]"
                    required={idx < 2}
                  />
                  {parties.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeParty(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      title="Remove party"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Enter formal registered company names or full individual legal names.
            </p>
          </div>

          {/* Effective Date */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#0B1F3A] uppercase tracking-wider">
                3. Effective Date
              </label>
              <button
                type="button"
                onClick={() => setEffectiveDate(new Date().toISOString().split('T')[0])}
                className="text-[11px] text-[#0B1F3A] hover:underline"
              >
                Set Today
              </button>
            </div>

            <div className="relative">
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full text-sm bg-white border border-[#E6DFD5] rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0B1F3A]"
                required
              />
            </div>
            <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E6DFD5] text-[11px] text-slate-600 space-y-1">
              <div className="font-medium text-[#0B1F3A] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Legal Enforcement</span>
              </div>
              <div>
                The agreement binds all signatories starting from this commencement timestamp.
              </div>
            </div>
          </div>
        </div>

        {/* Agreed Terms & Clauses */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#0B1F3A] uppercase tracking-wider">
              4. Key Clauses & Stipulated Terms ({terms.length})
            </label>
            <span className="text-[11px] text-slate-500">
              Each clause will be drafted into formal legal covenants.
            </span>
          </div>

          {/* Active Clauses Chips */}
          <div className="space-y-2">
            {terms.map((term, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#FAF6EE]/60 border border-[#E6DFD5] text-xs text-slate-800 group"
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono-legal text-[11px] text-slate-400 mt-0.5">
                    §{idx + 1}.
                  </span>
                  <span className="leading-relaxed">{term}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(idx)}
                  className="text-slate-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity p-0.5"
                  title="Remove clause"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom clause input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newClause}
              onChange={(e) => setNewClause(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddClause();
                }
              }}
              placeholder="Add custom clause (e.g., 'Governed by the laws of California', 'Payment within 30 days')..."
              className="flex-1 text-xs bg-white border border-[#E6DFD5] rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0B1F3A]"
            />
            <button
              type="button"
              onClick={handleAddClause}
              className="px-3 py-2 text-xs font-medium bg-[#FAF6EE] text-[#0B1F3A] border border-[#E6DFD5] rounded-md hover:bg-[#F3EBDD]"
            >
              Add Clause
            </button>
          </div>

          {/* Suggested Clauses Quick Select */}
          <div className="pt-1">
            <span className="text-[11px] text-slate-500 mr-2">Suggested additions:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {[
                'Standard Delaware governing law',
                'Injunctive relief & attorney fees recovery',
                'Strict 30-day written cure period',
                'Mutual severability clause',
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddPresetTerm(sug)}
                  disabled={terms.includes(sug)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    terms.includes(sug)
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white text-slate-700 border-[#E6DFD5] hover:border-slate-400'
                  }`}
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit & Action Row */}
        <div className="pt-4 border-t border-[#E6DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Exactly <span className="font-medium text-slate-800">1 AI call</span> per generation · No background polling
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              isProcessing
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-[#0B1F3A] text-[#FAF6EE] hover:bg-[#132D52] active:scale-[0.99]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#CBA24B]" />
                <span>Generate Legal Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
