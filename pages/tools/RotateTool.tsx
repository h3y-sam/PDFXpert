
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, RotateCw, Undo2 } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { getPageCount, renderPageToImage, rotatePDFPages } from '../../services/pdfService';

const RotateTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  // Map of pageIndex -> extra rotation degree (0, 90, 180, 270)
  const [rotations, setRotations] = useState<Map<number, number>>(new Map());
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
    setRotations(new Map());
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    
    setIsGenerating(true);
    setThumbnails([]);
    try {
        const count = await getPageCount(f);
        const thumbs: string[] = [];
        const limit = Math.min(count, 50); 
        
        for (let i = 1; i <= limit; i++) {
             const url = await renderPageToImage(f, i, 0.4);
             thumbs.push(url);
             setThumbnails([...thumbs]); 
        }
    } catch (e) {
        toast.error("Error loading PDF pages");
    } finally {
        setIsGenerating(false);
    }
  };

  const rotatePage = (index: number) => {
     // Explicitly type the new Map to ensure number type inference
     const newMap = new Map<number, number>(rotations);
     const current = newMap.get(index) || 0;
     newMap.set(index, (current + 90) % 360);
     setRotations(newMap);
  };

  const rotateAll = () => {
      // Explicitly type the new Map to ensure number type inference
      const newMap = new Map<number, number>(rotations);
      thumbnails.forEach((_, idx) => {
          const current = newMap.get(idx) || 0;
          newMap.set(idx, (current + 90) % 360);
      });
      setRotations(newMap);
  };

  const resetAll = () => {
      setRotations(new Map());
  };

  const handleSave = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const rotatedBytes = await rotatePDFPages(file.file, rotations);
      const blob = new Blob([rotatedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `rotated_${file.name}`
      });
      toast.success("PDF rotated successfully!");
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: "Rotation failed." }));
      toast.error("Failed to rotate PDF.");
    }
  };

  return (
    <ToolContainer title="Rotate PDF" description="Rotate specific pages or the entire document visually.">
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop PDF to rotate pages"
        />
      ) : (
        <div className="w-full animate-fade-in">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
             <div className="flex gap-2">
                 <button onClick={rotateAll} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                     <RotateCw className="w-4 h-4" /> Rotate All
                 </button>
                 <button onClick={resetAll} className="px-4 py-2 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                     <Undo2 className="w-4 h-4" /> Reset
                 </button>
             </div>
             
             {!state.resultUrl ? (
                 <button
                    onClick={handleSave}
                    disabled={state.isProcessing}
                    className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all
                      ${state.isProcessing
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                      }
                    `}
                  >
                    {state.isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
                    Apply Rotation
                  </button>
             ) : (
                <a 
                   href={state.resultUrl} 
                   download={state.resultName || "rotated.pdf"}
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
                 <div className="flex flex-wrap gap-6 justify-center">
                    {thumbnails.map((thumb, idx) => {
                        const rotation = rotations.get(idx) || 0;
                        return (
                            <div key={idx} className="relative group w-36 md:w-44 flex flex-col items-center">
                                <div className="relative w-full aspect-[1/1.4] bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2">
                                    <div 
                                        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
                                        style={{ transform: `rotate(${rotation}deg)` }}
                                    >
                                        <img src={thumb} className="max-w-full max-h-full object-contain" alt={`Page ${idx + 1}`} />
                                    </div>
                                    
                                    {/* Hover Overlay Button */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => rotatePage(idx)}
                                            className="bg-indigo-600 text-white p-3 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-all hover:bg-indigo-700 hover:rotate-90"
                                            title="Rotate 90°"
                                        >
                                            <RotateCw className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page {idx + 1}</span>
                                    {rotation > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{rotation}°</span>}
                                </div>
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

export default RotateTool;
