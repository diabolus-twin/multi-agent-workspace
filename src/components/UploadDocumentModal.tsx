import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Eye, 
  Layers, 
  Trash2, 
  RefreshCw,
  FileCheck,
  User,
  Briefcase
} from 'lucide-react';
import { extractTextFromFile, compileMasterDossierMarkdown } from '../utils/pdfExtractor';
import { exportDossierToPdf } from '../utils/pdfGenerator';
import { CandidateDossier, JobDescription } from '../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestAndEvaluate: (candidate: CandidateDossier, jobDesc?: JobDescription) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onIngestAndEvaluate,
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Distributed Systems Engineer');
  
  // File objects & extracted text
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);

  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const [jobSpecFile, setJobSpecFile] = useState<File | null>(null);
  const [jobSpecText, setJobSpecText] = useState('');
  const [jobSpecLoading, setJobSpecLoading] = useState(false);

  // Compilation state
  const [compiledDossier, setCompiledDossier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const transcriptInputRef = useRef<HTMLInputElement>(null);
  const jobSpecInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File, type: 'resume' | 'transcript' | 'job_description') => {
    setErrorMessage(null);
    try {
      if (type === 'resume') {
        setResumeFile(file);
        setResumeLoading(true);
        const extracted = await extractTextFromFile(file, 'resume');
        setResumeText(extracted.rawText);
        setResumeLoading(false);

        // Try extracting candidate name from first few lines if not already set
        if (!candidateName) {
          const firstLine = extracted.rawText.split('\n').map(s => s.trim()).filter(Boolean)[0];
          if (firstLine && firstLine.length < 40 && !firstLine.toLowerCase().includes('resume')) {
            setCandidateName(firstLine);
          }
        }
      } else if (type === 'transcript') {
        setTranscriptFile(file);
        setTranscriptLoading(true);
        const extracted = await extractTextFromFile(file, 'transcript');
        setTranscriptText(extracted.rawText);
        setTranscriptLoading(false);
      } else if (type === 'job_description') {
        setJobSpecFile(file);
        setJobSpecLoading(true);
        const extracted = await extractTextFromFile(file, 'job_description');
        setJobSpecText(extracted.rawText);
        setJobSpecLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to parse ${file.name}: ${err.message || err}`);
      setResumeLoading(false);
      setTranscriptLoading(false);
      setJobSpecLoading(false);
    }
  };

  const handleCompile = () => {
    if (!resumeText.trim()) {
      setErrorMessage('Please upload or provide Resume text before compiling.');
      return;
    }
    if (!transcriptText.trim()) {
      setErrorMessage('Please upload or provide Interview Transcript text before compiling.');
      return;
    }

    const compiled = compileMasterDossierMarkdown({
      candidateName: candidateName.trim() || 'Uploaded Candidate',
      targetRole: targetRole.trim() || 'Senior Software Engineer',
      jobDescriptionText: jobSpecText,
      resumeText,
      transcriptText,
      sourceFiles: {
        resume: resumeFile?.name,
        transcript: transcriptFile?.name,
        jobSpec: jobSpecFile?.name,
      }
    });

    setCompiledDossier(compiled);
    setActiveTab('preview');
    setErrorMessage(null);
  };

  const handleExportPdf = () => {
    if (!compiledDossier) {
      handleCompile();
    }
    const name = candidateName.trim() || 'Candidate';
    const role = targetRole.trim() || 'Senior Engineer';
    const content = compiledDossier || compileMasterDossierMarkdown({
      candidateName: name,
      targetRole: role,
      jobDescriptionText: jobSpecText,
      resumeText,
      transcriptText,
    });
    exportDossierToPdf(name, role, content);
  };

  const handleStartEvaluation = () => {
    if (!resumeText.trim() || !transcriptText.trim()) {
      setErrorMessage('Please provide both Resume and Transcript before starting evaluation.');
      return;
    }

    const name = candidateName.trim() || 'Ingested Candidate';
    const candidateId = `candidate_${Date.now()}`;
    const dossier: CandidateDossier = {
      id: candidateId,
      name,
      appliedRole: targetRole.trim() || 'Senior Distributed Systems Engineer',
      resumeText,
      transcriptText,
      sourceFiles: {
        resumeFileName: resumeFile?.name || 'Uploaded Resume.pdf',
        transcriptFileName: transcriptFile?.name || 'Interview Transcript.txt'
      }
    };

    let updatedJobDesc: JobDescription | undefined;
    if (jobSpecText.trim()) {
      updatedJobDesc = {
        id: `job_${Date.now()}`,
        title: targetRole.trim() || 'Senior Distributed Systems Engineer',
        level: 'Senior / Staff',
        department: 'Infrastructure & Platform Engineering',
        requiredSkills: ['Distributed Systems', 'Node.js', 'Concurrency'],
        niceToHaveSkills: ['Kubernetes', 'Go'],
        responsibilities: ['Build scalable microservices', 'Ensure high availability'],
        teamCultureValues: ['Blameless postmortems', 'Radical transparency'],
        rawText: jobSpecText
      };
    }

    onIngestAndEvaluate(dossier, updatedJobDesc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Multi-Source Ingestion & Dossier Compiler</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PDF / TXT / DOCX
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload Resume, Interview Transcript & Job Application to compile into one unified dossier for multi-agent evaluation.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View switcher tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload & Ingest
              </button>
              <button
                onClick={() => {
                  if (!compiledDossier && resumeText && transcriptText) {
                    handleCompile();
                  } else {
                    setActiveTab('preview');
                  }
                }}
                disabled={!resumeText && !transcriptText}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1 ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Unified Document</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {activeTab === 'upload' ? (
            <div className="space-y-6">
              
              {/* Candidate Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Candidate Name</span>
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Target Role</span>
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Staff Distributed Systems Engineer"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 3 Ingestion Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Resume Dropzone */}
                <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-slate-200">1. Resume (PDF/TXT)</span>
                    </div>
                    {resumeText && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                        {resumeText.split(/\s+/).filter(Boolean).length} words
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resume')}
                    accept=".pdf,.txt,.md,.json"
                    className="hidden"
                  />

                  <div 
                    onClick={() => resumeInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                      resumeText 
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60' 
                        : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/40'
                    }`}
                  >
                    {resumeLoading ? (
                      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    ) : resumeText ? (
                      <>
                        <FileCheck className="w-6 h-6 text-emerald-400 mb-1" />
                        <span className="text-xs font-semibold text-emerald-300 truncate max-w-full">
                          {resumeFile?.name || 'Resume Loaded'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to replace</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-xs font-medium text-slate-300">Click to upload Resume</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">PDF, TXT, Markdown</span>
                      </>
                    )}
                  </div>

                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Or paste resume text directly here..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  />
                </div>

                {/* 2. Transcript Dropzone */}
                <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">2. Transcript (PDF/TXT)</span>
                    </div>
                    {transcriptText && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                        {transcriptText.split(/\s+/).filter(Boolean).length} words
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={transcriptInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'transcript')}
                    accept=".pdf,.txt,.md,.vtt,.srt"
                    className="hidden"
                  />

                  <div 
                    onClick={() => transcriptInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                      transcriptText 
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60' 
                        : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/40'
                    }`}
                  >
                    {transcriptLoading ? (
                      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    ) : transcriptText ? (
                      <>
                        <FileCheck className="w-6 h-6 text-emerald-400 mb-1" />
                        <span className="text-xs font-semibold text-emerald-300 truncate max-w-full">
                          {transcriptFile?.name || 'Transcript Loaded'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to replace</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-xs font-medium text-slate-300">Click to upload Transcript</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">PDF, TXT, VTT, SRT</span>
                      </>
                    )}
                  </div>

                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Or paste interview transcript here..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  />
                </div>

                {/* 3. Job Description Dropzone */}
                <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-slate-200">3. Job Application / Spec</span>
                    </div>
                    {jobSpecText && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                        {jobSpecText.split(/\s+/).filter(Boolean).length} words
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={jobSpecInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'job_description')}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                  />

                  <div 
                    onClick={() => jobSpecInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                      jobSpecText 
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60' 
                        : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/40'
                    }`}
                  >
                    {jobSpecLoading ? (
                      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    ) : jobSpecText ? (
                      <>
                        <FileCheck className="w-6 h-6 text-emerald-400 mb-1" />
                        <span className="text-xs font-semibold text-emerald-300 truncate max-w-full">
                          {jobSpecFile?.name || 'Job Spec Loaded'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to replace</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-xs font-medium text-slate-300">Click to upload Job Spec</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Optional (PDF/TXT)</span>
                      </>
                    )}
                  </div>

                  <textarea
                    value={jobSpecText}
                    onChange={(e) => setJobSpecText(e.target.value)}
                    placeholder="Or paste job requirements here..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  />
                </div>

              </div>

            </div>
          ) : (
            /* Unified Document Preview Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Master Dossier compiled successfully ({compiledDossier?.split(/\s+/).filter(Boolean).length} words)
                  </span>
                </div>
                <button
                  onClick={handleExportPdf}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master PDF</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                {compiledDossier}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {activeTab === 'upload' && (
              <button
                onClick={handleCompile}
                disabled={!resumeText || !transcriptText}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compile Document</span>
              </button>
            )}

            <button
              onClick={handleExportPdf}
              disabled={!resumeText || !transcriptText}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export PDF</span>
            </button>

            <button
              id="evaluate-unified-dossier-btn"
              onClick={handleStartEvaluation}
              disabled={!resumeText || !transcriptText}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Evaluate Unified Dossier</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
