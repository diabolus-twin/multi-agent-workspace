import React from 'react';
import { 
  GitCompare, 
  Trophy, 
  CheckCircle2, 
  AlertOctagon, 
  Quote, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  DollarSign,
  HeartHandshake
} from 'lucide-react';
import { ComparisonReport, CandidateDossier, CandidateEvaluationSession } from '../types';

interface CandidateComparisonViewProps {
  comparisonReport?: ComparisonReport;
  candidateA: CandidateDossier;
  candidateB: CandidateDossier;
  sessionA?: CandidateEvaluationSession;
  sessionB?: CandidateEvaluationSession;
  onRunComparison: () => void;
  onInspectQuote: (quote: string, source: 'resume' | 'transcript') => void;
  isLoading: boolean;
}

export const CandidateComparisonView: React.FC<CandidateComparisonViewProps> = ({
  comparisonReport,
  candidateA,
  candidateB,
  sessionA,
  sessionB,
  onRunComparison,
  onInspectQuote,
  isLoading
}) => {
  if (!comparisonReport) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <GitCompare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Head-to-Head Candidate Deliberation</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Compare {candidateA.name} and {candidateB.name} side-by-side across Technical Depth, Culture & Blamelessness, Resume Veracity, and Delivery Velocity.
        </p>
        <button
          id="trigger-head-to-head-btn"
          onClick={onRunComparison}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isLoading ? 'Running Comparative Deliberation...' : 'Run Head-to-Head Comparison'}</span>
        </button>
      </div>
    );
  }

  const isBWinner = comparisonReport.winnerCandidateId === 'candidate_b';

  return (
    <div className="space-y-6" id="candidate-comparison-view">
      
      {/* Winner Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-500/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Comparative Synthesis Verdict</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Top Ranked Candidate: {comparisonReport.winnerCandidateName}
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {comparisonReport.executiveSummary}
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-center shrink-0">
            <div className="text-[10px] uppercase font-bold text-indigo-300">Panel Consensus</div>
            <div className="text-sm font-bold text-white mt-1">
              {isBWinner ? 'Priya Sharma (1st Choice)' : 'Alex Rivera (1st Choice)'}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Candidate Profiles Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Candidate A Card */}
        <div className={`bg-white rounded-2xl border p-5 shadow-xs transition ${
          !isBWinner ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Candidate A</span>
              <h3 className="text-base font-bold text-slate-900">{candidateA.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {sessionA?.finalDecision?.finalRecommendation.replace('_', ' ') || 'REJECT'}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Claimed Scale:</span>
              <span className="font-semibold text-slate-900">100k QPS (Synthetic only)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Live Production Traffic:</span>
              <span className="font-semibold text-slate-900">1,200 - 1,800 QPS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cultural Dynamic:</span>
              <span className="font-semibold text-rose-700">Blames teammates; hero syndrome</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Locking Strategy:</span>
              <span className="font-semibold text-rose-700">10-min TTL hack</span>
            </div>
          </div>
        </div>

        {/* Candidate B Card */}
        <div className={`bg-white rounded-2xl border p-5 shadow-xs transition ${
          isBWinner ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600">Candidate B (Recommended)</span>
              <h3 className="text-base font-bold text-slate-900">{candidateB.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
              {sessionB?.finalDecision?.finalRecommendation.replace('_', ' ') || 'STRONG HIRE'}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Claimed Scale:</span>
              <span className="font-semibold text-slate-900">4,500 continuous streaming req/s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Live Production Traffic:</span>
              <span className="font-semibold text-emerald-700">4,500 streaming req/s (Verified)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cultural Dynamic:</span>
              <span className="font-semibold text-emerald-700">Blameless post-mortems & mentorship</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Locking Strategy:</span>
              <span className="font-semibold text-emerald-700">Fencing tokens with DB validation</span>
            </div>
          </div>
        </div>

      </div>

      {/* Head to Head Category Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dimension-by-Dimension Head-to-Head Matrix</h3>
            <p className="text-xs text-slate-500">Scored on evidence rigor, transcript authenticity, and risk impact</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full">
            {comparisonReport.categories.length} Dimensions Compared
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {comparisonReport.categories.map((cat, idx) => (
            <div key={idx} className="p-5 hover:bg-slate-50/50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-sm">{cat.category}</h4>
                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className={`${cat.candidateAScore > cat.candidateBScore ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {candidateA.name}: {cat.candidateAScore}
                  </span>
                  <span className="text-slate-300">vs</span>
                  <span className={`${cat.candidateBScore > cat.candidateAScore ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {candidateB.name}: {cat.candidateBScore}
                  </span>
                </div>
              </div>

              {/* Analysis */}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {cat.analysis}
              </p>

              {/* Decisive Quotes Comparison */}
              {(cat.decisiveQuoteA || cat.decisiveQuoteB) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {cat.decisiveQuoteA && (
                    <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200 text-xs">
                      <div className="text-[10px] font-bold text-rose-900 uppercase">{candidateA.name} Decisive Quote:</div>
                      <p className="font-mono text-rose-950 italic mt-1 text-[11px]">
                        "{cat.decisiveQuoteA}"
                      </p>
                    </div>
                  )}
                  {cat.decisiveQuoteB && (
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
                      <div className="text-[10px] font-bold text-emerald-900 uppercase">{candidateB.name} Decisive Quote:</div>
                      <p className="font-mono text-emerald-950 italic mt-1 text-[11px]">
                        "{cat.decisiveQuoteB}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hiring Strategy Tradeoffs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Decision Matrix by Organizational Priority</h3>
            <p className="text-xs text-slate-500">Executive guidance tailored to company goals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>If Priority is Delivery Velocity</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {comparisonReport.hiringRecommendationMatrix.ifPriorityIsVelocity}
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <div className="font-bold text-emerald-950 flex items-center space-x-1.5 mb-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>If Priority is Culture & Rigor</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              {comparisonReport.hiringRecommendationMatrix.ifPriorityIsCultureAndRigor}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
              <span>If Budget is Constrained</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {comparisonReport.hiringRecommendationMatrix.ifBudgetIsConstrained}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
