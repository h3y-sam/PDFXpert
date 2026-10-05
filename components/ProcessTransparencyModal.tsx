import React from 'react';
import { ProcessingState } from '../types';
import { 
  Download, CheckCircle2, AlertCircle, X, Sparkles, Loader2 
} from 'lucide-react';

interface ProcessTransparencyModalProps {
  state: ProcessingState;
  title?: string;
  onClose?: () => void;
  onDownload?: () => void;
  originalSize?: number;
  processedSize?: number;
}

export default function ProcessTransparencyModal({
  state,
  title = 'Processing Document',
  onClose,
  onDownload,
  originalSize,
  processedSize,
}: ProcessTransparencyModalProps) {
  if (!state.isProcessing && !state.resultUrl && !state.error) {
    return null;
  }

  const isCompleted = !state.isProcessing && !!state.resultUrl;
  const isFailed = !state.isProcessing && !!state.error;

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = () => {
    if (!originalSize || !processedSize || originalSize <= processedSize) return null;
    const percent = Math.round(((originalSize - processedSize) / originalSize) * 100);
    return `${percent}% smaller`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 animate-slide-up">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* 1. STATE: PROCESSING (Clean Loader & Progress Bar) */}
        {state.isProcessing && (
          <div className="flex flex-col items-center text-center py-4 space-y-5">
            {/* Animated Circular Pulse & Spinner */}
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-rose-100 dark:border-rose-950 border-t-rose-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-rose-500">
                {Math.round(state.progress)}%
              </div>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {state.currentStep || 'Working on your file in memory...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              100% Client-Side Processing • Zero Cloud Uploads
            </p>
          </div>
        )}

        {/* 2. STATE: COMPLETED (Success Card with 1-Click Download) */}
        {isCompleted && (
          <div className="flex flex-col items-center text-center py-2 space-y-5">
            {/* Success Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ready for Download!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Processed locally with zero data leaving your device.
              </p>
            </div>

            {/* Size & Savings Pill (if available) */}
            {originalSize && processedSize && (
              <div className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="text-slate-500">
                  <span>Orig: </span>
                  <strong className="text-slate-700 dark:text-slate-300">{formatBytes(originalSize)}</strong>
                </div>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <div className="text-slate-500">
                  <span>New: </span>
                  <strong className="text-slate-700 dark:text-slate-300">{formatBytes(processedSize)}</strong>
                </div>
                {calculateSavings() && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {calculateSavings()}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full pt-2">
              <button
                onClick={onDownload || (() => {
                  if (state.resultUrl) {
                    const a = document.createElement('a');
                    a.href = state.resultUrl;
                    a.download = state.resultFileName || 'document.pdf';
                    a.click();
                  }
                })}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                Download Ready File
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. STATE: ERROR */}
        {isFailed && (
          <div className="flex flex-col items-center text-center py-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Processing Failed
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {state.error || 'An unexpected error occurred while processing the document.'}
              </p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Try Again
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
