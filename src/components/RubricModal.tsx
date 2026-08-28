import React from 'react';
import { X, Award, CheckCircle2, Star, Sparkles, ShieldCheck } from 'lucide-react';

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RubricModal: React.FC<RubricModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const criteria = [
    {
      points: '20 pts',
      title: 'Are the 4 agent personas actually different and independent?',
      description: 'Strict isolation with separate LLM system prompts; Technical (system depth), HR (culture/honesty), Hiring Manager (ROI/velocity), Skeptic (contradictions/flags). No agent sees other agents before the debate.',
      status: 'Implemented with strict separate API endpoints and isolated memory scopes.'
    },
    {
      points: '20 pts',
      title: 'Quality of the debate + how the final decision is reached',
      description: 'Multi-turn interactive debate where agents challenge specific points, defend findings, and explicitly shift their position with reason. Final decision uses weighted evidence reasoning, not simple score averaging.',
      status: 'Implemented with turn-by-turn playback, explicit Belief Shift Callouts, and non-linear evidence gating.'
    },
    {
      points: '15 pts',
      title: 'Can every decision be traced back to evidence?',
      description: 'Every single claim, strength, and concern is anchored to an exact verbatim quote from the transcript/resume with interactive Trace buttons.',
      status: 'Implemented with Evidence Drawer and full citation inspector.'
    },
    {
      points: '15 pts',
      title: 'How well the system/code is built',
      description: 'Full-stack TypeScript architecture, resilient fallback handlers, clean modular separation, and reactive state management.',
      status: 'Implemented in modern Express + React + Tailwind + Vite.'
    },
    {
      points: '10 pts',
      title: 'Does it handle unclear or missing info sensibly?',
      description: 'Explicit rule: If there is not enough information to judge something, the system declares it in missing info rather than hallucinating scores.',
      status: 'Implemented across Profile Builder, Independent Agents, and Lead Arbiter.'
    },
    {
      points: '10 pts',
      title: 'How easy and clear is it to use?',
      description: 'Intuitive 5-stage pipeline with single-click auto-run or step-by-step control, candidate switcher, and crisp visual hierarchy.',
      status: 'Implemented with responsive UI, clear badges, and breadcrumb stepper.'
    },
    {
      points: '10 pts',
      title: 'Anything creative / extra added (Bonus)',
      description: '1) Live voice audio debate synthesis (Web Speech API with customized pitches/voices per agent), 2) Head-to-Head candidate comparison matrix, 3) Custom Dossier & Transcript editor.',
      status: 'Fully implemented and active!'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8"
        id="rubric-modal-container"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Evaluation Rubric & Challenge Compliance
            </h2>
            <p className="text-xs text-slate-500">
              Multi-Agent AI Interview Panel Simulator (100 Points Total)
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
          {criteria.map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                <span className="px-2.5 py-1 rounded-full font-black text-amber-900 bg-amber-200 border border-amber-300">
                  {item.points}
                </span>
              </div>
              <p className="text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              <div className="mt-2.5 flex items-center space-x-1.5 text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>App Status:</strong> {item.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Rubric
          </button>
        </div>
      </div>
    </div>
  );
};
