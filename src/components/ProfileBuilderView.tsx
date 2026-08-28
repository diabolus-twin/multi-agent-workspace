import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  HelpCircle, 
  Clock, 
  Cpu, 
  Layers, 
  Quote, 
  ExternalLink,
  ShieldCheck,
  Search,
  UploadCloud
} from 'lucide-react';
import { CandidateProfile, ExtractedClaim } from '../types';

interface ProfileBuilderViewProps {
  profile?: CandidateProfile;
  candidateName: string;
  onInspectQuote: (quote: string, source: 'resume' | 'transcript') => void;
  onRunProfileBuilder: () => void;
  onOpenUploadModal?: () => void;
  isLoading: boolean;
}

export const ProfileBuilderView: React.FC<ProfileBuilderViewProps> = ({
  profile,
  candidateName,
  onInspectQuote,
  onRunProfileBuilder,
  onOpenUploadModal,
  isLoading
}) => {
  if (!profile) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Candidate Profile Builder (Step 1)</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6 leading-relaxed">
          The Profile Builder ingests the candidate resume, interview transcript, and job application to extract verified facts, audit assertions, and uncover contradictions for the 4-agent panel.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition inline-flex items-center justify-center space-x-2"
            >
              <UploadCloud className="w-4 h-4 text-sky-400" />
              <span>Upload PDF Files</span>
            </button>
          )}
          <button
            id="trigger-profile-builder-btn"
            onClick={onRunProfileBuilder}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition disabled:opacity-50 inline-flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Extracting Claims & Facts...' : `Build Profile for ${candidateName}`}</span>
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: ExtractedClaim['verificationStatus']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertOctagon className="w-3 h-3" />
            <span>CONTRADICTED</span>
          </span>
        );
      case 'QUESTIONABLE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3" />
            <span>QUESTIONABLE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <HelpCircle className="w-3 h-3" />
            <span>UNSUBSTANTIATED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="candidate-profile-view">
      
      {/* Top Banner: Profile Overview */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Extracted Shared Dossier</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {profile.candidateName}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {profile.summary}
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-xl shrink-0 text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Experience Level
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {profile.yearsOfExperience}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Matrix: Verified vs Claimed Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Verified Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Technical Depth</h3>
              <p className="text-xs text-slate-500">Skills confirmed with concrete implementation details in transcript</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.technicalSkills.verified.map((skill, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-medium flex items-center space-x-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{skill}</span>
              </span>
            ))}
            {profile.technicalSkills.verified.length === 0 && (
              <p className="text-xs text-slate-400 italic">No skills verified with direct implementation depth.</p>
            )}
          </div>
        </div>

        {/* Claimed Only / Contradicted Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Resume Claims Lacking Live Evidence</h3>
              <p className="text-xs text-slate-500">Resume items that proved to be synthetic, unverified, or disclaimed</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.technicalSkills.claimedOnly.map((skill, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium flex items-center space-x-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{skill}</span>
              </span>
            ))}
            {profile.technicalSkills.claimedOnly.length === 0 && (
              <p className="text-xs text-slate-400 italic">All claimed skills were verified with interview evidence.</p>
            )}
          </div>
        </div>

      </div>

      {/* Extracted Claims Verification Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Claim vs. Evidence Cross-Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Forensic matching of resume assertions against verbatim interview statements
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full">
            {profile.extractedClaims.length} Claims Indexed
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {profile.extractedClaims.map((claim) => (
            <div key={claim.id} className="p-5 hover:bg-slate-50/70 transition">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {claim.topic}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Source: <span className="uppercase text-slate-700 font-semibold">{claim.claimSource}</span>
                  </span>
                </div>
                <div>
                  {getStatusBadge(claim.verificationStatus)}
                </div>
              </div>

              {/* Claim Text */}
              <div className="mt-3">
                <div className="text-xs font-bold text-slate-700">Assertion Made:</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  "{claim.claimText}"
                </div>
              </div>

              {/* Clickable Quote Snippet */}
              <div className="mt-2.5 bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2">
                  <Quote className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-slate-800 italic">
                    "{claim.quote}"
                  </p>
                </div>
                <button
                  onClick={() => onInspectQuote(claim.quote, claim.claimSource)}
                  className="shrink-0 text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 hover:underline"
                  title="Inspect verbatim quote in document"
                >
                  <span>Trace</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Verification Notes */}
              <div className="mt-2.5 text-xs text-slate-600 pl-2 border-l-2 border-slate-300">
                <span className="font-bold text-slate-700">Audit Finding:</span> {claim.verificationNotes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags & Missing Information Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Potential Red Flags */}
        <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-rose-200/80">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-rose-950">Detected Red Flags & Contradictions</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-rose-900">
            {profile.potentialRedFlags.map((flag, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{flag}</span>
              </li>
            ))}
            {profile.potentialRedFlags.length === 0 && (
              <li className="text-slate-500 italic">No critical contradictions detected.</li>
            )}
          </ul>
        </div>

        {/* Missing / Unclear Information */}
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-amber-200/80">
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-amber-950">Unclear or Missing Evidence (Rule: Do Not Assume)</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-amber-900">
            {profile.missingInformation.map((item, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
            {profile.missingInformation.length === 0 && (
              <li className="text-slate-500 italic">All necessary domain items were covered in the transcript.</li>
            )}
          </ul>
        </div>

      </div>

    </div>
  );
};
