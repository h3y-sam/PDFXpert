import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileDiff, ArrowLeftRight, Layers, Eye, RefreshCw, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, 
  Sliders, Download, Sparkles, ShieldCheck, ZoomIn, ZoomOut,
  Split, MoveHorizontal, FileText, Check
} from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

// Setup pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

type CompareMode = 'slider' | 'diff-overlay' | 'side-by-side' | 'text-diff';

interface TextDiffToken {
  type: 'same' | 'added' | 'removed';
  value: string;
}

const CompareTool: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [pdf1Bytes, setPdf1Bytes] = useState<ArrayBuffer | null>(null);
  const [pdf2Bytes, setPdf2Bytes] = useState<ArrayBuffer | null>(null);

  const [pages1, setPages1] = useState<number>(1);
  const [pages2, setPages2] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [compareMode, setCompareMode] = useState<CompareMode>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const [img1DataUrl, setImg1DataUrl] = useState<string | null>(null);
  const [img2DataUrl, setImg2DataUrl] = useState<string | null>(null);
  const [diffDataUrl, setDiffDataUrl] = useState<string | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  const [text1, setText1] = useState<string>('');
  const [text2, setText2] = useState<string>('');
  const [textDiff, setTextDiff] = useState<TextDiffToken[]>([]);

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  // Load File 1
  const handleFile1 = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile1(f);
    const buf = await f.arrayBuffer();
    setPdf1Bytes(buf);

    try {
      const doc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
      setPages1(doc.numPages);
      setCurrentPage(0);
      toast.success(`Loaded Document 1: ${doc.numPages} page(s)`);
    } catch (err) {
      toast.error('Failed to load Document 1');
    }
  };

  // Load File 2
  const handleFile2 = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile2(f);
    const buf = await f.arrayBuffer();
    setPdf2Bytes(buf);

    try {
      const doc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
      setPages2(doc.numPages);
      setCurrentPage(0);
      toast.success(`Loaded Document 2: ${doc.numPages} page(s)`);
    } catch (err) {
      toast.error('Failed to load Document 2');
    }
  };

  // Render Page to Canvas Image & Extract Text
  const renderPdfPage = async (buffer: ArrayBuffer, pageNum: number): Promise<{ dataUrl: string; text: string; width: number; height: number; imgData: ImageData }> => {
    const doc = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
    const clampedPage = Math.min(Math.max(1, pageNum), doc.numPages);
    const page = await doc.getPage(clampedPage);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas not supported');

    await page.render({ canvasContext: ctx, viewport }).promise;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Text content
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((it: any) => it.str).join(' ');

    return {
      dataUrl: canvas.toDataURL('image/png'),
      text: pageText,
      width: canvas.width,
      height: canvas.height,
      imgData,
    };
  };

  // Compute Pixel Diff (Red/Green difference highlighting)
  const computePixelDiff = (imgData1: ImageData, imgData2: ImageData, width: number, height: number): { diffUrl: string; similarity: number } => {
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = width;
    diffCanvas.height = height;
    const diffCtx = diffCanvas.getContext('2d');
    if (!diffCtx) return { diffUrl: '', similarity: 100 };

    const diffImageData = diffCtx.createImageData(width, height);
    const data1 = imgData1.data;
    const data2 = imgData2.data;
    const out = diffImageData.data;

    let diffPixels = 0;
    const totalPixels = width * height;

    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2], a1 = data1[i + 3];
      const r2 = data2[i], g2 = data2[i + 1], b2 = data2[i + 2], a2 = data2[i + 3];

      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

      if (diff > 45) { // Threshold for noticeable visual difference
        diffPixels++;
        if (r1 < 200 && r2 > 200) {
          // Present in v1, missing in v2 -> Removed (Red)
          out[i] = 239; out[i + 1] = 68; out[i + 2] = 68; out[i + 3] = 255;
        } else {
          // Added in v2 -> Added (Green)
          out[i] = 34; out[i + 1] = 197; out[i + 2] = 94; out[i + 3] = 255;
        }
      } else {
        // Unchanged -> Muted grayscale
        const gray = Math.round(0.299 * r1 + 0.587 * g1 + 0.114 * b1);
        out[i] = gray; out[i + 1] = gray; out[i + 2] = gray; out[i + 3] = 180;
      }
    }

    diffCtx.putImageData(diffImageData, 0, 0);
    const similarity = Math.max(0, Math.min(100, Math.round(((totalPixels - diffPixels) / totalPixels) * 1000) / 10));
    return { diffUrl: diffCanvas.toDataURL('image/png'), similarity };
  };

  // Compute Word Text Diff
  const computeWordDiff = (str1: string, str2: string): TextDiffToken[] => {
    const words1 = str1.split(/\s+/).filter(Boolean);
    const words2 = str2.split(/\s+/).filter(Boolean);
    const tokens: TextDiffToken[] = [];

    const maxLen = Math.max(words1.length, words2.length);
    for (let i = 0; i < maxLen; i++) {
      const w1 = words1[i];
      const w2 = words2[i];

      if (w1 === w2) {
        if (w1) tokens.push({ type: 'same', value: w1 });
      } else {
        if (w1) tokens.push({ type: 'removed', value: w1 });
        if (w2) tokens.push({ type: 'added', value: w2 });
      }
    }
    return tokens;
  };

  // Perform Comparison for Current Page
  const runComparison = useCallback(async () => {
    if (!pdf1Bytes || !pdf2Bytes) return;
    setIsRendering(true);

    try {
      const [res1, res2] = await Promise.all([
        renderPdfPage(pdf1Bytes, currentPage + 1),
        renderPdfPage(pdf2Bytes, currentPage + 1),
      ]);

      setImg1DataUrl(res1.dataUrl);
      setImg2DataUrl(res2.dataUrl);
      setText1(res1.text);
      setText2(res2.text);

      // Diff
      const { diffUrl, similarity } = computePixelDiff(res1.imgData, res2.imgData, res1.width, res1.height);
      setDiffDataUrl(diffUrl);
      setSimilarityScore(similarity);

      // Text Diff
      const tDiff = computeWordDiff(res1.text, res2.text);
      setTextDiff(tDiff);
    } catch (err) {
      console.error(err);
      toast.error('Error comparing document pages.');
    } finally {
      setIsRendering(false);
    }
  }, [pdf1Bytes, pdf2Bytes, currentPage]);

  useEffect(() => {
    if (pdf1Bytes && pdf2Bytes) {
      runComparison();
    }
  }, [pdf1Bytes, pdf2Bytes, currentPage, runComparison]);

  // Handle Dragging Slider
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPosition(pos);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSlider(true);
    handleSliderMove(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) handleSliderMove(e.clientX);
  };

  const handleMouseUp = () => setIsDraggingSlider(false);

  const maxPages = Math.max(pages1, pages2);

  return (
    <ToolContainer
      title="Visual Side-by-Side PDF Diff & Comparison"
      description="Compare two PDF documents side-by-side with interactive slider, visual pixel diff overlay (red/green highlights), and text changes. 100% offline."
    >
      {(!pdf1Bytes || !pdf2Bytes) ? (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Document Version A */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                    Original Document (v1)
                  </span>
                  {file1 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                {!file1 ? (
                  <FileUploader
                    onFilesSelected={handleFile1}
                    accept={{ 'application/pdf': ['.pdf'] }}
                    title="Upload Document Version A"
                    subtitle="Select original PDF file"
                  />
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{file1.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{pages1} Page(s)</p>
                    <button
                      onClick={() => { setFile1(null); setPdf1Bytes(null); }}
                      className="mt-3 text-xs font-bold text-rose-500 hover:text-rose-600"
                    >
                      Change File
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Document Version B */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                    Modified Document (v2)
                  </span>
                  {file2 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                {!file2 ? (
                  <FileUploader
                    onFilesSelected={handleFile2}
                    accept={{ 'application/pdf': ['.pdf'] }}
                    title="Upload Document Version B"
                    subtitle="Select modified or revised PDF"
                  />
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{file2.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{pages2} Page(s)</p>
                    <button
                      onClick={() => { setFile2(null); setPdf2Bytes(null); }}
                      className="mt-3 text-xs font-bold text-blue-500 hover:text-blue-600"
                    >
                      Change File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Controls Toolbar */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
            {/* Page Navigator */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 disabled:opacity-40 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[90px] text-center">
                Page {currentPage + 1} of {maxPages}
              </span>
              <button
                disabled={currentPage >= maxPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(maxPages - 1, prev + 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 disabled:opacity-40 text-xs font-bold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              {[
                { id: 'slider', label: 'Curtain Slider', icon: MoveHorizontal },
                { id: 'diff-overlay', label: 'Pixel Diff (Red/Green)', icon: Layers },
                { id: 'side-by-side', label: 'Side-by-Side', icon: Split },
                { id: 'text-diff', label: 'Text Changes', icon: FileText },
              ].map(m => {
                const Icon = m.icon;
                const isSel = compareMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setCompareMode(m.id as CompareMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isSel 
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Similarity Stats Badge */}
            {similarityScore !== null && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Match:</span>
                <span className={`text-xs font-bold ${similarityScore > 95 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {similarityScore}%
                </span>
              </div>
            )}
          </div>

          {/* Comparison Viewport */}
          <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner min-h-[550px] flex items-center justify-center">
            {isRendering ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-500">Analyzing differences...</span>
              </div>
            ) : (
              <>
                {/* 1. Interactive Curtain Slider View */}
                {compareMode === 'slider' && img1DataUrl && img2DataUrl && (
                  <div
                    ref={sliderContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="relative max-w-2xl w-full shadow-2xl rounded-2xl overflow-hidden cursor-ew-resize select-none bg-white border border-slate-300"
                  >
                    {/* Background Image (Modified Doc 2) */}
                    <img src={img2DataUrl} alt="Document 2" className="w-full h-auto block pointer-events-none" />

                    {/* Foreground Image (Original Doc 1) with clip path */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                    >
                      <img src={img1DataUrl} alt="Document 1" className="w-full h-auto block pointer-events-none" />
                    </div>

                    {/* Draggable Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white pointer-events-auto">
                        <MoveHorizontal className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur">
                      Original v1
                    </div>
                    <div className="absolute top-3 right-3 bg-blue-600/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur">
                      Modified v2
                    </div>
                  </div>
                )}

                {/* 2. Visual Diff Pixel Overlay */}
                {compareMode === 'diff-overlay' && diffDataUrl && (
                  <div className="flex flex-col items-center gap-4 max-w-2xl w-full">
                    <div className="flex items-center gap-6 text-xs font-bold bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" /> Added Content
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <span className="w-3 h-3 rounded-full bg-rose-500" /> Removed Content
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-3 h-3 rounded-full bg-slate-300" /> Unchanged
                      </span>
                    </div>

                    <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-300">
                      <img src={diffDataUrl} alt="Visual Diff" className="w-full h-auto block" />
                    </div>
                  </div>
                )}

                {/* 3. Side-by-Side Dual View */}
                {compareMode === 'side-by-side' && img1DataUrl && img2DataUrl && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h4 className="font-bold text-xs text-rose-500 mb-2 text-center">
                        Document 1 (Original) • Page {currentPage + 1}
                      </h4>
                      <img src={img1DataUrl} alt="Doc 1" className="w-full h-auto rounded-xl shadow border" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h4 className="font-bold text-xs text-blue-500 mb-2 text-center">
                        Document 2 (Modified) • Page {currentPage + 1}
                      </h4>
                      <img src={img2DataUrl} alt="Doc 2" className="w-full h-auto rounded-xl shadow border" />
                    </div>
                  </div>
                )}

                {/* 4. Text Stream Diff */}
                {compareMode === 'text-diff' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl w-full max-h-[500px] overflow-y-auto">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                      Word-by-Word Text Differences
                    </h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed">
                      {textDiff.map((token, i) => (
                        <span
                          key={i}
                          className={`mr-1 inline-block ${
                            token.type === 'added'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-1 rounded'
                              : token.type === 'removed'
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 line-through px-1 rounded'
                                : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {token.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default CompareTool;
