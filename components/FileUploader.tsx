import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Plus, ShieldCheck, Sparkles, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFFile } from '../types';

interface FileUploaderProps {
  accept?: string | Record<string, string[]>;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: PDFFile[];
  onRemoveFile?: (id: string) => void;
  description?: string;
  title?: string;
  subtitle?: string;
  showCameraOption?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = '.pdf',
  multiple = false,
  onFilesSelected,
  selectedFiles = [],
  onRemoveFile,
  description,
  title = 'Choose Files or Drop Here',
  subtitle,
  showCameraOption = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const getAcceptString = (acc?: string | Record<string, string[]>): string => {
    if (!acc) return '.pdf';
    if (typeof acc === 'string') return acc;
    return Object.values(acc).flat().join(',');
  };

  const getDisplayLabel = (acc?: string | Record<string, string[]>): string => {
    if (!acc) return 'PDF';
    if (typeof acc === 'string') return acc.replace(/\./g, ' ').toUpperCase().trim() || 'ANY FILE';
    return Object.values(acc).flat().join(' ').replace(/\./g, ' ').toUpperCase().trim() || 'ANY FILE';
  };

  const computedDescription = subtitle || description || 'Drag & drop files here or browse from your device';
  const computedAccept = getAcceptString(accept);
  const displayLabel = getDisplayLabel(accept);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        onFilesSelected(files);
        e.target.value = ''; // Reset
      }
    },
    [onFilesSelected]
  );

  if (selectedFiles.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer
          flex flex-col items-center justify-center
          w-full min-h-[210px] sm:min-h-[260px] md:h-80
          rounded-2xl sm:rounded-3xl border-2 border-dashed
          transition-all duration-300
          bg-white dark:bg-slate-800/80
          ${
            isDragging
              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500/70 hover:bg-rose-50/20 dark:hover:bg-slate-750'
          }
        `}
      >
        <div className="z-10 flex flex-col items-center text-center p-4 sm:p-6 pointer-events-none max-w-md">
          {/* Upload Icon with Gradient Ring */}
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 shadow-sm ${
              isDragging
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-orange-500 group-hover:text-white group-hover:scale-105'
            }`}
          >
            <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
            {computedDescription}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg uppercase tracking-wider">
              {displayLabel}
            </span>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Offline
            </span>
          </div>
        </div>

        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          accept={computedAccept}
          multiple={multiple}
          onChange={handleFileInput}
        />
      </div>
    );
  }

  // Selected Files List View
  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {selectedFiles.map((file) => (
          <div
            key={file.id}
            className="relative group bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3 overflow-hidden animate-fade-in"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0 text-rose-500">
              {file.preview ? (
                <img src={file.preview} alt="preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            {onRemoveFile && (
              <button
                onClick={() => onRemoveFile(file.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Add more button */}
        {multiple && (
          <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center p-3.5 hover:border-rose-400 hover:bg-rose-50/30 dark:hover:bg-slate-750 transition-colors min-h-[56px]">
            <Plus className="w-4 h-4 text-slate-400 group-hover:text-rose-500 mr-2" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400">
              Add More Files
            </span>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
