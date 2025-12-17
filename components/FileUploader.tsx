
import React, { useCallback, useState } from 'react';
import { Upload, File as FileIcon, X, Plus } from 'lucide-react';
import { PDFFile } from '../types';

interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: PDFFile[];
  onRemoveFile?: (id: string) => void;
  description?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  multiple = false,
  onFilesSelected,
  selectedFiles = [],
  onRemoveFile,
  description = "or drop PDF files here"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      e.target.value = ''; // Reset to allow re-selection of same file
    }
  }, [onFilesSelected]);
  
  if (selectedFiles.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer
          flex flex-col items-center justify-center
          w-full h-64 md:h-80
          rounded-3xl border-2 border-dashed
          transition-all duration-300
          bg-white dark:bg-slate-800
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-slate-700 scale-[1.02]' 
            : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-750'
          }
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Animated Background blob for hover */}
            <div className="absolute w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 animate-blob"></div>
        </div>

        <div className="z-10 flex flex-col items-center text-center p-6 pointer-events-none">
          <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-600 group-hover:text-blue-500'}`}>
            <Upload className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-slate-200 mb-2">Select files</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base">{description}</p>
        </div>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
        />
      </div>
    );
  }

  // File List View
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {selectedFiles.map((file) => (
          <div key={file.id} className="relative group bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-3 overflow-hidden animate-fade-in">
             <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 text-red-500">
               {file.preview ? (
                 <img src={file.preview} alt="preview" className="w-full h-full object-cover rounded-lg" />
               ) : (
                 <FileIcon className="w-6 h-6" />
               )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
               <p className="text-xs text-gray-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
             </div>
             <button 
                onClick={() => onRemoveFile && onRemoveFile(file.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        ))}

        {/* Add more button */}
        <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-4 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors h-24 md:h-auto">
           <Plus className="w-6 h-6 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 mb-1" />
           <span className="text-xs font-semibold text-gray-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">Add more</span>
           <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
           />
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
