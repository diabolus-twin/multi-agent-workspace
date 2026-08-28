import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Plus, 
  Save, 
  RotateCcw, 
  Check, 
  Briefcase, 
  UploadCloud,
  Layers,
  UserPlus
} from 'lucide-react';
import { JobDescription, CandidateDossier } from '../types';

interface DossierEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDescription: JobDescription;
  onSaveJobDescription: (jd: JobDescription) => void;
  candidates: CandidateDossier[];
  onSaveCandidate: (candidate: CandidateDossier) => void;
  onAddCandidate: (candidate: CandidateDossier) => void;
}

export const DossierEditorModal: React.FC<DossierEditorModalProps> = ({
  isOpen,
  onClose,
  jobDescription,
  onSaveJobDescription,
  candidates,
  onSaveCandidate,
  onAddCandidate
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'jd' | string>('jd');
  const [jdText, setJdText] = useState<string>(jobDescription.rawText);
  const [jdTitle, setJdTitle] = useState<string>(jobDescription.title);
  
  // Selected candidate state
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDossier>(candidates[0]);
  const [candName, setCandName] = useState<string>(candidates[0]?.name || '');
  const [candRole, setCandRole] = useState<string>(candidates[0]?.appliedRole || '');
  const [candResume, setCandResume] = useState<string>(candidates[0]?.resumeText || '');
  const [candTranscript, setCandTranscript] = useState<string>(candidates[0]?.transcriptText || '');

  const [isSavedBanner, setIsSavedBanner] = useState<boolean>(false);

  const handleSelectCandidateTab = (cand: CandidateDossier) => {
    setActiveTab(cand.id);
    setSelectedCandidate(cand);
    setCandName(cand.name);
    setCandRole(cand.appliedRole);
    setCandResume(cand.resumeText);
    setCandTranscript(cand.transcriptText);
  };

  const handleSaveCurrent = () => {
    if (activeTab === 'jd') {
      onSaveJobDescription({
        ...jobDescription,
        title: jdTitle,
        rawText: jdText
      });
    } else {
      onSaveCandidate({
        ...selectedCandidate,
        name: candName,
        appliedRole: candRole,
        resumeText: candResume,
        transcriptText: candTranscript
      });
    }

    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 2500);
  };

  const handleCreateNewCandidate = () => {
    const newId = `custom_candidate_${Date.now()}`;
    const newCandidate: CandidateDossier = {
      id: newId,
      name: 'New Candidate',
      appliedRole: 'Senior AI Platform Engineer',
      resumeText: 'Paste or write custom resume here...',
      transcriptText: 'Paste or write custom interview transcript here...'
    };
    onAddCandidate(newCandidate);
    handleSelectCandidateTab(newCandidate);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 flex flex-col max-h-[90vh]"
        id="dossier-editor-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Job Description & Candidate Dossier Manager
              </h2>
              <p className="text-xs text-slate-500">
                Inspect or edit pre-loaded benchmark files, or input custom resumes and interview transcripts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-3 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('jd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'jd'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Description</span>
          </button>

          {candidates.map((cand) => (
            <button
              key={cand.id}
              onClick={() => handleSelectCandidateTab(cand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === cand.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{cand.name}</span>
            </button>
          ))}

          <button
            onClick={handleCreateNewCandidate}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Custom Candidate</span>
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {activeTab === 'jd' ? (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Complete Job Description Text</label>
                <textarea
                  rows={14}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Applied Role</label>
                  <input
                    type="text"
                    value={candRole}
                    onChange={(e) => setCandRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Resume Text</label>
                <textarea
                  rows={8}
                  value={candResume}
                  onChange={(e) => setCandResume(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Transcript Text (with timestamps)</label>
                <textarea
                  rows={10}
                  value={candTranscript}
                  onChange={(e) => setCandTranscript(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            {isSavedBanner && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Changes successfully updated!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              id="save-dossier-changes-btn"
              onClick={handleSaveCurrent}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Dossier</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
