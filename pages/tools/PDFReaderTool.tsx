import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  PenTool,
  MessageSquare,
  Download,
  Search,
  RotateCw,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile } from '../../types';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

export default function PDFReaderTool() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [activeTool, setActiveTool] = useState<'view' | 'highlight' | 'draw' | 'note'>('view');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    const newFile: PDFFile = {
      id: Math.random().toString(),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
    };
    setFile(newFile);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument(buffer).promise;
      pdfDocRef.current = loadedPdf;
      setNumPages(loadedPdf.numPages);
      setCurrentPage(1);
      renderPage(1, loadedPdf, scale);
      toast.success(`Loaded ${loadedPdf.numPages} pages.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load PDF.');
    }
  };

  const renderPage = async (pageNum: number, pdfDoc: any = pdfDocRef.current, zoom: number = scale) => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage, pdfDocRef.current, scale);
    }
  }, [currentPage, scale]);

  const handleZoomIn = () => setScale((s) => Math.min(3.0, s + 0.2));
  const handleZoomOut = () => setScale((s) => Math.max(0.5, s - 0.2));

  return (
    <ToolContainer
      title="PDF Reader & Annotator"
      description="View, read, highlight, and annotate your PDF documents directly in the browser."
    >
      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop any PDF file here to open in Reader"
        />
      ) : (
        <div className="space-y-4 max-w-5xl mx-auto animate-fade-in">
          {/* Reader Top Toolbar */}
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Tool buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              {[
                { id: 'view', label: 'Read Mode', icon: BookOpen },
                { id: 'highlight', label: 'Highlight', icon: Highlighter },
                { id: 'draw', label: 'Draw', icon: PenTool },
                { id: 'note', label: 'Sticky Note', icon: MessageSquare },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      activeTool === t.id
                        ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 min-w-[45px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  pdfDocRef.current = null;
                }}
                className="ml-2 px-3 py-1.5 text-xs text-slate-500 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner flex justify-center overflow-auto min-h-[500px]">
            <canvas ref={canvasRef} className="shadow-2xl rounded-xl bg-white max-w-full" />
          </div>
        </div>
      )}
    </ToolContainer>
  );
}
