import React, { useState, useRef } from 'react';
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
  UserPlus,
  RefreshCw,
  FileCheck,
  Upload
} from 'lucide-react';
import { JobDescription, CandidateDossier } from '../types';
import { extractTextFromFile, extractMultipleTranscripts, extractCandidateMetadataFromText } from '../utils/pdfExtractor';

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
  const [jdLoading, setJdLoading] = useState(false);
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  
  // Selected candidate state
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDossier>(candidates[0]);
  const [candName, setCandName] = useState<string>(candidates[0]?.name || '');
  const [candRole, setCandRole] = useState<string>(candidates[0]?.appliedRole || '');
  const [candResume, setCandResume] = useState<string>(candidates[0]?.resumeText || '');
  const [candResumeFileName, setCandResumeFileName] = useState<string | null>(candidates[0]?.sourceFiles?.resumeFileName || null);
  const [candTranscript, setCandTranscript] = useState<string>(candidates[0]?.transcriptText || '');
  const [candTranscriptFileName, setCandTranscriptFileName] = useState<string | null>(candidates[0]?.sourceFiles?.transcriptFileName || null);

  const [resumeLoading, setResumeLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [isSavedBanner, setIsSavedBanner] = useState<boolean>(false);

  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const transcriptInputRef = useRef<HTMLInputElement>(null);

  const handleSelectCandidateTab = (cand: CandidateDossier) => {
    setActiveTab(cand.id);
    setSelectedCandidate(cand);
    setCandName(cand.name);
    setCandRole(cand.appliedRole);
    setCandResume(cand.resumeText);
    setCandResumeFileName(cand.sourceFiles?.resumeFileName || null);
    setCandTranscript(cand.transcriptText);
    setCandTranscriptFileName(cand.sourceFiles?.transcriptFileName || null);
  };

  const handleUploadJdPdf = async (file: File) => {
    setJdLoading(true);
    try {
      const extracted = await extractTextFromFile(file, 'job_description');
      setJdText(extracted.rawText);
      setJdFileName(file.name);
    } catch (err) {
      console.error(err);
    } finally {
      setJdLoading(false);
    }
  };

  const handleUploadResumePdf = async (file: File) => {
    setResumeLoading(true);
    try {
      const extracted = await extractTextFromFile(file, 'resume');
      setCandResume(extracted.rawText);
      setCandResumeFileName(file.name);
      
      const meta = extractCandidateMetadataFromText(extracted.rawText);
      if (meta.candidateName && (!candName || candName === 'New Candidate')) {
        setCandName(meta.candidateName);
      }
      if (meta.detectedRole && (!candRole || candRole === 'Senior AI Platform Engineer')) {
        setCandRole(meta.detectedRole);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleUploadTranscriptPdf = async (files: File[]) => {
    if (!files.length) return;
    setTranscriptLoading(true);
    try {
      if (files.length === 1) {
        const extracted = await extractTextFromFile(files[0], 'transcript');
        setCandTranscript(extracted.rawText);
        setCandTranscriptFileName(files[0].name);
      } else {
        const { combinedText } = await extractMultipleTranscripts(files);
        setCandTranscript(combinedText);
        setCandTranscriptFileName(files.map(f => f.name).join(', '));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTranscriptLoading(false);
    }
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
        transcriptText: candTranscript,
        sourceFiles: {
          resumeFileName: candResumeFileName || selectedCandidate.sourceFiles?.resumeFileName || 'Resume.pdf',
          transcriptFileName: candTranscriptFileName || selectedCandidate.sourceFiles?.transcriptFileName || 'Transcript.pdf'
        }
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
      appliedRole: 'Senior Distributed Systems Engineer',
      resumeText: 'Paste or upload resume PDF here...',
      transcriptText: 'Paste or upload interview transcript PDF here...',
      sourceFiles: {
        resumeFileName: 'Candidate_Resume.pdf',
        transcriptFileName: 'Interview_Transcript.pdf'
      }
    };
    onAddCandidate(newCandidate);
    handleSelectCandidateTab(newCandidate);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 flex flex-col max-h-[90vh]"
        id="dossier-editor-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Job Description & Candidate Dossier Manager
              </h2>
              <p className="text-xs text-slate-500">
                Inspect, edit, or upload PDF files for Job Description, Candidate Resume, and Interview Transcripts
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'jd'
                ? 'bg-slate-900 text-white shadow-xs'
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
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
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add New Candidate</span>
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs custom-scrollbar">
          {activeTab === 'jd' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 mb-1">Target Role Title</label>
                  <input
                    type="text"
                    value={jdTitle}
                    onChange={(e) => setJdTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:pt-5">
                  <input
                    type="file"
                    ref={jdInputRef}
                    onChange={(e) => e.target.files?.[0] && handleUploadJdPdf(e.target.files[0])}
                    accept=".pdf,.txt,.md,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => jdInputRef.current?.click()}
                    disabled={jdLoading}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold transition flex items-center space-x-1.5"
                  >
                    {jdLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload Job Spec PDF</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Complete Job Description Text</label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {jdText.split(/\s+/).filter(Boolean).length} words {jdFileName ? `• Source: ${jdFileName}` : ''}
                  </span>
                </div>
                <textarea
                  rows={13}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full p-3.5 font-mono text-xs bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Applied Role</label>
                  <input
                    type="text"
                    value={candRole}
                    onChange={(e) => setCandRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Resume Section with PDF upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>Candidate Resume Text</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {candResume.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <input
                      type="file"
                      ref={resumeInputRef}
                      onChange={(e) => e.target.files?.[0] && handleUploadResumePdf(e.target.files[0])}
                      accept=".pdf,.txt,.md,.docx"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={resumeLoading}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold transition flex items-center space-x-1"
                    >
                      {resumeLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Upload Resume PDF</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={candResume}
                  onChange={(e) => setCandResume(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Interview Transcript Section with PDF upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Interview Transcript Text (with timestamps)</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {candTranscript.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <input
                      type="file"
                      ref={transcriptInputRef}
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          handleUploadTranscriptPdf(Array.from(e.target.files));
                        }
                      }}
                      accept=".pdf,.txt,.md,.vtt,.srt"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => transcriptInputRef.current?.click()}
                      disabled={transcriptLoading}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition flex items-center space-x-1"
                    >
                      {transcriptLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Upload Transcript PDF(s)</span>
                    </button>
                  </div>
                </div>
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
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Changes saved successfully!</span>
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
