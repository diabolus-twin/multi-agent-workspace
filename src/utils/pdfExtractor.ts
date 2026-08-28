import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source for browser pdfjs-dist
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch {
  // Ignore fallback if worker fails to set
}

export interface ExtractedDocument {
  fileName: string;
  fileType: 'resume' | 'transcript' | 'job_description' | 'other';
  rawText: string;
  pageCount?: number;
  wordCount: number;
}

/**
 * Extract clean text from a File (PDF, TXT, MD, JSON, etc.)
 */
export async function extractTextFromFile(file: File, fileType: ExtractedDocument['fileType']): Promise<ExtractedDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'pdf' || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const pageTexts: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageString = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        pageTexts.push(`--- Page ${i} ---\n${pageString}`);
      }

      const rawText = pageTexts.join('\n\n');
      return {
        fileName: file.name,
        fileType,
        rawText,
        pageCount: pdf.numPages,
        wordCount: rawText.split(/\s+/).filter(Boolean).length,
      };
    } catch (err) {
      console.warn('PDF extraction using pdfjs-dist failed, attempting fallback reader:', err);
      // Fallback text reading
      const fallbackText = await file.text();
      return {
        fileName: file.name,
        fileType,
        rawText: fallbackText.replace(/[^\x20-\x7E\n\r\t]/g, ' '),
        wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
      };
    }
  }

  // Text, Markdown, CSV, VTT, SRT, or other plain formats
  const rawText = await file.text();
  return {
    fileName: file.name,
    fileType,
    rawText,
    wordCount: rawText.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Compiles Resume, Transcript, and Job Application into one unified Master Dossier Markdown
 */
export function compileMasterDossierMarkdown(data: {
  candidateName: string;
  targetRole: string;
  jobDescriptionText: string;
  resumeText: string;
  transcriptText: string;
  sourceFiles?: { resume?: string; transcript?: string; jobSpec?: string };
}): string {
  const dateStr = new Date().toISOString().split('T')[0];
  
  return `# CANDIDATE MASTER DOSSIER & EVALUATION RECORD
**Candidate Name:** ${data.candidateName || 'Candidate'}
**Target Position:** ${data.targetRole || 'Software Engineering Role'}
**Generated:** ${dateStr}
**Compilation Source:** Unified Multi-Source Ingestion Pipeline
${data.sourceFiles?.resume ? `* **Resume Source:** ${data.sourceFiles.resume}` : ''}
${data.sourceFiles?.transcript ? `* **Transcript Source:** ${data.sourceFiles.transcript}` : ''}
${data.sourceFiles?.jobSpec ? `* **Job Spec Source:** ${data.sourceFiles.jobSpec}` : ''}

---

## SECTION 1: TARGET JOB APPLICATION & REQUIREMENTS
\`\`\`
${data.jobDescriptionText.trim() || 'No explicit job specification provided. Evaluating against general Senior Engineering standards.'}
\`\`\`

---

## SECTION 2: CANDIDATE RESUME & RECORD OF ACCOMPLISHMENTS
\`\`\`
${data.resumeText.trim()}
\`\`\`

---

## SECTION 3: COMPLETE VERBATIM INTERVIEW TRANSCRIPT (WITH TIMESTAMPS)
\`\`\`
${data.transcriptText.trim()}
\`\`\`

---

## SECTION 4: INGESTION AUDIT & METADATA
* **Resume Length:** ${data.resumeText.split(/\s+/).filter(Boolean).length} words
* **Transcript Length:** ${data.transcriptText.split(/\s+/).filter(Boolean).length} words
* **Verification Status:** Ready for Multi-Agent Independent Evaluation & Panel Debate
`;
}
