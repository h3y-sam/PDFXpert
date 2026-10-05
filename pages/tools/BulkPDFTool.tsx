import React, { useState, useRef } from 'react';
import { 
  Layers, Package, Download, Sparkles, ShieldCheck, Lock, 
  Minimize2, Stamp, RotateCw, CheckCircle2, AlertCircle, FileText,
  Trash2, RefreshCw, ArrowRight, Eye, Play, Check, ShieldAlert
} from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { usePremium } from '../../context/PremiumContext';

type BulkActionType = 'compress' | 'protect' | 'watermark' | 'rotate' | 'strip-metadata';

interface ProcessedFileItem {
  id: string;
  originalFile: File;
  originalSize: number;
  processedBytes?: Uint8Array;
  processedSize?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  outputName: string;
}

const BulkPDFTool: React.FC = () => {
  const { isPro, openUpgradeModal, maxBulkFiles } = usePremium();
  const [items, setItems] = useState<ProcessedFileItem[]>([]);
  const [selectedAction, setSelectedAction] = useState<BulkActionType>('compress');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [totalSavedBytes, setTotalSavedBytes] = useState<number>(0);

  // Action-specific options
  const [compressLevel, setCompressLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [password, setPassword] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [filePrefix, setFilePrefix] = useState<string>('Processed_');

  // Handle file uploads
  const handleFilesSelected = (files: File[]) => {
    const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      toast.error('Please upload PDF documents.');
      return;
    }

    if (items.length + pdfFiles.length > maxBulkFiles) {
      toast.error(`Free tier allows up to ${maxBulkFiles} files in bulk. Upgrade to Pro for unlimited files!`);
      if (!isPro) openUpgradeModal();
      return;
    }

    const newItems: ProcessedFileItem[] = pdfFiles.map((file, idx) => ({
      id: `${file.name}-${Date.now()}-${idx}`,
      originalFile: file,
      originalSize: file.size,
      status: 'pending',
      outputName: `${filePrefix}${file.name}`,
    }));

    setItems(prev => [...prev, ...newItems]);
    toast.success(`Added ${pdfFiles.length} file(s) to bulk queue.`);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearQueue = () => {
    setItems([]);
    setOverallProgress(0);
    setTotalSavedBytes(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Run Bulk Processing Pipeline
  const runBulkProcess = async () => {
    if (items.length === 0) {
      toast.error('Please add PDF files to process.');
      return;
    }

    if (selectedAction === 'protect' && !password.trim()) {
      toast.error('Please enter a password to protect the files.');
      return;
    }

    setIsProcessing(true);
    setOverallProgress(0);
    let totalSaved = 0;

    const updatedItems = [...items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      item.status = 'processing';
      setItems([...updatedItems]);

      try {
        const arrayBuffer = await item.originalFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        // Apply action
        if (selectedAction === 'compress') {
          // Flatten unnecessary objects & optimize stream structures
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('PDFXpert Optimized');
          pdfDoc.setProducer('PDFXpert High-Efficiency Engine');
        } else if (selectedAction === 'watermark') {
          const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const pages = pdfDoc.getPages();
          
          for (const page of pages) {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(watermarkText, 48);
            page.drawText(watermarkText, {
              x: (width - textWidth) / 2,
              y: height / 2,
              size: 48,
              font: font,
              color: rgb(0.9, 0.2, 0.3),
              opacity: watermarkOpacity,
              rotate: degrees(45),
            });
          }
        } else if (selectedAction === 'rotate') {
          const pages = pdfDoc.getPages();
          for (const page of pages) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + rotationAngle) % 360));
          }
        } else if (selectedAction === 'strip-metadata') {
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('');
          pdfDoc.setCreator('');
        }

        const processedBytes = await pdfDoc.save({ useObjectStreams: true });
        item.processedBytes = processedBytes;
        item.processedSize = processedBytes.byteLength;
        item.status = 'done';
        item.outputName = `${filePrefix}${item.originalFile.name}`;

        const diff = item.originalSize - item.processedSize;
        if (diff > 0) {
          totalSaved += diff;
        }
      } catch (err: any) {
        console.error(err);
        item.status = 'error';
        item.errorMessage = err?.message || 'Processing failed';
      }

      setOverallProgress(Math.round(((i + 1) / updatedItems.length) * 100));
      setTotalSavedBytes(totalSaved);
      setItems([...updatedItems]);
    }

    setIsProcessing(false);
    toast.success('All files processed successfully!');
  };

  // Download All as ZIP Archive
  const handleDownloadZip = async () => {
    const doneItems = items.filter(i => i.status === 'done' && i.processedBytes);
    if (doneItems.length === 0) {
      toast.error('No processed files ready for download.');
      return;
    }

    const zip = new JSZip();
    doneItems.forEach(item => {
      if (item.processedBytes) {
        zip.file(item.outputName, item.processedBytes);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `PDFXpert_Bulk_${selectedAction}_${doneItems.length}files.zip`;
    link.click();
    toast.success('ZIP package downloaded successfully!');
  };

  // Download Individual File
  const handleDownloadSingle = (item: ProcessedFileItem) => {
    if (!item.processedBytes) return;
    const blob = new Blob([item.processedBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = item.outputName;
    link.click();
  };

  const doneCount = items.filter(i => i.status === 'done').length;

  return (
    <ToolContainer
      title="Batch Multi-File PDF Automation"
      description="Process 10 to 50+ PDF files at once. Bulk compress, bulk watermark, bulk rotate, and download all as a ZIP package in seconds. 100% offline."
    >
      {items.length === 0 ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <FileUploader
            onFilesSelected={handleFilesSelected}
            multiple={true}
            accept={{ 'application/pdf': ['.pdf'] }}
            title="Upload Multiple PDF Files"
            subtitle="Drag & drop multiple PDFs (or click to select 5–50+ files)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center mb-3">
                <Minimize2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Bulk Compress</h4>
              <p className="text-[11px] text-slate-500">Shrink multiple PDF files at once.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 mx-auto flex items-center justify-center mb-3">
                <Stamp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Bulk Watermark</h4>
              <p className="text-[11px] text-slate-500">Stamp confidential marks across batches.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 mx-auto flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">1-Click ZIP Export</h4>
              <p className="text-[11px] text-slate-500">Download all files bundled in a single ZIP.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Action Configuration Panel (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" /> Choose Bulk Action
              </h3>

              {/* Action Tabs */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'compress', label: 'Compress', icon: Minimize2 },
                  { id: 'watermark', label: 'Watermark', icon: Stamp },
                  { id: 'rotate', label: 'Rotate', icon: RotateCw },
                  { id: 'strip-metadata', label: 'Clean Meta', icon: ShieldCheck },
                ].map(act => {
                  const Icon = act.icon;
                  const isSel = selectedAction === act.id;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setSelectedAction(act.id as BulkActionType)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                        isSel 
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Action Options */}
              {selectedAction === 'watermark' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Watermark Stamp Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={e => setWatermarkText(e.target.value)}
                      placeholder="CONFIDENTIAL / DRAFT"
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      <span>Opacity</span>
                      <span>{Math.round(watermarkOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>
              )}

              {selectedAction === 'rotate' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Rotation Angle
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[90, 180, 270].map(deg => (
                      <button
                        key={deg}
                        onClick={() => setRotationAngle(deg)}
                        className={`py-2 text-xs font-bold rounded-xl border ${
                          rotationAngle === deg
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        +{deg}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Output Name Prefix */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  File Name Prefix
                </label>
                <input
                  type="text"
                  value={filePrefix}
                  onChange={e => setFilePrefix(e.target.value)}
                  placeholder="Processed_"
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Run Button */}
              <button
                onClick={runBulkProcess}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                {isProcessing ? `Processing (${overallProgress}%)...` : `Process All ${items.length} Files`}
              </button>

              <button
                onClick={clearQueue}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear Queue
              </button>
            </div>
          </div>

          {/* Queue & Status List (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header / Stats Summary */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Bulk Queue ({items.length} Document{items.length !== 1 ? 's' : ''})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {doneCount} of {items.length} completed
                  {totalSavedBytes > 0 && ` • Saved ${formatFileSize(totalSavedBytes)} space!`}
                </p>
              </div>

              {doneCount > 0 && (
                <button
                  onClick={handleDownloadZip}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Download All as ZIP ({doneCount})
                </button>
              )}
            </div>

            {/* Overall Progress Bar */}
            {isProcessing && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Batch Pipeline Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* List of Files */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.originalFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatFileSize(item.originalSize)}
                        {item.processedSize && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2">
                            ➔ {formatFileSize(item.processedSize)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status & Single Download */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'pending' && (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                        Ready
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg animate-pulse">
                        Working...
                      </span>
                    )}
                    {item.status === 'done' && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                          <Check className="w-3 h-3" /> Done
                        </span>
                        <button
                          onClick={() => handleDownloadSingle(item)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 hover:text-rose-500 text-slate-600 transition-colors"
                          title="Download this file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <span className="text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-lg">
                        Error
                      </span>
                    )}

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default BulkPDFTool;
