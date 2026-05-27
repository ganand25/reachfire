export async function downloadPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html2pdf = (await import('html2pdf.js')).default;

  element.classList.add('pdf-export-mode');

  // Wait for styles to apply
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.85 },
        html2canvas: {
          scale: 1,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          removeContainer: true,
          allowTaint: true,
          foreignObjectRendering: false,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      })
      .from(element)
      .save();
  } finally {
    element.classList.remove('pdf-export-mode');
  }
}
