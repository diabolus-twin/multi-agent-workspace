import React from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Loader2, 
  FileSearch, 
  Users2, 
  MessageSquareCode, 
  Scale, 
  FileCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CandidateEvaluationSession } from '../types';

export type PipelineStage = 'profile' | 'agents' | 'debate' | 'decision' | 'report';

interface PipelineControlBarProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  session: CandidateEvaluationSession;
  candidateName: string;
  onRunFullPipeline: () => void;
  onRunCurrentStep: () => void;
  onResetSession: () => void;
  isLoading: boolean;
}

export const PipelineControlBar: React.FC<PipelineControlBarProps> = ({
  currentStage,
  onSelectStage,
  session,
  candidateName,
  onRunFullPipeline,
  onRunCurrentStep,
  onResetSession,
  isLoading
}) => {
  const isProfileDone = !!session.profile;
  const isAgentsDone = !!session.independentEvaluations && Object.keys(session.independentEvaluations).length === 4;
  const isDebateDone = !!session.debateRounds && session.debateRounds.length > 0;
  const isDecisionDone = !!session.finalDecision;

  const stages: { id: PipelineStage; title: string; subtitle: string; icon: React.ReactNode; isCompleted: boolean }[] = [
    {
      id: 'profile',
      title: '1. Profile Builder',
      subtitle: 'Extract Facts & Claims',
      icon: <FileSearch className="w-4 h-4" />,
      isCompleted: isProfileDone
    },
    {
      id: 'agents',
      title: '2. Independent 4-Agent LLMs',
      subtitle: 'Isolated Persona Evals',
      icon: <Users2 className="w-4 h-4" />,
      isCompleted: isAgentsDone
    },
    {
      id: 'debate',
      title: '3. Cross-Agent Debate',
      subtitle: 'Rebuttals & Position Shifts',
      icon: <MessageSquareCode className="w-4 h-4" />,
      isCompleted: isDebateDone
    },
    {
      id: 'decision',
      title: '4. Reasoned Synthesis',
      subtitle: 'Weighted Evidence Logic',
      icon: <Scale className="w-4 h-4" />,
      isCompleted: isDecisionDone
    },
    {
      id: 'report',
      title: '5. Audit & Final Report',
      subtitle: 'Quotes, Risks & Follow-ups',
      icon: <FileCheck className="w-4 h-4" />,
      isCompleted: isDecisionDone
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Active Candidate Info & Stepper */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2 font-medium">
            <span>Evaluating Candidate:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {candidateName}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">
              Status: {session.status === 'COMPLETED' ? 'Deliberation Complete' : session.status.replace('_', ' ')}
            </span>
          </div>

          {/* Breadcrumb Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {stages.map((stage, idx) => {
              const isActive = currentStage === stage.id;
              return (
                <button
                  key={stage.id}
                  id={`pipeline-step-${stage.id}`}
                  onClick={() => onSelectStage(stage.id)}
                  className={`text-left p-2 rounded-xl border transition flex flex-col justify-between ${
                    isActive
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20'
                      : stage.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50 text-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`p-1 rounded-md ${
                      isActive 
                        ? 'bg-indigo-600 text-white' 
                        : stage.isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {stage.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stage.icon}
                    </span>
                    {stage.isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                        Done
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <div className={`text-xs font-bold ${isActive ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {stage.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {stage.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
          
          {/* Step Button */}
          <button
            id="run-current-stage-btn"
            onClick={onRunCurrentStep}
            disabled={isLoading}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>Execute Step</span>
          </button>

          {/* Full Pipeline Run */}
          <button
            id="run-full-pipeline-btn"
            onClick={onRunFullPipeline}
            disabled={isLoading}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Panel...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Auto-Run Full Deliberation</span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            id="reset-simulation-btn"
            onClick={onResetSession}
            disabled={isLoading}
            title="Reset Deliberation State"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
