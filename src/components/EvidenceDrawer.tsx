import React from 'react';
import { X, Quote, FileText, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { CandidateDossier } from '../types';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuote: string | null;
  quoteSource?: 'resume' | 'transcript';
  candidate: CandidateDossier;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  selectedQuote,
  quoteSource = 'transcript',
  candidate
}) => {
  if (!isOpen) return null;

  const rawText = quoteSource === 'resume' ? candidate.resumeText : candidate.transcriptText;
  const fileName = quoteSource === 'resume' 
    ? (candidate.sourceFiles?.resumeFileName || 'Resume.pdf') 
    : (candidate.sourceFiles?.transcriptFileName || 'Interview_Transcript.pdf');

  // Simple highlight helper
  const renderHighlightedContent = () => {
    if (!selectedQuote || !rawText) {
      return <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">{rawText}</pre>;
    }

    // Clean search quote snippet
    const cleanQuote = selectedQuote.replace(/\[\d{2}:\d{2}:\d{2}\]/g, '').trim();
    const parts = rawText.split(new RegExp(`(${cleanQuote.substring(0, Math.min(cleanQuote.length, 30))})`, 'gi'));

    return (
      <div className="font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          const isMatch = cleanQuote.length > 0 && part.toLowerCase().includes(cleanQuote.substring(0, 15).toLowerCase());
          return isMatch ? (
            <span key={i} className="bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded border border-amber-400">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-in-out"
        id="evidence-inspector-drawer"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">Evidence & Quote Inspector</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                  {quoteSource}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {fileName} • Candidate: <span className="font-medium text-slate-800">{candidate.name}</span>
              </p>
            </div>
          </div>
          <button 
            id="close-evidence-drawer-btn"
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Quote Banner */}
        {selectedQuote && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <div className="flex items-start space-x-2.5">
              <Quote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Cited Evidence Snippet
                </div>
                <p className="text-xs font-medium text-amber-950 mt-1 italic leading-relaxed">
                  "{selectedQuote}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            {renderHighlightedContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center text-xs text-slate-500">
          <span>Traceability Rule: Every finding must anchor to verbatim transcript/resume evidence.</span>
          <button 
            id="dismiss-evidence-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
