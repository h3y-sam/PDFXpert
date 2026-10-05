import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, FilePenLine, ShieldCheck, Sparkles } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import SortablePDFGrid from '../../components/SortablePDFGrid';
import PDFPreview from '../../components/PDFPreview';
import ProcessTransparencyModal from '../../components/ProcessTransparencyModal';
import { PDFFile, ProcessingState } from '../../types';
import { mergePDFs, renderPageToImage } from '../../services/pdfService';
import { TransparencyTracker } from '../../services/transparencyTracker';
import { usePremium } from '../../context/PremiumContext';

const MergeTool: React.FC = () => {
  const { isPro, bulkLimit, openUpgradeModal } = usePremium();
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [outputName, setOutputName] = useState('merged_document');
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  // Calculate total original size
  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  // Generate Thumbnails Effect
  useEffect(() => {
    let active = true;
    const generateThumbnails = async () => {
      const filesToProcess = files.filter(f => !f.preview);
      if (filesToProcess.length === 0) return;

      for (const fileItem of filesToProcess) {
        if (!active) break;
        try {
          const previewUrl = await renderPageToImage(fileItem.file, 1, 0.5);
          if (!active) break;
          
          setFiles(prev => prev.map(f => {
            if (f.id === fileItem.id) {
              return { ...f, preview: previewUrl };
            }
            return f;
          }));
        } catch (e) {
          console.error("Thumbnail generation failed for", fileItem.name);
        }
      }
    };

    if (files.length > 0) {
      generateThumbnails();
    }
    
    return () => { active = false; };
  }, [files.length]);

  const handleFilesSelected = (newFiles: File[]) => {
    if (files.length + newFiles.length > bulkLimit) {
      toast.error(
        `Free tier allows up to ${bulkLimit} files. Upgrade to Pro for unlimited bulk merging!`,
        { duration: 5000 }
      );
      if (!isPro) openUpgradeModal();
      return;
    }

    const pdfFiles: PDFFile[] = newFiles.map(f => ({
      id: uuidv4(),
      file: f,
      name: f.name,
      size: f.size,
      rotation: 0
    }));
    setFiles(prev => [...prev, ...pdfFiles]);
    if (state.resultUrl) {
      setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge.");
      return;
    }

    const tracker = new TransparencyTracker(
      [
        'Allocate in-memory WebWorker buffer',
        'Load and parse PDF structural headers',
        'Extract and concatenate page tree catalogs',
        'Re-index cross-reference (xref) table',
        'Generate final offline PDF stream',
      ],
      (updated) => setState((prev) => ({ ...prev, ...updated }))
    );

    try {
      tracker.setStep(0, `${files.length} files queued (${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB)`);
      await new Promise((r) => setTimeout(r, 150));

      tracker.setStep(1, 'Reading byte headers in client memory');

      const mergedBytes = await mergePDFs(files, (pct, stage, detail) => {
        tracker.setProgress(pct, stage);
        if (detail) tracker.addLog(detail, 'cpu');
      });

      tracker.setStep(3, 'Re-indexing xref tables & optimizing objects');
      await new Promise((r) => setTimeout(r, 150));

      tracker.setStep(4, 'Encoding final PDF stream');

      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const finalName = outputName.toLowerCase().endsWith('.pdf') ? outputName : `${outputName}.pdf`;

      tracker.complete(url, finalName, `${(blob.size / 1024).toFixed(1)} KB`);
      toast.success("PDFs merged successfully!");
    } catch (err: any) {
      console.error(err);
      tracker.fail(err?.message || "Failed to merge PDFs. Please try again.");
      toast.error("An error occurred while merging.");
    }
  };

  return (
    <ToolContainer
      title="Merge PDF files"
      description="Combine PDFs in the order you want with real-time process transparency and 100% offline privacy."
    >
      {/* Live Process Transparency Modal */}
      <ProcessTransparencyModal
        state={state}
        title="Merging PDF Documents"
        originalSize={totalOriginalSize}
        processedSize={state.resultUrl ? undefined : undefined}
        onClose={() => setState((prev) => ({ ...prev, isProcessing: false, error: null }))}
        onDownload={() => {
          if (state.resultUrl) {
            const a = document.createElement('a');
            a.href = state.resultUrl;
            a.download = state.resultName || 'merged.pdf';
            a.click();
          }
        }}
      />

      {files.length === 0 ? (
        <FileUploader 
          accept=".pdf"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          selectedFiles={files}
          description="Drop PDF files here to merge"
        />
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {files.length} of {bulkLimit} files loaded ({isPro ? 'Pro Unlimited' : 'Free Tier'})
            </span>
            {!isPro && files.length >= 5 && (
              <button
                onClick={openUpgradeModal}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" /> Unlock unlimited bulk merge with coupon
              </button>
            )}
          </div>
          <SortablePDFGrid 
            files={files} 
            setFiles={setFiles} 
            onAddFiles={handleFilesSelected} 
          />
        </div>
      )}

      {files.length > 0 && !state.resultUrl && (
        <div className="mt-8 animate-fade-in border-t border-gray-100 dark:border-slate-700 pt-8 flex flex-col items-center gap-6">
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Filename</label>
            <div className="relative">
              <FilePenLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                placeholder="merged_document"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">.pdf</span>
            </div>
          </div>

          <button
            onClick={handleMerge}
            disabled={state.isProcessing || files.length < 2}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
              ${state.isProcessing || files.length < 2
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:shadow-rose-500/30 hover:-translate-y-1'
              }
            `}
          >
            {state.isProcessing ? (
              <>
                <Loader2 className="animate-spin w-6 h-6" /> Processing in Browser...
              </>
            ) : (
              <>
                Merge {files.length} PDFs <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      )}

      {state.resultUrl && (
        <div className="mt-8 text-center animate-fade-in w-full max-w-4xl mx-auto">
          <PDFPreview pdfUrl={state.resultUrl} />
          
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 inline-block mt-4">
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Your PDF is ready!</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">100% processed locally on your device with zero cloud uploads.</p>
            <a 
              href={state.resultUrl} 
              download={state.resultName || "merged.pdf"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-5 h-5" /> Download Merged PDF
            </a>
            <button 
              onClick={() => {
                setFiles([]);
                setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
              }}
              className="block mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline mx-auto"
            >
              Merge more files
            </button>
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default MergeTool;
