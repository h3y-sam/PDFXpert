
import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// Ensure worker is configured
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;
}

interface PDFPreviewProps {
  pdfUrl: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ pdfUrl }) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Load the PDF Document
  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1); // Reset to page 1 on new file
      } catch (err) {
        console.error("Error loading PDF preview:", err);
        setError("Could not load PDF preview. The file might be corrupted or password protected.");
      } finally {
        setLoading(false);
      }
    };

    if (pdfUrl) {
      loadPdf();
    }
  }, [pdfUrl]);

  // Render the specific page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      // Cancel previous render if active to prevent glitches
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Determine scale. We render at 1.5x for crispness on high DPI screens
        // The canvas CSS will constrain it to fit the container
        const viewport = page.getViewport({ scale: 1.5 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
      } catch (error: any) {
        // Ignore cancellation errors
        if (error.name !== 'RenderingCancelledException') {
          console.error('Render error:', error);
        }
      }
    };

    renderPage();
  }, [pdfDoc, pageNum]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Generating Preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-32 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-500 dark:text-red-400 px-4 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8 shadow-inner flex flex-col items-center">
      <div className="w-full bg-slate-200/50 dark:bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result Preview</span>
        
        {numPages > 1 && (
            <div className="flex items-center gap-3 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg shadow-sm">
                <button 
                  onClick={() => setPageNum(p => Math.max(1, p - 1))}
                  disabled={pageNum <= 1}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-16 text-center select-none">
                    {pageNum} / {numPages}
                </span>
                <button 
                  onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
                  disabled={pageNum >= numPages}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded disabled:opacity-30 transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                </button>
            </div>
        )}
      </div>
      
      <div className="p-4 overflow-auto w-full flex justify-center bg-slate-500/10 min-h-[400px]">
         <canvas 
           ref={canvasRef} 
           className="shadow-xl rounded-sm bg-white max-w-full h-auto object-contain"
           style={{ maxHeight: '80vh' }}
         />
      </div>
    </div>
  );
};

export default PDFPreview;
