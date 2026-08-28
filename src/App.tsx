/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  JobDescription, 
  CandidateDossier, 
  CandidateEvaluationSession, 
  AgentPersonaId, 
  ComparisonReport,
  IndependentEvaluation
} from './types';
import { DEFAULT_JOB_DESCRIPTION, DEFAULT_CANDIDATES } from './data/defaultDatasets';
import { Header } from './components/Header';
import { PipelineControlBar, PipelineStage } from './components/PipelineControlBar';
import { ProfileBuilderView } from './components/ProfileBuilderView';
import { IndependentAgentsView } from './components/IndependentAgentsView';
import { DebateStudioView } from './components/DebateStudioView';
import { FinalDecisionReportView } from './components/FinalDecisionReportView';
import { CandidateComparisonView } from './components/CandidateComparisonView';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { RubricModal } from './components/RubricModal';
import { DossierEditorModal } from './components/DossierEditorModal';
import { SettingsModal } from './components/SettingsModal';
import { UploadDocumentModal } from './components/UploadDocumentModal';

export default function App() {
  // Global Data State
  const [jobDescription, setJobDescription] = useState<JobDescription>(DEFAULT_JOB_DESCRIPTION);
  const [candidates, setCandidates] = useState<CandidateDossier[]>(DEFAULT_CANDIDATES);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(DEFAULT_CANDIDATES[0].id);

  // View & Pipeline Navigation
  const [activeView, setActiveView] = useState<'pipeline' | 'debate_studio' | 'head_to_head' | 'dossiers'>('pipeline');
  const [currentPipelineStage, setCurrentPipelineStage] = useState<PipelineStage>('profile');

  // Candidate Evaluation Sessions
  const [sessions, setSessions] = useState<Record<string, CandidateEvaluationSession>>({
    candidate_a: {
      candidateId: 'candidate_a',
      status: 'IDLE',
      executionLogs: []
    },
    candidate_b: {
      candidateId: 'candidate_b',
      status: 'IDLE',
      executionLogs: []
    }
  });

  // Comparison State
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | undefined>();

  // Modals & Drawers
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [quoteSource, setQuoteSource] = useState<'resume' | 'transcript'>('transcript');
  
  const [isRubricModalOpen, setIsRubricModalOpen] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // API Headers helper for custom API keys & model selection
  const getApiHeaders = () => {
    const apiKey = localStorage.getItem('gemini_custom_api_key') || '';
    const model = localStorage.getItem('gemini_selected_model') || 'gemini-3.7-flash';
    return {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
      'x-gemini-model': model,
    };
  };

  // Audio TTS Global State
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Loading & Running State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePersonaRunning, setActivePersonaRunning] = useState<AgentPersonaId | 'ALL' | null>(null);

  // Helpers
  const currentCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const currentSession = sessions[selectedCandidateId] || {
    candidateId: selectedCandidateId,
    status: 'IDLE',
    executionLogs: []
  };

  const updateSession = (candidateId: string, partial: Partial<CandidateEvaluationSession>) => {
    setSessions(prev => ({
      ...prev,
      [candidateId]: {
        ...(prev[candidateId] || { candidateId, status: 'IDLE', executionLogs: [] }),
        ...partial
      }
    }));
  };

  // Inspect quote handler
  const handleInspectQuote = (quote: string, source: 'resume' | 'transcript' = 'transcript') => {
    setSelectedQuote(quote);
    setQuoteSource(source);
    setIsEvidenceDrawerOpen(true);
  };

  // -------------------------------------------------------------
  // Pipeline Handlers
  // -------------------------------------------------------------
  
  // 1. Profile Builder
  const handleRunProfileBuilder = async () => {
    setIsLoading(true);
    updateSession(currentCandidate.id, { status: 'BUILDING_PROFILE' });

    try {
      const res = await fetch('/api/profile-builder', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          jobDescription,
          candidate: currentCandidate
        })
      });

      if (!res.ok) throw new Error('Profile builder request failed');
      const data = await res.json();
      
      updateSession(currentCandidate.id, {
        profile: data.profile,
        status: 'IDLE'
      });
      return data.profile;
    } catch (err: any) {
      console.error(err);
      updateSession(currentCandidate.id, {
        status: 'ERROR',
        errorMessage: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Single Agent Run
  const handleRunSingleAgent = async (personaId: AgentPersonaId, profileOverride?: any) => {
    setIsLoading(true);
    setActivePersonaRunning(personaId);

    const profile = profileOverride || currentSession.profile;

    try {
      const res = await fetch('/api/agent-evaluate', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          personaId,
          candidate: currentCandidate,
          jobDescription,
          profile
        })
      });

      if (!res.ok) throw new Error(`Evaluation failed for ${personaId}`);
      const data = await res.json();

      setSessions(prev => {
        const existing = prev[currentCandidate.id] || { candidateId: currentCandidate.id, status: 'IDLE', executionLogs: [] };
        const updatedEvals = {
          ...(existing.independentEvaluations || {}),
          [personaId]: data.evaluation
        };
        return {
          ...prev,
          [currentCandidate.id]: {
            ...existing,
            independentEvaluations: updatedEvals
          }
        };
      });

      return data.evaluation;
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setActivePersonaRunning(null);
    }
  };

  // 2. All 4 Agents in Parallel
  const handleRunAllAgents = async (profileOverride?: any) => {
    setIsLoading(true);
    setActivePersonaRunning('ALL');
    updateSession(currentCandidate.id, { status: 'RUNNING_AGENTS' });

    const personas: AgentPersonaId[] = ['technical', 'hr', 'hiring_manager', 'skeptic'];
    const profile = profileOverride || currentSession.profile;

    try {
      const promises = personas.map(p => 
        fetch('/api/agent-evaluate', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            personaId: p,
            candidate: currentCandidate,
            jobDescription,
            profile
          })
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      const evalsMap: Partial<Record<AgentPersonaId, IndependentEvaluation>> = {};

      results.forEach((r, idx) => {
        if (r.evaluation) {
          evalsMap[personas[idx]] = r.evaluation;
        }
      });

      updateSession(currentCandidate.id, {
        independentEvaluations: evalsMap,
        status: 'IDLE'
      });

      return evalsMap;
    } catch (err: any) {
      console.error(err);
      updateSession(currentCandidate.id, {
        status: 'ERROR',
        errorMessage: err.message
      });
    } finally {
      setIsLoading(false);
      setActivePersonaRunning(null);
    }
  };

  // 3. Debate Round
  const handleGenerateDebateRound = async (roundNumber: number, evalsOverride?: any) => {
    setIsLoading(true);
    updateSession(currentCandidate.id, { status: 'DEBATING' });

    const independentEvaluations = evalsOverride || currentSession.independentEvaluations;

    try {
      const res = await fetch('/api/debate-round', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          candidate: currentCandidate,
          independentEvaluations,
          roundNumber,
          previousRounds: currentSession.debateRounds || [],
          jobDescription
        })
      });

      if (!res.ok) throw new Error('Debate round generation failed');
      const data = await res.json();

      setSessions(prev => {
        const existing = prev[currentCandidate.id] || { candidateId: currentCandidate.id, status: 'IDLE', executionLogs: [] };
        const existingRounds = existing.debateRounds || [];
        const filteredRounds = existingRounds.filter(r => r.roundNumber !== roundNumber);
        return {
          ...prev,
          [currentCandidate.id]: {
            ...existing,
            debateRounds: [...filteredRounds, data.debateRound],
            status: 'IDLE'
          }
        };
      });

      return data.debateRound;
    } catch (err: any) {
      console.error(err);
      updateSession(currentCandidate.id, {
        status: 'ERROR',
        errorMessage: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Reasoned Synthesis Decision
  const handleRunSynthesis = async (evalsOverride?: any, debateRoundsOverride?: any, profileOverride?: any) => {
    setIsLoading(true);
    updateSession(currentCandidate.id, { status: 'DECIDING' });

    const independentEvaluations = evalsOverride || currentSession.independentEvaluations;
    const debateRounds = debateRoundsOverride || currentSession.debateRounds;
    const profile = profileOverride || currentSession.profile;

    try {
      const res = await fetch('/api/final-decision', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          candidate: currentCandidate,
          independentEvaluations,
          debateRounds,
          jobDescription,
          profile
        })
      });

      if (!res.ok) throw new Error('Final decision synthesis failed');
      const data = await res.json();

      updateSession(currentCandidate.id, {
        finalDecision: data.finalDecision,
        status: 'COMPLETED'
      });

      return data.finalDecision;
    } catch (err: any) {
      console.error(err);
      updateSession(currentCandidate.id, {
        status: 'ERROR',
        errorMessage: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Full Pipeline Auto-Run
  const handleRunFullPipeline = async () => {
    setIsLoading(true);
    try {
      // Step 1: Profile Builder
      setCurrentPipelineStage('profile');
      const profile = await handleRunProfileBuilder();

      // Step 2: 4 Isolated Agents
      setCurrentPipelineStage('agents');
      const evals = await handleRunAllAgents(profile);

      // Step 3: Debate Step
      setCurrentPipelineStage('debate');
      const round1 = await handleGenerateDebateRound(1, evals);

      // Step 4 & 5: Decision Synthesis & Report
      setCurrentPipelineStage('report');
      await handleRunSynthesis(evals, [round1], profile);

    } catch (err) {
      console.error('Full pipeline failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute current active step
  const handleRunCurrentStep = () => {
    switch (currentPipelineStage) {
      case 'profile':
        handleRunProfileBuilder();
        break;
      case 'agents':
        handleRunAllAgents();
        break;
      case 'debate':
        handleGenerateDebateRound((currentSession.debateRounds?.length || 0) + 1);
        break;
      case 'decision':
      case 'report':
        handleRunSynthesis();
        break;
    }
  };

  // Reset session
  const handleResetSession = () => {
    updateSession(currentCandidate.id, {
      profile: undefined,
      independentEvaluations: undefined,
      debateRounds: undefined,
      finalDecision: undefined,
      status: 'IDLE'
    });
    setCurrentPipelineStage('profile');
  };

  // Head to Head Comparison Run
  const handleRunComparison = async () => {
    setIsLoading(true);
    try {
      const candidateA = candidates.find(c => c.id === 'candidate_a') || candidates[0];
      const candidateB = candidates.find(c => c.id === 'candidate_b') || candidates[1] || candidates[0];

      const res = await fetch('/api/compare-candidates', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          candidateA,
          candidateB,
          sessionA: sessions['candidate_a'],
          sessionB: sessions['candidate_b'],
          jobDescription
        })
      });

      if (!res.ok) throw new Error('Head to head comparison failed');
      const data = await res.json();
      setComparisonReport(data.comparison);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save/Add Candidate Handlers
  const handleSaveCandidate = (updated: CandidateDossier) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleAddCandidate = (newCand: CandidateDossier) => {
    setCandidates(prev => [...prev, newCand]);
    setSelectedCandidateId(newCand.id);
  };

  const handleIngestAndEvaluate = (candidate: CandidateDossier, jobDesc?: JobDescription) => {
    setCandidates(prev => {
      const exists = prev.some(c => c.id === candidate.id);
      if (exists) {
        return prev.map(c => c.id === candidate.id ? candidate : c);
      }
      return [...prev, candidate];
    });

    if (jobDesc) {
      setJobDescription(jobDesc);
    }

    setSelectedCandidateId(candidate.id);
    setActiveView('pipeline');
    setCurrentPipelineStage('profile');

    // Trigger profile builder for this new candidate
    setTimeout(() => {
      handleRunProfileBuilder();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        candidates={candidates}
        selectedCandidateId={selectedCandidateId}
        onSelectCandidate={(id) => {
          setSelectedCandidateId(id);
        }}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          if (view === 'dossiers') {
            setIsDossierModalOpen(true);
          }
        }}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onOpenRubricModal={() => setIsRubricModalOpen(true)}
        onOpenDossierModal={() => setIsDossierModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Deliberation Pipeline Controls Bar (visible in pipeline and debate studio) */}
      {activeView === 'pipeline' && (
        <PipelineControlBar
          currentStage={currentPipelineStage}
          onSelectStage={setCurrentPipelineStage}
          session={currentSession}
          candidateName={currentCandidate.name}
          onRunFullPipeline={handleRunFullPipeline}
          onRunCurrentStep={handleRunCurrentStep}
          onResetSession={handleResetSession}
          isLoading={isLoading}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: Pipeline View with Stage Tabs */}
        {activeView === 'pipeline' && (
          <div>
            {currentPipelineStage === 'profile' && (
              <ProfileBuilderView
                profile={currentSession.profile}
                candidateName={currentCandidate.name}
                onInspectQuote={handleInspectQuote}
                onRunProfileBuilder={handleRunProfileBuilder}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                isLoading={isLoading}
              />
            )}

            {currentPipelineStage === 'agents' && (
              <IndependentAgentsView
                evaluations={currentSession.independentEvaluations}
                onRunAllAgents={handleRunAllAgents}
                onRunSingleAgent={handleRunSingleAgent}
                onInspectQuote={handleInspectQuote}
                isLoading={isLoading}
                activePersonaRunning={activePersonaRunning}
              />
            )}

            {currentPipelineStage === 'debate' && (
              <DebateStudioView
                debateRounds={currentSession.debateRounds}
                candidate={currentCandidate}
                onGenerateDebateRound={handleGenerateDebateRound}
                onInspectQuote={handleInspectQuote}
                isLoading={isLoading}
                isAudioEnabled={isAudioEnabled}
                onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
              />
            )}

            {(currentPipelineStage === 'decision' || currentPipelineStage === 'report') && (
              <FinalDecisionReportView
                finalDecision={currentSession.finalDecision}
                candidate={currentCandidate}
                onInspectQuote={handleInspectQuote}
                onRunSynthesis={handleRunSynthesis}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {/* VIEW 2: Dedicated Debate Studio */}
        {activeView === 'debate_studio' && (
          <DebateStudioView
            debateRounds={currentSession.debateRounds}
            candidate={currentCandidate}
            onGenerateDebateRound={handleGenerateDebateRound}
            onInspectQuote={handleInspectQuote}
            isLoading={isLoading}
            isAudioEnabled={isAudioEnabled}
            onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
          />
        )}

        {/* VIEW 3: Head-to-Head Comparison */}
        {activeView === 'head_to_head' && (
          <CandidateComparisonView
            comparisonReport={comparisonReport}
            candidateA={candidates.find(c => c.id === 'candidate_a') || candidates[0]}
            candidateB={candidates.find(c => c.id === 'candidate_b') || candidates[1] || candidates[0]}
            sessionA={sessions['candidate_a']}
            sessionB={sessions['candidate_b']}
            onRunComparison={handleRunComparison}
            onInspectQuote={handleInspectQuote}
            isLoading={isLoading}
          />
        )}

        {/* VIEW 4: Job Description & Dossiers Overview */}
        {activeView === 'dossiers' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Job Description & Benchmark Dossiers</h2>
                <p className="text-xs text-slate-500">Benchmark datasets pre-loaded from problem statement</p>
              </div>
              <button
                onClick={() => setIsDossierModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                Open Full Dossier Editor
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase">Target Role:</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">{jobDescription.title}</div>
                <div className="text-xs text-slate-600 mt-2 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
                  {jobDescription.rawText}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map((cand) => (
                  <div key={cand.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                      <span className="text-xs font-medium text-slate-500">{cand.sourceFiles?.resumeFileName || 'Resume'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                      {cand.resumeText}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedCandidateId(cand.id);
                          setActiveView('pipeline');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Select & Run Pipeline →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Evidence & Quote Inspector Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        selectedQuote={selectedQuote}
        quoteSource={quoteSource}
        candidate={currentCandidate}
      />

      {/* Judging Rubric Modal */}
      <RubricModal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
      />

      {/* Dossier Editor Modal */}
      <DossierEditorModal
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          if (activeView === 'dossiers') {
            setActiveView('pipeline');
          }
        }}
        jobDescription={jobDescription}
        onSaveJobDescription={setJobDescription}
        candidates={candidates}
        onSaveCandidate={handleSaveCandidate}
        onAddCandidate={handleAddCandidate}
      />

      {/* API Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* PDF Document Ingestion Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onIngestAndEvaluate={handleIngestAndEvaluate}
      />

    </div>
  );
}
