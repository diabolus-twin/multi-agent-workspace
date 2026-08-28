import { jsPDF } from 'jspdf';

export function exportDossierToPdf(candidateName: string, targetRole: string, markdownContent: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('AI MULTI-AGENT INTERVIEW PANEL - CANDIDATE DOSSIER', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Candidate: ${candidateName} | Target: ${targetRole} | Date: ${new Date().toLocaleDateString()}`, margin, 19);

  // Content body
  let y = 35;
  const lines = markdownContent.split('\n');

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(9);

  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin + 5;
    }

    if (line.startsWith('# ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      y += 3;
      doc.text(line.replace('# ', ''), margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
    } else if (line.startsWith('## ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229); // indigo-600
      y += 3;
      doc.text(line.replace('## ', ''), margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
    } else if (line.startsWith('---')) {
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    } else if (line.trim() === '```') {
      y += 2;
    } else {
      const splitText = doc.splitTextToSize(line, maxLineWidth);
      for (const textLine of splitText) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin + 5;
        }
        doc.text(textLine, margin, y);
        y += 4.5;
      }
    }
  }

  const filename = `${candidateName.toLowerCase().replace(/\s+/g, '_')}_unified_dossier.pdf`;
  doc.save(filename);
}
