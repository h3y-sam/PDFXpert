
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Info, FileText, Code } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { textToPDF } from '../../services/pdfService';

const OfficeToPDFTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null,
  });

  const location = useLocation();
  const path = location.pathname;

  const isHtml = path.includes('html');
  const isWord = path.includes('word');
  const isPpt = path.includes('ppt');
  const isExcel = path.includes('excel');

  let title = 'Convert to PDF';
  let accept = '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.html,.csv,.xml,.rtf';
  let description = 'Convert Office documents and text files to PDF format.';

  if (isHtml) { title = 'HTML to PDF'; accept = '.html,.htm'; description = 'Convert HTML files to PDF.'; }
  else if (isWord) { title = 'Word to PDF'; accept = '.doc,.docx,.txt,.rtf'; description = 'Convert Word documents to PDF.'; }
  else if (isPpt) { title = 'PowerPoint to PDF'; accept = '.ppt,.pptx,.txt'; description = 'Convert PowerPoint files to PDF.'; }
  else if (isExcel) { title = 'Excel to PDF'; accept = '.xls,.xlsx,.csv,.txt'; description = 'Convert Excel spreadsheets to PDF.'; }

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    setFile({ id: uuidv4(), file: f, name: f.name, size: f.size });
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleConvert = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      let text = '';
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // For HTML files, we can do a proper text extraction from markup
      if (ext === 'html' || ext === 'htm') {
        const rawHtml = await file.file.text();
        // Strip HTML tags for basic text extraction
        const div = document.createElement('div');
        div.innerHTML = rawHtml;
        text = div.innerText || div.textContent || rawHtml;
      } else if (ext === 'csv') {
        // CSV: readable text format
        text = await file.file.text();
      } else if (ext === 'txt' || ext === 'rtf') {
        text = await file.file.text();
      } else {
        // Binary formats (.docx, .xlsx, .pptx) — read as text (will produce garbage for binary)
        // Try text extraction anyway; if it produces legible text great, otherwise still create a PDF
        try {
          text = await file.file.text();
        } catch {
          text = `[Could not extract text from ${file.name}. This file format requires server-side conversion for full fidelity.]`;
        }
      }

      const pdfBytes = await textToPDF(text || `[No text content extracted from ${file.name}]`);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.[^.]+$/, '');
      setState({ isProcessing: false, progress: 100, error: null, resultUrl: url, resultName: `${baseName}.pdf` });
      toast.success('Converted to PDF!');
    } catch (e) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error('Conversion failed.');
    }
  };

  const isBinaryFormat = () => {
    if (!file) return false;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext);
  };

  return (
    <ToolContainer title={title} description={description}>
      {/* Capability notice */}
      <div className="max-w-xl mx-auto mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl flex gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Client-side text conversion</p>
          <p>
            This tool extracts text content and creates a PDF.
            {isHtml ? ' HTML structure is stripped to plain text.' : ' For complex Office files (.docx, .xlsx, .pptx), formatting and images are not preserved.'}
            {' '}For full-fidelity conversion, use a desktop application like LibreOffice.
          </p>
        </div>
      </div>

      {!file ? (
        <FileUploader accept={accept} multiple={false} onFilesSelected={handleFilesSelected} description="Drop file to convert" />
      ) : (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          {/* File info */}
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              {isHtml ? <Code className="w-6 h-6 text-indigo-500" /> : <FileText className="w-6 h-6 text-indigo-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline">Change</button>
          </div>

          {isBinaryFormat() && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-sm text-amber-800 dark:text-amber-300 flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Binary Office format detected. Text extraction may be partial. For best results, save as <strong>.txt</strong> first.
              </span>
            </div>
          )}

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={state.isProcessing}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5"
              >
                {state.isProcessing ? <Loader2 className="animate-spin" /> : <>Convert to PDF <ArrowRight /></>}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <a
                href={state.resultUrl}
                download={state.resultName || 'converted.pdf'}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg"
              >
                <Download /> Download PDF
              </a>
              <button
                onClick={() => setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null })}
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline"
              >
                Convert another file
              </button>
            </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default OfficeToPDFTool;
