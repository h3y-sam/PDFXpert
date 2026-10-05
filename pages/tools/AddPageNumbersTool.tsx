
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Hash, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import { PDFFile, ProcessingState } from '../../types';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

type Position = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
type Format = 'Page X' | 'X' | 'X / Y' | 'Page X of Y';

const addPageNumbersCustom = async (
  file: File,
  options: { position: Position; format: Format; fontSize: number; startAt: number; color: string }
): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const total = pages.length;

  const hexToRgb = (hex: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? rgb(parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255) : rgb(0, 0, 0);
  };

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const num = idx + options.startAt;
    let text = '';
    if (options.format === 'Page X') text = `Page ${num}`;
    else if (options.format === 'X') text = `${num}`;
    else if (options.format === 'X / Y') text = `${num} / ${total + options.startAt - 1}`;
    else text = `Page ${num} of ${total + options.startAt - 1}`;

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const margin = 24;

    let x = 0, y = 0;
    if (options.position.includes('center')) x = (width - textWidth) / 2;
    else if (options.position.includes('left')) x = margin;
    else x = width - textWidth - margin;

    if (options.position.includes('bottom')) y = margin;
    else y = height - options.fontSize - margin;

    page.drawText(text, {
      x, y,
      size: options.fontSize,
      font,
      color: hexToRgb(options.color),
    });
  });

  return await pdfDoc.save();
};

const AddPageNumbersTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [format, setFormat] = useState<Format>('Page X of Y');
  const [fontSize, setFontSize] = useState(12);
  const [startAt, setStartAt] = useState(1);
  const [color, setColor] = useState('#000000');
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null,
  });

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    setFile({ id: uuidv4(), file: f, name: f.name, size: f.size });
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleProcess = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const newBytes = await addPageNumbersCustom(file.file, { position, format, fontSize, startAt, color });
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setState({ isProcessing: false, progress: 100, error: null, resultUrl: url, resultName: `numbered_${file.name}` });
      toast.success('Page numbers added!');
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: 'Failed to add page numbers.' }));
      toast.error('An error occurred.');
    }
  };

  const positions: { value: Position; label: string; icon: React.ReactNode }[] = [
    { value: 'bottom-left', label: 'Bottom Left', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'bottom-center', label: 'Bottom Center', icon: <AlignCenter className="w-4 h-4" /> },
    { value: 'bottom-right', label: 'Bottom Right', icon: <AlignRight className="w-4 h-4" /> },
    { value: 'top-left', label: 'Top Left', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'top-center', label: 'Top Center', icon: <AlignCenter className="w-4 h-4" /> },
    { value: 'top-right', label: 'Top Right', icon: <AlignRight className="w-4 h-4" /> },
  ];

  const formats: Format[] = ['Page X of Y', 'Page X', 'X / Y', 'X'];

  return (
    <ToolContainer title="Add Page Numbers" description="Add customizable page numbers to your PDF documents.">
      {!file ? (
        <FileUploader accept=".pdf" multiple={false} onFilesSelected={handleFilesSelected} description="Drop a PDF to add page numbers" />
      ) : (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          {/* File info */}
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Hash className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline">Change</button>
          </div>

          {/* Options */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-5">
            {/* Format */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Number Format</label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${format === f ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {positions.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPosition(p.value)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium border transition-all ${position === p.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'}`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size + Start At + Color */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Font Size</label>
                <input
                  type="number" min={8} max={36} value={fontSize}
                  onChange={e => setFontSize(Math.max(8, Math.min(36, parseInt(e.target.value) || 12)))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Start at</label>
                <input
                  type="number" min={0} value={startAt}
                  onChange={e => setStartAt(Math.max(0, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Color</label>
                <input
                  type="color" value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full h-[38px] rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer p-0.5"
                />
              </div>
            </div>
          </div>

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleProcess}
                disabled={state.isProcessing}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all ${state.isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}
              >
                {state.isProcessing ? <><Loader2 className="animate-spin w-6 h-6" /> Processing...</> : <>Add Numbers <ArrowRight className="w-6 h-6" /></>}
              </button>
            </div>
          ) : (
            <div className="text-center animate-fade-in w-full">
              <PDFPreview pdfUrl={state.resultUrl} />
              <a
                href={state.resultUrl}
                download={state.resultName || 'numbered.pdf'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg mt-4"
              >
                <Download className="w-5 h-5" /> Download PDF
              </a>
              <button
                onClick={() => setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null })}
                className="block mt-3 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mx-auto underline"
              >
                Process again
              </button>
            </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default AddPageNumbersTool;
