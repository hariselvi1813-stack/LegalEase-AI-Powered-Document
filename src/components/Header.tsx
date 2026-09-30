import React from 'react';
import { Scale, FileText, History, Settings, Code } from 'lucide-react';

export type NavTab = 'generator' | 'history' | 'status' | 'codebase';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  historyCount: number;
  geminiOnline: boolean;
  backendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  historyCount,
  geminiOnline,
  backendOnline,
}) => {
  return (
    <header className="bg-[#0B1F3A] text-white border-b border-[#1E3A5F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF6EE] text-[#0B1F3A] flex items-center justify-center shadow-sm">
              <Scale className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-heading text-2xl font-bold tracking-tight text-[#FAF6EE]">
                  LegalEase
                </span>
                <span className="text-[11px] font-mono-legal px-2 py-0.5 rounded bg-[#163359] text-[#E6DFD5] border border-[#234A7D]">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-[#C6D4E6] tracking-wide">
                AI Legal Document Drafter · Free Tier & Offline Demo Safe
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 bg-[#071426] p-1 rounded-lg border border-[#163359] self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => onTabChange('generator')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'generator'
                  ? 'bg-[#1E3E6E] text-[#FAF6EE] shadow-sm'
                  : 'text-[#9BB1CC] hover:text-white hover:bg-[#0D2340]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Draft Document</span>
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-[#1E3E6E] text-[#FAF6EE] shadow-sm'
                  : 'text-[#9BB1CC] hover:text-white hover:bg-[#0D2340]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="text-[10px] bg-[#2A4D7A] text-[#FAF6EE] px-1.5 py-0.2 rounded-full font-mono-legal">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('status')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'status'
                  ? 'bg-[#1E3E6E] text-[#FAF6EE] shadow-sm'
                  : 'text-[#9BB1CC] hover:text-white hover:bg-[#0D2340]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Status & API</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                title={backendOnline ? 'Backend Operational' : 'Offline Demo Mode'}
              />
            </button>

            <button
              onClick={() => onTabChange('codebase')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'codebase'
                  ? 'bg-[#1E3E6E] text-[#FAF6EE] shadow-sm'
                  : 'text-[#9BB1CC] hover:text-white hover:bg-[#0D2340]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Python Stack</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
