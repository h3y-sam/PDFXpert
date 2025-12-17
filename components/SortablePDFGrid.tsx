
import React, { useRef, useState } from 'react';
import { PDFFile } from '../types';
import { X, RotateCw, Plus, FileText, ArrowDownAZ, ArrowUpAZ, Trash2, Eye } from 'lucide-react';
import ImageModal from './ImageModal';

interface SortablePDFGridProps {
  files: PDFFile[];
  setFiles: React.Dispatch<React.SetStateAction<PDFFile[]>>;
  onAddFiles: (files: File[]) => void;
}

const SortablePDFGrid: React.FC<SortablePDFGridProps> = ({ files, setFiles, onAddFiles }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Swap items
    const newFiles = [...files];
    const draggedItem = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);

    setFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRotate = (id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, rotation: ((f.rotation || 0) + 90) % 360 };
      }
      return f;
    }));
  };

  const sortFiles = (direction: 'asc' | 'desc') => {
    const sorted = [...files].sort((a, b) => {
      return direction === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    setFiles(sorted);
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <ImageModal 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageUrl={previewImage} 
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => sortFiles('asc')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
                <ArrowDownAZ className="w-4 h-4" /> Name A-Z
            </button>
            <button 
                onClick={() => sortFiles('desc')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
                <ArrowUpAZ className="w-4 h-4" /> Name Z-A
            </button>
        </div>
        
        <div className="flex items-center gap-2">
             <span className="text-sm text-gray-500 font-medium px-2">{files.length} Files</span>
             <button 
                onClick={() => setFiles([])}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" /> Clear All
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              relative w-40 flex flex-col items-center group
              transition-transform duration-200
              ${draggedIndex === index ? 'opacity-50 scale-105' : 'opacity-100'}
            `}
          >
            {/* Index Badge */}
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center z-20 shadow-lg border-2 border-white dark:border-slate-800">
               {index + 1}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemove(file.id)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center z-20 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer border-2 border-white dark:border-slate-800"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Card Content */}
            <div className="w-full aspect-[1/1.4] bg-white dark:bg-slate-700 rounded-lg shadow-md border border-gray-200 dark:border-slate-600 overflow-hidden relative cursor-grab active:cursor-grabbing hover:shadow-xl transition-shadow">
               {/* Thumbnail / Preview */}
               <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 p-2">
                 <div 
                    className="w-full h-full shadow-sm bg-white flex items-center justify-center relative transition-transform duration-300"
                    style={{ transform: `rotate(${file.rotation || 0}deg)` }}
                 >
                    {file.preview ? (
                        <img src={file.preview} alt={file.name} className="max-w-full max-h-full object-contain" draggable={false} />
                    ) : (
                        <FileText className="w-12 h-12 text-gray-300" />
                    )}
                 </div>
               </div>

               {/* Overlay Actions */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   {file.preview && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(file.preview || null); }}
                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                        title="Zoom / Preview"
                     >
                        <Eye className="w-6 h-6" />
                     </button>
                   )}
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleRotate(file.id); }}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                      title="Rotate"
                   >
                      <RotateCw className="w-6 h-6" />
                   </button>
               </div>
            </div>

            {/* Filename */}
            <div className="mt-3 text-center w-full">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded">
                    {file.name}
                </p>
            </div>
          </div>
        ))}

        {/* Add File Card */}
        <div 
            onClick={handleAddClick}
            className="w-40 aspect-[1/1.4] rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 group text-blue-500"
        >
            <div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-sm font-bold">Add PDF</span>
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf" 
                multiple 
                onChange={handleFileInput} 
            />
        </div>
      </div>
    </div>
  );
};

export default SortablePDFGrid;
