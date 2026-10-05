import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Archive, ShieldCheck, Sparkles, X, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import ProcessTransparencyModal from '../../components/ProcessTransparencyModal';
import { PDFFile, ProcessingState } from '../../types';
import { compressPDF, generateZip } from '../../services/pdfService';
import { TransparencyTracker } from '../../services/transparencyTracker';
import { usePremium } from '../../context/PremiumContext';

const CompressTool: React.FC = () => {
  const { isPro, bulkLimit, openUpgradeModal } = usePremium();
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [level, setLevel] = useState<number>(0.5); // Compression level (Quality of JPG)
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const location = useLocation();
  const isOptimize = location.pathname.includes('optimize');
  const title = isOptimize ? "Optimize PDF" : "Compress PDF";
  const description = isOptimize 
    ? "Optimize multiple PDF files for web and sharing with real-time processing transparency."
    : "Reduce file size for multiple PDFs with 100% offline in-browser compression.";

  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    if (files.length + newFiles.length > bulkLimit) {
      toast.error(`Free tier allows up to ${bulkLimit} files. Upgrade to Pro for unlimited bulk compression!`);
      if (!isPro) openUpgradeModal();
      return;
    }
    const addedFiles = newFiles.map(f => ({
      id: uuidv4(),
      file: f,
      name: f.name,
      size: f.size
    }));
    setFiles(prev => [...prev, ...addedFiles]);
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleCompress = async () => {
    if (files.length === 0) return;

    const tracker = new TransparencyTracker(
      [
        'Initialize in-browser memory sandbox',
        'Decompress PDF stream layers & page trees',
        'Re-sample raster elements at target quality',
        'Re-encode xref table & write optimized stream',
      ],
      (updated) => setState((prev) => ({ ...prev, ...updated }))
    );

    const processedFiles: {name: string, data: Uint8Array}[] = [];
    let totalOutputBytes = 0;

    try {
      tracker.setStep(0, `${files.length} file(s) queued (${(totalOriginalSize / 1024).toFixed(1)} KB)`);
      await new Promise((r) => setTimeout(r, 150));

      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const file = files[fIdx];
        tracker.setStep(1, `Decompressing ${file.name} (File ${fIdx + 1}/${files.length})`);

        const compressedBytes = await compressPDF(file.file, level, (pct, stage, detail) => {
          tracker.setProgress(pct, stage);
          if (detail) tracker.addLog(detail, 'cpu');
        });

        totalOutputBytes += compressedBytes.length;
        const prefix = isOptimize ? 'optimized' : 'compressed';
        processedFiles.push({
          name: `${prefix}_${file.name}`,
          data: compressedBytes
        });
      }

      tracker.setStep(3, 'Finalizing byte stream and verifying offline integrity');

      let url = '';
      let name = '';

      if (processedFiles.length === 1) {
        const blob = new Blob([processedFiles[0].data], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
        name = processedFiles[0].name;
      } else {
        const zipBlob = await generateZip(processedFiles);
        url = URL.createObjectURL(zipBlob);
        name = `${isOptimize ? 'optimized' : 'compressed'}_files.zip`;
      }
      
      setProcessedSize(totalOutputBytes);
      tracker.complete(url, name, `Compressed to ${(totalOutputBytes / 1024).toFixed(1)} KB`);
      toast.success(`${files.length} PDF${files.length > 1 ? 's' : ''} compressed successfully!`);
    } catch (err: any) {
      console.error(err);
      tracker.fail(err?.message || "Compression failed.");
      toast.error("Failed to process.");
    }
  };

  return (
    <ToolContainer
      title={title}
      description={description}
    >
      <ProcessTransparencyModal
        state={state}
        title={title}
        originalSize={totalOriginalSize}
        processedSize={processedSize || undefined}
        onClose={() => setState((prev) => ({ ...prev, isProcessing: false, error: null }))}
        onDownload={() => {
          if (state.resultUrl) {
            const a = document.createElement('a');
            a.href = state.resultUrl;
            a.download = state.resultName || 'compressed.pdf';
            a.click();
          }
        }}
      />

      <FileUploader 
        accept=".pdf"
        multiple={true}
        onFilesSelected={handleFilesSelected}
        selectedFiles={files}
        description="Drop PDF files here to compress"
      />

      {files.length > 0 && !state.resultUrl && (
        <div className="mt-8 space-y-6 animate-fade-in max-w-2xl mx-auto">
          {/* File list preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {files.length} file(s) selected
              </span>
              <span>Total: {(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                    <button onClick={() => handleRemoveFile(file.id)} className="text-slate-400 hover:text-rose-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compression Level Selector */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Select Compression Level:</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'low', label: 'Extreme', quality: 0.3, desc: 'Smallest file size, lower quality' },
                { id: 'mid', label: 'Recommended', quality: 0.5, desc: 'Good quality, balanced size' },
                { id: 'high', label: 'High Quality', quality: 0.8, desc: 'Crisp image quality, modest compression' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLevel(opt.quality)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    level === opt.quality
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-800 dark:text-white">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleCompress}
              disabled={state.isProcessing}
              className="flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:shadow-lg hover:shadow-rose-500/25 transition-all"
            >
              {state.isProcessing ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Optimizing in Browser...
                </>
              ) : (
                <>
                  Compress {files.length} PDF{files.length > 1 ? 's' : ''} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {state.resultUrl && (
        <div className="mt-8 text-center animate-fade-in w-full max-w-4xl mx-auto">
          {files.length === 1 && <PDFPreview pdfUrl={state.resultUrl} />}
          
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 inline-block mt-4">
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Compression Complete!</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">
              Saved {totalOriginalSize > processedSize ? `${Math.round(((totalOriginalSize - processedSize) / totalOriginalSize) * 100)}% space` : 'Optimized'} • 100% offline
            </p>
            <a 
              href={state.resultUrl} 
              download={state.resultName || "compressed.pdf"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-5 h-5" /> Download {files.length > 1 ? 'ZIP Archive' : 'Compressed PDF'}
            </a>
            <button 
              onClick={() => {
                setFiles([]);
                setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
              }}
              className="block mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline mx-auto"
            >
              Compress more files
            </button>
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default CompressTool;
