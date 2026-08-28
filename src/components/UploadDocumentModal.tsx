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
  Briefcase,
  Plus,
  Files,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { 
  extractTextFromFile, 
  extractMultipleTranscripts, 
  extractCandidateMetadataFromText, 
  compileMasterDossierMarkdown 
} from '../utils/pdfExtractor';
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
  
  // 1. Resume File & Text
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumePages, setResumePages] = useState<number | undefined>();
  const [resumeLoading, setResumeLoading] = useState(false);
  const [isDraggingResume, setIsDraggingResume] = useState(false);

  // 2. Transcript Files & Text (Supports multiple transcripts)
  const [transcriptFiles, setTranscriptFiles] = useState<File[]>([]);
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptPages, setTranscriptPages] = useState<number | undefined>();
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [isDraggingTranscript, setIsDraggingTranscript] = useState(false);

  // 3. Job Description / Spec File & Text
  const [jobSpecFile, setJobSpecFile] = useState<File | null>(null);
  const [jobSpecText, setJobSpecText] = useState('');
  const [jobSpecPages, setJobSpecPages] = useState<number | undefined>();
  const [jobSpecLoading, setJobSpecLoading] = useState(false);
  const [isDraggingJobSpec, setIsDraggingJobSpec] = useState(false);

  // Compilation state
  const [compiledDossier, setCompiledDossier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'inspect' | 'preview'>('upload');
  const [inspectSection, setInspectSection] = useState<'resume' | 'transcript' | 'job_spec'>('resume');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const transcriptInputRef = useRef<HTMLInputElement>(null);
  const jobSpecInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process Resume File
  const processResumeFile = async (file: File) => {
    setErrorMessage(null);
    setResumeFile(file);
    setResumeLoading(true);
    try {
      const extracted = await extractTextFromFile(file, 'resume');
      setResumeText(extracted.rawText);
      setResumePages(extracted.pageCount);

      // Auto-extract candidate name and role if empty
      const meta = extractCandidateMetadataFromText(extracted.rawText);
      if (meta.candidateName && (!candidateName || candidateName === 'Candidate')) {
        setCandidateName(meta.candidateName);
      }
      if (meta.detectedRole && (!targetRole || targetRole === 'Senior Distributed Systems Engineer')) {
        setTargetRole(meta.detectedRole);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to extract text from ${file.name}: ${err.message || err}`);
    } finally {
      setResumeLoading(false);
    }
  };

  // Process Transcript Files (Single or Multi-round)
  const processTranscriptFiles = async (files: File[]) => {
    if (!files.length) return;
    setErrorMessage(null);
    setTranscriptLoading(true);
    try {
      const newFileList = [...transcriptFiles, ...files];
      setTranscriptFiles(newFileList);

      if (newFileList.length === 1) {
        const extracted = await extractTextFromFile(newFileList[0], 'transcript');
        setTranscriptText(extracted.rawText);
        setTranscriptPages(extracted.pageCount);
      } else {
        const { combinedText, totalWords } = await extractMultipleTranscripts(newFileList);
        setTranscriptText(combinedText);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to extract transcripts: ${err.message || err}`);
    } finally {
      setTranscriptLoading(false);
    }
  };

  // Process Job Description File
  const processJobSpecFile = async (file: File) => {
    setErrorMessage(null);
    setJobSpecFile(file);
    setJobSpecLoading(true);
    try {
      const extracted = await extractTextFromFile(file, 'job_description');
      setJobSpecText(extracted.rawText);
      setJobSpecPages(extracted.pageCount);

      // Try detecting role from job spec
      const lines = extracted.rawText.split('\n').filter(l => l.trim().length > 3 && l.trim().length < 60);
      for (const line of lines.slice(0, 5)) {
        if (/engineer|developer|architect|lead|manager/i.test(line)) {
          setTargetRole(line.trim().replace(/^role[:\s-]*/i, '').replace(/^job title[:\s-]*/i, ''));
          break;
        }
      }
    } catch (err: any) {
      setErrorMessage(`Failed to extract job specification from ${file.name}: ${err.message || err}`);
    } finally {
      setJobSpecLoading(false);
    }
  };

  const handleCompile = () => {
    if (!resumeText.trim()) {
      setErrorMessage('Please upload a Resume PDF/file or enter resume text.');
      return;
    }
    if (!transcriptText.trim()) {
      setErrorMessage('Please upload an Interview Transcript PDF/file or enter transcript text.');
      return;
    }

    const transcriptNames = transcriptFiles.length 
      ? transcriptFiles.map(f => f.name).join(', ') 
      : 'Interview Transcript';

    const compiled = compileMasterDossierMarkdown({
      candidateName: candidateName.trim() || 'Uploaded Candidate',
      targetRole: targetRole.trim() || 'Senior Software Engineer',
      jobDescriptionText: jobSpecText,
      resumeText,
      transcriptText,
      sourceFiles: {
        resume: resumeFile?.name || 'Candidate Resume.pdf',
        transcript: transcriptNames,
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
    const transcriptNames = transcriptFiles.length 
      ? transcriptFiles.map(f => f.name).join(', ') 
      : 'Interview Transcript';

    const content = compiledDossier || compileMasterDossierMarkdown({
      candidateName: name,
      targetRole: role,
      jobDescriptionText: jobSpecText,
      resumeText,
      transcriptText,
      sourceFiles: {
        resume: resumeFile?.name,
        transcript: transcriptNames,
        jobSpec: jobSpecFile?.name,
      }
    });
    exportDossierToPdf(name, role, content);
  };

  const handleStartEvaluation = () => {
    if (!resumeText.trim() || !transcriptText.trim()) {
      setErrorMessage('Please provide both Resume and Interview Transcript before starting evaluation.');
      return;
    }

    const name = candidateName.trim() || 'Uploaded Candidate';
    const candidateId = `candidate_upload_${Date.now()}`;
    const transcriptNames = transcriptFiles.length 
      ? transcriptFiles.map(f => f.name).join(', ') 
      : 'Interview Transcript.pdf';

    const dossier: CandidateDossier = {
      id: candidateId,
      name,
      appliedRole: targetRole.trim() || 'Senior Distributed Systems Engineer',
      resumeText,
      transcriptText,
      sourceFiles: {
        resumeFileName: resumeFile?.name || 'Uploaded Resume.pdf',
        transcriptFileName: transcriptNames
      }
    };

    let updatedJobDesc: JobDescription | undefined;
    if (jobSpecText.trim()) {
      updatedJobDesc = {
        id: `job_${Date.now()}`,
        title: targetRole.trim() || 'Senior Distributed Systems Engineer',
        level: 'Senior / Staff',
        department: 'Engineering',
        requiredSkills: ['Distributed Systems', 'Engineering Leadership', 'Architecture'],
        niceToHaveSkills: ['Cloud Infrastructure', 'Mentorship'],
        responsibilities: ['Architect scalable systems', 'Deliver high-reliability services'],
        teamCultureValues: ['Blameless postmortems', 'Psychological safety', 'Technical integrity'],
        rawText: jobSpecText
      };
    }

    onIngestAndEvaluate(dossier, updatedJobDesc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  PDF & Document Ingestion Pipeline
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PDF • TXT • MD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload candidate resume, verbatim interview transcript, and job application PDFs to compile into a verified evaluation dossier.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload Files
              </button>
              <button
                onClick={() => setActiveTab('inspect')}
                disabled={!resumeText && !transcriptText && !jobSpecText}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1 ${
                  activeTab === 'inspect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Inspect Extracted</span>
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
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1 ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Unified Dossier</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200 text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          {/* TAB 1: UPLOAD & DROPZONES */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {/* Candidate Info Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Candidate Name</span>
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Auto-detected from Resume or enter name (e.g. Jordan Lee)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Target Job Title / Role</span>
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Staff Distributed Systems Engineer"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 3 Interactive PDF Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. RESUME PDF DROPZONE */}
                <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">1. Resume PDF</span>
                    </div>
                    {resumeText && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                        {resumeText.split(/\s+/).filter(Boolean).length} words
                        {resumePages ? ` • ${resumePages}p` : ''}
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={(e) => e.target.files?.[0] && processResumeFile(e.target.files[0])}
                    accept=".pdf,.txt,.md,.docx"
                    className="hidden"
                  />

                  {/* Drag & Drop Area */}
                  <div 
                    onClick={() => resumeInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingResume(true); }}
                    onDragLeave={() => setIsDraggingResume(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingResume(false);
                      if (e.dataTransfer.files?.[0]) {
                        processResumeFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px] ${
                      isDraggingResume
                        ? 'border-sky-400 bg-sky-500/10 scale-[1.02]'
                        : resumeText 
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60' 
                        : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/40'
                    }`}
                  >
                    {resumeLoading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                        <span className="text-xs text-indigo-300 font-medium">Extracting PDF text...</span>
                      </div>
                    ) : resumeText ? (
                      <>
                        <FileCheck className="w-7 h-7 text-emerald-400 mb-1.5" />
                        <span className="text-xs font-bold text-emerald-300 truncate max-w-full px-2">
                          {resumeFile?.name || 'Resume Loaded'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          Click or drag another PDF to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-slate-500 mb-1.5" />
                        <span className="text-xs font-bold text-slate-200">
                          Drop Resume PDF here
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          or click to browse files
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Supports .PDF, .TXT, .MD
                        </span>
                      </>
                    )}
                  </div>

                  {/* Text preview or paste area */}
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Or paste resume text directly here..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  />
                </div>

                {/* 2. TRANSCRIPT(S) PDF DROPZONE */}
                <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">2. Transcript PDF(s)</span>
                    </div>
                    {transcriptText && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                        {transcriptText.split(/\s+/).filter(Boolean).length} words
                        {transcriptFiles.length > 1 ? ` • ${transcriptFiles.length} files` : transcriptPages ? ` • ${transcriptPages}p` : ''}
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={transcriptInputRef}
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        processTranscriptFiles(Array.from(e.target.files));
                      }
                    }}
                    accept=".pdf,.txt,.md,.vtt,.srt"
                    multiple
                    className="hidden"
                  />

                  {/* Drag & Drop Area */}
                  <div 
                    onClick={() => transcriptInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingTranscript(true); }}
                    onDragLeave={() => setIsDraggingTranscript(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingTranscript(false);
                      if (e.dataTransfer.files?.length) {
                        processTranscriptFiles(Array.from(e.dataTransfer.files));
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px] ${
                      isDraggingTranscript
                        ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02]'
                        : transcriptText 
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60' 
                        : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/40'
                    }`}
                  >
                    {transcriptLoading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                        <span className="text-xs text-indigo-300 font-medium">Extracting transcript PDF...</span>
                      </div>
                    ) : transcriptText ? (
                      <>
                        <FileCheck className="w-7 h-7 text-emerald-400 mb-1.5" />
                        <span className="text-xs font-bold text-emerald-300 truncate max-w-full px-2">
                          {transcriptFiles.length > 1 
                            ? `${transcriptFiles.length} Transcript PDFs Loaded` 
                            : transcriptFiles[0]?.name || 'Transcript Loaded'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          Click to add or replace transcripts
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-slate-500 mb-1.5" />
                        <span className="text-xs font-bold text-slate-200">
                          Drop Transcript PDF(s) here
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Single or multi-round transcripts
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Supports .PDF, .TXT, .VTT, .SRT
                        </span>
                      </>
                    )}
                  </div>

                  {/* Text preview or paste area */}
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Or paste verbatim interview transcript here..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  />
                </div>

                {/* 3. JOB SPEC / APPLICATION PDF DROPZONE */}
                <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">3. Job Application PDF</span>
                    </div>
                    {jobSpecText && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                        {jobSpecText.split(/\s+/).filter(Boolean).length} words
                        {jobSpecPages ? ` • ${jobSpecPages}p` : ''}
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={jobSpecInputRef}
                    onChange={(e) => e.target.files?.[0] && processJobSpecFile(e.target.files[0])}
                    accept=".pdf,.txt,.md,.docx"
                    className="hidden"
                  />

                  {/* Drag & Drop Area */}
                  <div 
                    onClick={() => jobSpecInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingJobSpec(true); }}
                    onDragLeave={() => setIsDraggingJobSpec(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingJobSpec(false);
                      if (e.dataTransfer.files?.[0]) {
                        processJobSpecFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center min-h-[140px] ${
                      isDraggingJobSpec
                        ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
                        : jobSpecText 
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60' 
                        : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/40'
                    }`}
                  >
                    {jobSpecLoading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                        <span className="text-xs text-indigo-300 font-medium">Extracting job application PDF...</span>
                      </div>
                    ) : jobSpecText ? (
                      <>
                        <FileCheck className="w-7 h-7 text-emerald-400 mb-1.5" />
                        <span className="text-xs font-bold text-emerald-300 truncate max-w-full px-2">
                          {jobSpecFile?.name || 'Job Application Loaded'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          Click or drag to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-slate-500 mb-1.5" />
                        <span className="text-xs font-bold text-slate-200">
                          Drop Job Spec PDF here
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Job description / role requirements
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Supports .PDF, .TXT, .MD
                        </span>
                      </>
                    )}
                  </div>

                  {/* Text preview or paste area */}
                  <textarea
                    value={jobSpecText}
                    onChange={(e) => setJobSpecText(e.target.value)}
                    placeholder="Or paste job requirements here..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  />
                </div>

              </div>

              {/* Ingestion Guidance Banner */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-200">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Multi-Source Parsing:</strong> Once PDFs are uploaded, the multi-agent engine will independently extract facts, verify citations, conduct a cross-examination debate, and compute rubric-weighted hiring decisions.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INSPECT EXTRACTED TEXTS */}
          {activeTab === 'inspect' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setInspectSection('resume')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    inspectSection === 'resume' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Extracted Resume ({resumeText.split(/\s+/).filter(Boolean).length} words)</span>
                </button>
                <button
                  onClick={() => setInspectSection('transcript')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    inspectSection === 'transcript' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Extracted Transcript ({transcriptText.split(/\s+/).filter(Boolean).length} words)</span>
                </button>
                <button
                  onClick={() => setInspectSection('job_spec')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    inspectSection === 'job_spec' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Extracted Job Spec ({jobSpecText.split(/\s+/).filter(Boolean).length} words)</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto custom-scrollbar">
                {inspectSection === 'resume' && (resumeText || 'No resume text extracted yet.')}
                {inspectSection === 'transcript' && (transcriptText || 'No interview transcript text extracted yet.')}
                {inspectSection === 'job_spec' && (jobSpecText || 'No job specification text extracted yet.')}
              </div>
            </div>
          )}

          {/* TAB 3: UNIFIED DOSSIER PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Master Dossier compiled successfully ({compiledDossier?.split(/\s+/).filter(Boolean).length} words)
                  </span>
                </div>
                <button
                  onClick={handleExportPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master PDF</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto custom-scrollbar">
                {compiledDossier}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {activeTab === 'upload' && (
              <button
                onClick={handleCompile}
                disabled={!resumeText || !transcriptText}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compile Document</span>
              </button>
            )}

            <button
              onClick={handleExportPdf}
              disabled={!resumeText || !transcriptText}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export PDF</span>
            </button>

            <button
              id="evaluate-unified-dossier-btn"
              onClick={handleStartEvaluation}
              disabled={!resumeText || !transcriptText}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ingest & Run Multi-Agent Evaluation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
