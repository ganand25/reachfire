export async function downloadPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  const mod = await import('html2pdf.js');
  const html2pdf = mod.default;

  element.classList.add('pdf-export-mode');

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.92 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          removeContainer: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      })
      .from(element)
      .save();
  } finally {
    element.classList.remove('pdf-export-mode');
  }
}
