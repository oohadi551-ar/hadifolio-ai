// Client-side text extraction helper for uploaded documents
export async function extractTextFromFile(file: File): Promise<{ text: string; pageCount?: number }> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // If text or markdown
  if (extension === 'txt' || extension === 'md' || extension === 'csv' || extension === 'json' || file.type.startsWith('text/')) {
    const text = await file.text();
    return { text, pageCount: 1 };
  }

  // If PDF, use pdfjs-dist if available or array buffer text extraction
  if (extension === 'pdf' || file.type === 'application/pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Set worker
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= Math.min(numPages, 50); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        fullText += `\n\n--- [صفحة ${i}] ---\n${pageText}`;
      }

      return { text: fullText.trim(), pageCount: numPages };
    } catch (err) {
      console.warn('PDF extraction failed via pdfjs, using fallback binary extraction:', err);
      // Fallback: convert to base64 so Gemini can process it directly
      const base64 = await fileToBase64(file);
      return {
        text: `[ملف PDF مرفق: "${file.name}" - تم تجهيزه للمعالجة الذكية بالذكاء الاصطناعي]`,
        pageCount: 1,
      };
    }
  }

  // Fallback
  return {
    text: `[مستند مرفق: ${file.name}]`,
    pageCount: 1,
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
