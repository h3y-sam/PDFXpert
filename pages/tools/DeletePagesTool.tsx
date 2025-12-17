
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { getPageCount, deletePages, renderPageToImage } from '../../services/pdfService';

const DeletePagesTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pagesToDelete, setPagesToDelete] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    setFile({ id: uuidv4(), file: f, name: f.name, size: f.size });
    setPagesToDelete(new Set());
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    
    setIsGenerating(true);
    setThumbnails([]);
    try {
        const count = await getPageCount(f);
        const thumbs: string[] = [];
        // Limit for performance
        const limit = Math.min(count, 50); 
        
        for (let i = 1; i <= limit; i++) {
             const url = await renderPageToImage(f, i, 0.4);
             thumbs.push(url);
             setThumbnails([...thumbs]); // Progressive render
        }
        if (count > 50) toast("Showing first 50 pages only", { icon: 'ℹ️' });
    } catch (e) {
        toast.error("Error loading PDF pages");
    } finally {
        setIsGenerating(false);
    }
  };

  const togglePage = (index: number) => {
      const newSet = new Set(pagesToDelete);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      setPagesToDelete(newSet);
  };

  const handleDelete = async () => {
    if (!file || pagesToDelete.size === 0) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Explicit cast to number[] to fix conversion errors
      const pages = Array.from(pagesToDelete) as number[];
      const newBytes = await deletePages(file.file, pages);
      
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `edited_${file.name}`
      });
      toast.success("Pages removed successfully!");
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: "Failed to delete pages." }));
      toast.error("Error processing PDF.");
    }
  };

  return (
    <ToolContainer
      title="Delete PDF Pages"
      description="Click on pages to remove them from your PDF document."
    >
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF to remove pages"
        />
      ) : (
        <div className="w-full animate-fade-in">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
             <div className="text-gray-700 dark:text-gray-200 font-medium">
                 {thumbnails.length} Pages Loaded &middot; <span className="text-red-500 font-bold">{pagesToDelete.size} selected for deletion</span>
             </div>
             
             {!state.resultUrl ? (
                 <button
                    onClick={handleDelete}
                    disabled={state.isProcessing || pagesToDelete.size === 0}
                    className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all
                      ${state.isProcessing || pagesToDelete.size === 0
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
                      }
                    `}
                  >
                    {state.isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                    Remove Selected
                  </button>
             ) : (
                <a 
                   href={state.resultUrl} 
                   download={state.resultName || "document.pdf"}
                   className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg"
                 >
                   <Download className="w-5 h-5" /> Download Result
                 </a>
             )}
          </div>

          {/* Visual Grid */}
          <div className="bg-gray-100 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700 min-h-[300px]">
             {isGenerating && thumbnails.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                    <span>Loading pages...</span>
                 </div>
             ) : (
                 <div className="flex flex-wrap gap-4 justify-center">
                    {thumbnails.map((thumb, idx) => {
                        const isDeleted = pagesToDelete.has(idx);
                        return (
                            <div 
                                key={idx}
                                onClick={() => togglePage(idx)}
                                className={`
                                    relative group cursor-pointer w-32 md:w-40 flex flex-col items-center transition-all duration-200
                                    ${isDeleted ? 'opacity-50 grayscale' : 'hover:-translate-y-1'}
                                `}
                            >
                                <div className={`
                                    relative w-full aspect-[1/1.4] bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 overflow-hidden
                                    ${isDeleted ? 'border-red-500 ring-2 ring-red-200' : 'border-transparent hover:border-blue-400'}
                                `}>
                                    <img src={thumb} className="w-full h-full object-contain p-2" alt={`Page ${idx + 1}`} />
                                    
                                    {/* Overlay for Deleted State */}
                                    {isDeleted && (
                                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                            <div className="bg-red-500 text-white p-2 rounded-full">
                                                <Trash2 className="w-6 h-6" />
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Hover Overlay for Active State */}
                                    {!isDeleted && (
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white text-red-500 p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                                <XCircle className="w-6 h-6" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">Page {idx + 1}</span>
                            </div>
                        );
                    })}
                 </div>
             )}
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default DeletePagesTool;
