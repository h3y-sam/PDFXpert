import React, { useState, useEffect, useRef } from 'react';
import { ProcessingState } from '../types';
import {
  ShieldCheck,
  Cpu,
  Lock,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  ArrowRight,
  Clock,
  HardDrive,
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
  const [showLogs, setShowLogs] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [state.logs]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : isFailed
                ? 'bg-rose-500 text-white'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              ) : isFailed ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Activity className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {isCompleted ? 'Processing Completed!' : isFailed ? 'Processing Failed' : title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Offline
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {state.stage || (isCompleted ? 'File is ready for instant download.' : 'Sandboxed in-browser execution')}
              </p>
            </div>
          </div>

          {(isCompleted || isFailed) && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Progress Bar & Stage Indicator */}
          {!isCompleted && !isFailed && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-rose-500 animate-spin" />
                  {state.stage || 'Processing document memory...'}
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400 text-base font-bold">
                  {Math.min(100, Math.max(0, Math.round(state.progress)))}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600 rounded-full transition-all duration-300 shadow-sm relative overflow-hidden"
                  style={{ width: `${Math.min(100, Math.max(5, state.progress))}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
                </div>
              </div>
            </div>
          )}

          {/* Steps Breakdown (Trust Checklist) */}
          {state.steps && state.steps.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-500" /> Pipeline Steps:
              </p>
              <div className="space-y-2">
                {state.steps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      step.status === 'completed'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                        : step.status === 'active'
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-bold shadow-sm'
                        : step.status === 'failed'
                        ? 'bg-rose-100 dark:bg-rose-950/50 border-rose-400 text-rose-900 dark:text-rose-200'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/40 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : step.status === 'active' ? (
                          <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                        ) : step.status === 'failed' ? (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </div>
                      <span>{step.label}</span>
                    </div>
                    {step.detail && (
                      <span className="font-mono text-[10px] opacity-75">{step.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State Summary */}
          {isCompleted && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                      {state.resultName || 'Document Successfully Generated'}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      100% Client-Side Verified • Zero data leaves your device
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                {(originalSize || processedSize) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                    {originalSize && (
                      <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Original:</span>{' '}
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatBytes(originalSize)}
                        </span>
                      </div>
                    )}
                    {processedSize && (
                      <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Processed:</span>{' '}
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatBytes(processedSize)}
                        </span>
                      </div>
                    )}
                    {calculateSavings() && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Optimized:</span>{' '}
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          {calculateSavings()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {onDownload ? (
                  <button
                    onClick={onDownload}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base"
                  >
                    <Download className="w-5 h-5" /> Download Ready File
                  </button>
                ) : state.resultUrl ? (
                  <a
                    href={state.resultUrl}
                    download={state.resultName || 'document.pdf'}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base text-center"
                  >
                    <Download className="w-5 h-5" /> Download Ready File
                  </a>
                ) : null}

                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition-colors text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {isFailed && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                    An error occurred during processing
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{state.error}</p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Try Again / Close
                </button>
              )}
            </div>
          )}

          {/* Live Trust & Transparency Log Stream */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-rose-500" />
                Live Process Log ({state.logs?.length || 0} events)
              </button>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" /> Isolated Sandbox
              </span>
            </div>

            {showLogs && (
              <div
                ref={logContainerRef}
                className="w-full h-32 bg-slate-950 text-slate-300 font-mono text-[11px] p-3 rounded-2xl overflow-y-auto border border-slate-800 space-y-1 scrollbar-thin select-text"
              >
                {state.logs && state.logs.length > 0 ? (
                  state.logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-tight">
                      <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                      <span
                        className={
                          log.type === 'secure'
                            ? 'text-emerald-400'
                            : log.type === 'crypto'
                            ? 'text-cyan-400'
                            : log.type === 'cpu'
                            ? 'text-orange-400'
                            : log.type === 'success'
                            ? 'text-emerald-300 font-bold'
                            : log.type === 'warn'
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }
                      >
                        {log.text}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 italic">
                    [0.00s] Initializing local in-browser buffer stream...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trust Badges Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> Client-Side Isolated
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-500" /> Zero Upload / Airplane-Safe
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-500" /> Local WebWorker
          </div>
        </div>
      </div>
    </div>
  );
}
