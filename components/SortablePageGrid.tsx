
import React, { useState, useRef } from 'react';
import { Plus, X, Eye } from 'lucide-react';
import ImageModal from './ImageModal';

export interface PageItem {
  id: string;
  fileId: string;
  originalIndex: number; // 0-based
  preview: string;
}

interface SortablePageGridProps {
  pages: PageItem[];
  setPages: React.Dispatch<React.SetStateAction<PageItem[]>>;
  onAddFiles?: (files: File[]) => void;
}

const SortablePageGrid: React.FC<SortablePageGridProps> = ({ pages, setPages, onAddFiles }) => {
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

    const newPages = [...pages];
    const draggedItem = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedItem);

    setPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const handleRemove = (index: number) => {
      const newPages = [...pages];
      newPages.splice(index, 1);
      setPages(newPages);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onAddFiles) {
        onAddFiles(Array.from(e.target.files));
        e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <ImageModal 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageUrl={previewImage} 
      />

      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              relative w-32 flex flex-col items-center group
              transition-all duration-200
              ${draggedIndex === index ? 'opacity-40 scale-95' : 'opacity-100'}
            `}
          >
            {/* New Index Badge */}
            <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center z-20 shadow-md border-2 border-white dark:border-slate-800">
               {index + 1}
            </div>

            {/* Remove Button */}
            <button
               onClick={() => handleRemove(index)}
               className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center z-20 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer border-2 border-white dark:border-slate-800"
               title="Remove Page"
            >
               <X className="w-3 h-3" />
            </button>

            {/* Card Content */}
            <div className="w-full aspect-[1/1.4] bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 overflow-hidden relative cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow">
               <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 p-1">
                  <img src={page.preview} alt={`Page ${page.originalIndex + 1}`} className="max-w-full max-h-full object-contain shadow-sm" draggable={false} />
               </div>
               
               {/* Hover Overlay */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                   <button 
                      onClick={() => setPreviewImage(page.preview)}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                      title="Zoom Page"
                   >
                      <Eye className="w-5 h-5" />
                   </button>
               </div>
               
               {/* Page number hint */}
               <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded pointer-events-none">
                  {page.originalIndex + 1}
               </div>
            </div>
          </div>
        ))}

        {/* Add File Button */}
        {onAddFiles && (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 aspect-[1/1.4] rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 group text-blue-500"
            >
                <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="text-xs font-bold text-center">Add PDF</span>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".pdf" 
                    multiple 
                    onChange={handleFileInput} 
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default SortablePageGrid;
