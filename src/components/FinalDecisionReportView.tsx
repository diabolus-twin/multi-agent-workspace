import React from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  HelpCircle, 
  Quote, 
  ExternalLink, 
  Award, 
  Download, 
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Printer,
  FileCheck2,
  Users
} from 'lucide-react';
import { FinalDecision, CandidateDossier } from '../types';
import { AGENT_PERSONAS } from '../data/defaultDatasets';

interface FinalDecisionReportViewProps {
  finalDecision?: FinalDecision;
  candidate: CandidateDossier;
  onInspectQuote: (quote: string, source: 'resume' | 'transcript') => void;
  onRunSynthesis: () => void;
  isLoading: boolean;
}

export const FinalDecisionReportView: React.FC<FinalDecisionReportViewProps> = ({
  finalDecision,
  candidate,
  onInspectQuote,
  onRunSynthesis,
  isLoading
}) => {
  if (!finalDecision) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Final Reasoned Decision Step (Step 4 & 5)</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          The Lead Arbiter synthesizes the 4 independent agent evaluations and cross-examination debate to produce an evidence-weighted hiring verdict with full audit traceability.
        </p>
        <button
          id="run-synthesis-btn"
          onClick={onRunSynthesis}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isLoading ? 'Synthesizing Verdict...' : 'Synthesize Final Deliberation Report'}</span>
        </button>
      </div>
    );
  }

  const isHire = finalDecision.finalRecommendation === 'STRONG_HIRE' || finalDecision.finalRecommendation === 'HIRE';

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalDecision, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Deliberation_Report_${candidate.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="final-decision-report-view">
      
      {/* Executive Decision Banner */}
      <div className={`rounded-2xl p-6 text-white shadow-md border ${
        isHire 
          ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/40' 
          : 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 border-rose-500/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isHire ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
              }`}>
                {finalDecision.finalRecommendation.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-300 font-bold px-2.5 py-0.5 rounded-full bg-white/10">
                Consensus: {finalDecision.consensusType.replace('_', ' ')}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              {finalDecision.hiringVerdictTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {finalDecision.synthesisReasoning}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-black/40 border border-white/10 px-5 py-3 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Panel Confidence
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {finalDecision.overallConfidence}%
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <button
                onClick={exportJSON}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                title="Export JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                title="Print Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* "Why Not Simple Average" Callout Box (Core requirement of challenge) */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm border border-indigo-700">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-500/20 text-amber-300 rounded-xl border border-indigo-400/30 shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Methodological Rigor: Evidence Weighting vs Arithmetic Averaging
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              Why Non-Linear Evidence Synthesis Was Required
            </div>
            <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
              {finalDecision.whyNotSimpleAverage}
            </p>
          </div>
        </div>
      </div>

      {/* Weighted Dimension Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Technical Rigor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Technical Rigor</span>
            <span className="text-xs font-semibold text-slate-400">Weight: {(finalDecision.dimensionScores.technicalRigor.weight * 100).toFixed(0)}%</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {finalDecision.dimensionScores.technicalRigor.score}/100
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full" 
              style={{ width: `${finalDecision.dimensionScores.technicalRigor.score}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
            {finalDecision.dimensionScores.technicalRigor.keyFinding}
          </p>
        </div>

        {/* Cultural Fit & Honesty */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Culture & Integrity</span>
            <span className="text-xs font-semibold text-slate-400">Weight: {(finalDecision.dimensionScores.culturalFitAndHonesty.weight * 100).toFixed(0)}%</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {finalDecision.dimensionScores.culturalFitAndHonesty.score}/100
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full" 
              style={{ width: `${finalDecision.dimensionScores.culturalFitAndHonesty.score}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
            {finalDecision.dimensionScores.culturalFitAndHonesty.keyFinding}
          </p>
        </div>

        {/* Business Value ROI */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Delivery Velocity & ROI</span>
            <span className="text-xs font-semibold text-slate-400">Weight: {(finalDecision.dimensionScores.businessValueROI.weight * 100).toFixed(0)}%</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {finalDecision.dimensionScores.businessValueROI.score}/100
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${finalDecision.dimensionScores.businessValueROI.score}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
            {finalDecision.dimensionScores.businessValueROI.keyFinding}
          </p>
        </div>

        {/* Skeptic Risk Penalty */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Audit Risk Penalty</span>
            <span className="text-xs font-semibold text-slate-400">Weight: {(finalDecision.dimensionScores.skepticRiskAssessment.weight * 100).toFixed(0)}%</span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            -{finalDecision.dimensionScores.skepticRiskAssessment.riskPenalty} pts
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-rose-500 h-1.5 rounded-full" 
              style={{ width: `${finalDecision.dimensionScores.skepticRiskAssessment.riskPenalty}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
            {finalDecision.dimensionScores.skepticRiskAssessment.keyFinding}
          </p>
        </div>
      </div>

      {/* Strengths and Risks Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Conclusive Strengths */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conclusive Verified Strengths</h3>
              <p className="text-xs text-slate-500">Substantiated by transcript quotes with zero contradictions</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {finalDecision.conclusiveStrengths.map((str, i) => (
              <div key={i} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
                <div className="font-bold text-emerald-950">{str.point}</div>
                {str.backedByQuote && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] text-emerald-950 italic">
                      "{str.backedByQuote}"
                    </span>
                    <button
                      onClick={() => onInspectQuote(str.backedByQuote, str.source)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold shrink-0 flex items-center space-x-0.5"
                    >
                      <span>Trace</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conclusive Concerns & Mitigations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conclusive Risks & Dealbreakers</h3>
              <p className="text-xs text-slate-500">Uncovered vulnerabilities with assigned mitigation strategies</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {finalDecision.conclusiveConcerns.map((con, i) => (
              <div key={i} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">{con.risk}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                    con.severity === 'DEALBREAKER' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-900'
                  }`}>
                    {con.severity}
                  </span>
                </div>
                {con.backedByQuote && (
                  <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] text-rose-950 italic">
                      "{con.backedByQuote}"
                    </span>
                    <button
                      onClick={() => onInspectQuote(con.backedByQuote, 'transcript')}
                      className="text-[10px] text-rose-700 hover:text-rose-900 font-bold shrink-0 flex items-center space-x-0.5"
                    >
                      <span>Trace</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
                {con.suggestedMitigationOrNextAction && (
                  <div className="mt-2 text-[11px] text-slate-700 bg-white/70 p-2 rounded-lg border border-rose-200/60">
                    <span className="font-bold text-slate-800">Action/Mitigation:</span> {con.suggestedMitigationOrNextAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Unresolved Disagreements Matrix */}
      {finalDecision.unresolvedDisagreements.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Unresolved Disagreements & Arbiter Ruling</h3>
              <p className="text-xs text-slate-500">Points of contention between personas that required Lead Arbiter synthesis</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {finalDecision.unresolvedDisagreements.map((dispute, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 text-sm">{dispute.topic}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800">{dispute.personaA.name} Stance:</div>
                    <p className="text-slate-600 mt-1">{dispute.personaA.stance}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800">{dispute.personaB.name} Stance:</div>
                    <p className="text-slate-600 mt-1">{dispute.personaB.stance}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-indigo-50/80 rounded-lg border border-indigo-200 text-indigo-950">
                  <span className="font-bold text-indigo-900">Lead Arbiter Resolution:</span> {dispute.arbiterAssessment}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Follow-up Interview Questions */}
      {finalDecision.interviewFollowUpQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Follow-up Probes & Reference Checks</h3>
              <p className="text-xs text-slate-500">Targeted questions for debrief or back-channel references</p>
            </div>
          </div>
          <ol className="mt-4 space-y-2 text-xs text-slate-700 list-decimal list-inside font-medium">
            {finalDecision.interviewFollowUpQuestions.map((q, i) => (
              <li key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-slate-900">{q}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

    </div>
  );
};
