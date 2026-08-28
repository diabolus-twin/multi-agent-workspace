import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source for browser pdfjs-dist
try {
  if (typeof window !== 'undefined') {
    // Set standard CDN worker with fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch {
  // Ignore fallback if worker fails to set
}

export interface ExtractedDocument {
  fileName: string;
  fileSize: number;
  fileType: 'resume' | 'transcript' | 'job_description' | 'other';
  rawText: string;
  pageCount?: number;
  wordCount: number;
}

/**
 * Extract clean, well-formatted text from a File (PDF, TXT, MD, JSON, VTT, SRT, etc.)
 */
export async function extractTextFromFile(
  file: File, 
  fileType: ExtractedDocument['fileType']
): Promise<ExtractedDocument> {
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
        
        let lastY: number | null = null;
        let pageLines: string[] = [];
        let currentLine = '';

        for (const item of textContent.items as any[]) {
          if (!('str' in item)) continue;
          
          const currentY = item.transform ? item.transform[5] : null;
          
          // If Y position changed significantly, start a new line
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            // Same line: append with space if needed
            if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
              currentLine += ' ' + item.str;
            } else {
              currentLine += item.str;
            }
          }
          lastY = currentY;
        }

        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }

        const pageFormatted = pageLines.join('\n');
        pageTexts.push(`--- Page ${i} ---\n${pageFormatted}`);
      }

      const rawText = pageTexts.join('\n\n');
      return {
        fileName: file.name,
        fileSize: file.size,
        fileType,
        rawText,
        pageCount: pdf.numPages,
        wordCount: rawText.split(/\s+/).filter(Boolean).length,
      };
    } catch (err) {
      console.warn('PDF extraction using pdfjs-dist failed, attempting fallback reader:', err);
      // Fallback plain text reading
      const fallbackText = await file.text();
      const cleaned = fallbackText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
      return {
        fileName: file.name,
        fileSize: file.size,
        fileType,
        rawText: cleaned,
        wordCount: cleaned.split(/\s+/).filter(Boolean).length,
      };
    }
  }

  // Text, Markdown, CSV, VTT, SRT, or other plain formats
  const rawText = await file.text();
  return {
    fileName: file.name,
    fileSize: file.size,
    fileType,
    rawText,
    wordCount: rawText.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Extract multiple transcript files (e.g. Technical Round 1, System Design Round 2, HR Round 3)
 */
export async function extractMultipleTranscripts(files: File[]): Promise<{
  combinedText: string;
  filesSummary: { name: string; words: number }[];
  totalWords: number;
}> {
  const summaries: { name: string; words: number }[] = [];
  const textParts: string[] = [];

  for (const file of files) {
    const extracted = await extractTextFromFile(file, 'transcript');
    summaries.push({
      name: file.name,
      words: extracted.wordCount,
    });
    textParts.push(`=== TRANSCRIPT SOURCE: ${file.name} ===\n${extracted.rawText}`);
  }

  const combinedText = textParts.join('\n\n\n');
  return {
    combinedText,
    filesSummary: summaries,
    totalWords: combinedText.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Attempts to parse candidate name and target title from resume text
 */
export function extractCandidateMetadataFromText(text: string): {
  candidateName?: string;
  detectedRole?: string;
} {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('---'));

  let candidateName: string | undefined;
  let detectedRole: string | undefined;

  // First non-empty line under 40 characters often contains candidate name
  for (const line of lines.slice(0, 5)) {
    const clean = line.replace(/^(resume|curriculum vitae|cv)[:\s-]*/i, '').trim();
    if (clean.length > 2 && clean.length < 40 && !clean.includes('@') && !clean.includes('http') && !/^\d/.test(clean)) {
      candidateName = clean;
      break;
    }
  }

  // Look for role title in the next few lines
  for (const line of lines.slice(1, 8)) {
    if (/engineer|developer|architect|manager|lead|director|specialist|designer/i.test(line) && line.length < 60) {
      detectedRole = line;
      break;
    }
  }

  return { candidateName, detectedRole };
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
