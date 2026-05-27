export async function downloadPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html2pdf = (await import('html2pdf.js')).default;

  element.classList.add('pdf-export-mode');

  await html2pdf()
    .set({
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    })
    .from(element)
    .save();

  element.classList.remove('pdf-export-mode');
}
