import React from 'react';
import { 
  Cpu, 
  HeartHandshake, 
  Briefcase, 
  Search, 
  Quote, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  ExternalLink,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AgentPersonaId, IndependentEvaluation, RecommendationType } from '../types';
import { AGENT_PERSONAS } from '../data/defaultDatasets';

interface IndependentAgentsViewProps {
  evaluations?: Partial<Record<AgentPersonaId, IndependentEvaluation>>;
  onRunAllAgents: () => void;
  onRunSingleAgent: (personaId: AgentPersonaId) => void;
  onInspectQuote: (quote: string, source: 'resume' | 'transcript') => void;
  isLoading: boolean;
  activePersonaRunning?: AgentPersonaId | 'ALL' | null;
}

export const IndependentAgentsView: React.FC<IndependentAgentsViewProps> = ({
  evaluations = {},
  onRunAllAgents,
  onRunSingleAgent,
  onInspectQuote,
  isLoading,
  activePersonaRunning
}) => {
  const personas: AgentPersonaId[] = ['technical', 'hr', 'hiring_manager', 'skeptic'];

  const getRecommendationBadge = (rec?: RecommendationType) => {
    if (!rec) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
          Pending Run
        </span>
      );
    }

    switch (rec) {
      case 'STRONG_HIRE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
            STRONG HIRE
          </span>
        );
      case 'HIRE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            HIRE
          </span>
        );
      case 'LEAN_HIRE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
            LEAN HIRE
          </span>
        );
      case 'LEAN_REJECT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            LEAN REJECT
          </span>
        );
      case 'STRONG_REJECT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
            STRONG REJECT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            INSUFFICIENT INFO
          </span>
        );
    }
  };

  const getPersonaIcon = (id: AgentPersonaId) => {
    switch (id) {
      case 'technical':
        return <Cpu className="w-5 h-5" />;
      case 'hr':
        return <HeartHandshake className="w-5 h-5" />;
      case 'hiring_manager':
        return <Briefcase className="w-5 h-5" />;
      case 'skeptic':
        return <Search className="w-5 h-5" />;
    }
  };

  const completedCount = Object.keys(evaluations).length;

  return (
    <div className="space-y-6" id="independent-agents-view">
      
      {/* Rule & Isolation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Strict Isolation Rule Enforced</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Phase 2: Independent 4-Agent Evaluations
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Each agent operates in strict isolation with separate LLM system prompts and zero awareness of other agents' conclusions. Every evaluation is grounded in direct quote citations.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400 font-medium">Evaluations Ready</div>
            <div className="text-sm font-bold text-white">{completedCount} / 4 Personas</div>
          </div>
          <button
            id="run-all-agents-btn"
            onClick={onRunAllAgents}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading && activePersonaRunning === 'ALL' ? 'Running All 4 Agents in Parallel...' : 'Run All 4 Agents in Parallel'}</span>
          </button>
        </div>
      </div>

      {/* 4 Agent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {personas.map((personaId) => {
          const config = AGENT_PERSONAS[personaId];
          const evaluation = evaluations[personaId];
          const isThisRunning = isLoading && (activePersonaRunning === personaId || activePersonaRunning === 'ALL');

          return (
            <div
              key={personaId}
              id={`agent-card-${personaId}`}
              className={`bg-white rounded-2xl border transition shadow-xs flex flex-col justify-between ${
                evaluation 
                  ? 'border-slate-300 hover:shadow-md' 
                  : 'border-slate-200 opacity-90'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.avatarColor} text-white flex items-center justify-center shadow-xs`}>
                      {getPersonaIcon(personaId)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{config.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bgLight}`}>
                          {config.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {config.roleTitle}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    {getRecommendationBadge(evaluation?.recommendation)}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {config.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-4">
                {evaluation ? (
                  <>
                    {/* Score Bar & Confidence */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Domain Score
                        </div>
                        <div className="flex items-baseline space-x-1.5 mt-0.5">
                          <span className="text-xl font-black text-slate-900">{evaluation.domainScore}</span>
                          <span className="text-xs text-slate-400 font-medium">/ 100</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Confidence Level
                        </div>
                        <div className="flex items-baseline space-x-1.5 mt-0.5">
                          <span className="text-xl font-black text-indigo-700">{evaluation.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning Summary */}
                    <div>
                      <div className="text-xs font-bold text-slate-800 mb-1">Independent Assessment:</div>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                        {evaluation.reasoningSummary}
                      </p>
                    </div>

                    {/* Key Strengths with Quotes */}
                    {evaluation.keyStrengths.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Identified Strengths (Evidence-Backed)</span>
                        </div>
                        <div className="space-y-2">
                          {evaluation.keyStrengths.map((str) => (
                            <div key={str.id} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
                              <div className="font-bold text-emerald-950">{str.title}</div>
                              <div className="text-emerald-900 text-[11px] mt-0.5">{str.explanation}</div>
                              {str.quote && (
                                <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                                  <span className="font-mono text-[11px] text-emerald-950 italic truncate">
                                    "{str.quote}"
                                  </span>
                                  <button
                                    onClick={() => onInspectQuote(str.quote, str.source)}
                                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold shrink-0 flex items-center space-x-0.5"
                                  >
                                    <span>Verify</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Critical Concerns with Severity */}
                    {evaluation.criticalConcerns.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-rose-800 flex items-center space-x-1 mb-2">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Critical Concerns & Risks</span>
                        </div>
                        <div className="space-y-2">
                          {evaluation.criticalConcerns.map((con) => (
                            <div key={con.id} className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-200 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-rose-950">{con.title}</span>
                                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                  con.severity === 'FATAL' 
                                    ? 'bg-rose-700 text-white' 
                                    : con.severity === 'HIGH' 
                                    ? 'bg-rose-200 text-rose-900' 
                                    : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {con.severity}
                                </span>
                              </div>
                              <div className="text-rose-900 text-[11px] mt-0.5">{con.explanation}</div>
                              {con.quote && (
                                <div className="mt-1.5 pt-1.5 border-t border-rose-200/60 flex items-center justify-between gap-2">
                                  <span className="font-mono text-[11px] text-rose-950 italic truncate">
                                    "{con.quote}"
                                  </span>
                                  <button
                                    onClick={() => onInspectQuote(con.quote, con.source)}
                                    className="text-[10px] text-rose-700 hover:text-rose-900 font-bold shrink-0 flex items-center space-x-0.5"
                                  >
                                    <span>Verify</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unclear or Missing Info */}
                    {evaluation.unclearOrMissingInfo && evaluation.unclearOrMissingInfo.length > 0 && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-700 flex items-center space-x-1">
                          <HelpCircle className="w-3 h-3 text-slate-500" />
                          <span>Missing Evidence (Noted during audit):</span>
                        </div>
                        <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                          {evaluation.unclearOrMissingInfo.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-xs text-slate-400 mb-3">
                      This agent has not yet generated its isolated evaluation.
                    </p>
                    <button
                      id={`run-single-agent-${personaId}-btn`}
                      onClick={() => onRunSingleAgent(personaId)}
                      disabled={isLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition disabled:opacity-50 inline-flex items-center space-x-1.5"
                    >
                      <Play className="w-3 h-3 text-slate-600" />
                      <span>{isThisRunning ? 'Evaluating...' : `Run ${config.name}`}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-[11px] text-slate-500">
                <span>Focus: {config.focusAreas[0]}</span>
                {evaluation && (
                  <button
                    onClick={() => onRunSingleAgent(personaId)}
                    disabled={isLoading}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-evaluate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
