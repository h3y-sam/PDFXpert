
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Eraser, PenTool, MousePointer2, Trash2, Square, Hand, RotateCcw, Feather } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import { PDFFile, ProcessingState } from '../../types';
import { renderPageToImage, modifyPDF, PDFModification, getPageCount } from '../../services/pdfService';
import SignatureModal from '../../components/SignatureModal';

type Mode = 'select' | 'pan' | 'redact' | 'draw' | 'eraser';

interface UIModification extends PDFModification {
  id: string;
}

const EditPDFTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{width: number, height: number} | null>(null);
  
  const [mode, setMode] = useState<Mode>('pan');
  const [mods, setMods] = useState<UIModification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Signature Modal
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Tool Settings
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const location = useLocation();
  const isRedact = location.pathname.includes('redact');
  const isSign = location.pathname.includes('sign');
  
  const title = isRedact ? "Redact PDF" : isSign ? "Sign PDF" : "Edit PDF";
  const description = isRedact 
    ? "Permanently remove sensitive information from your PDF." 
    : isSign ? "Sign your PDF document." : "Add redactions, drawings, and signatures to your PDF.";

  // Set initial mode
  useEffect(() => {
    if (isRedact) {
      setMode('redact');
      setColor('#000000');
    } else if (isSign) {
      setMode('pan');
    }
  }, [isRedact, isSign]);

  // Sync state with selected item
  useEffect(() => {
    if (selectedId) {
      const item = mods.find(m => m.id === selectedId);
      if (item) {
        if (item.color) setColor(item.color);
        if (item.strokeWidth) setStrokeWidth(item.strokeWidth);
      }
    }
  }, [selectedId, mods]);

  // Load new file
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    try {
      const count = await getPageCount(f);
      setTotalPages(count);
      setFile({ id: uuidv4(), file: f, name: f.name, size: f.size });
      setMods([]); 
      loadPage(f, 1);
    } catch(e) { toast.error("Error loading PDF"); }
  };

  // Render Page
  const loadPage = async (f: File, pageNum: number) => {
    try {
      const imgUrl = await renderPageToImage(f, pageNum, 1.5);
      
      const img = new Image();
      img.onload = () => {
        setImageDims({ width: img.width, height: img.height });
        setPageImage(imgUrl);
      };
      img.src = imgUrl;
      
      setCurrentPage(pageNum);
      setSelectedId(null);
    } catch(e) { toast.error("Error rendering page"); }
  };

  const getCoords = (e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current || !imageDims) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = imageDims.width / rect.width;
    const scaleY = imageDims.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageDims) return;
    if (mode === 'pan') return;

    const coords = getCoords(e);
    
    if (mode === 'draw' || mode === 'eraser') {
      setIsDragging(true);
      setCurrentPath([{ x: coords.x, y: coords.y }]);
    } else if (mode === 'redact') {
      setIsDragging(true);
      setDragStart(coords);
      const id = uuidv4();
      const newMod: UIModification = {
        id,
        pageIndex: currentPage - 1,
        type: 'rectangle',
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        color: '#000000'
      };
      setMods(prev => [...prev, newMod]);
      setSelectedId(id);
    } else if (mode === 'select') {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageDims) return;
    const coords = getCoords(e);

    if (mode === 'draw' || mode === 'eraser') {
      setCurrentPath(prev => [...prev, { x: coords.x, y: coords.y }]);
    } else if (mode === 'redact' && selectedId && dragStart) {
      setMods(prev => prev.map(m => {
        if (m.id === selectedId) {
          const width = coords.x - dragStart.x;
          const height = coords.y - dragStart.y;
          return {
            ...m,
            x: width < 0 ? coords.x : dragStart.x,
            y: height < 0 ? coords.y : dragStart.y,
            width: Math.abs(width),
            height: Math.abs(height)
          };
        }
        return m;
      }));
    } else if (mode === 'select' && selectedId && dragStart) {
       const dx = coords.x - dragStart.x;
       const dy = coords.y - dragStart.y;
       setMods(prev => prev.map(m => {
         if (m.id === selectedId) {
           return { ...m, x: m.x + dx, y: m.y + dy };
         }
         return m;
       }));
       setDragStart(coords); 
    }
  };

  const handleMouseUp = () => {
    if ((mode === 'draw' || mode === 'eraser') && isDragging) {
      if (currentPath.length > 1) {
        setMods(prev => [...prev, {
          id: uuidv4(),
          pageIndex: currentPage - 1,
          type: 'drawing',
          x: 0, y: 0,
          path: currentPath,
          color: mode === 'eraser' ? '#ffffff' : color, 
          strokeWidth: mode === 'eraser' ? 20 : strokeWidth
        }]);
      }
      setCurrentPath([]);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const handleItemMouseDown = (e: React.MouseEvent, id: string) => {
    if (mode === 'eraser') {
      e.stopPropagation();
      setMods(prev => prev.filter(m => m.id !== id));
      toast.success("Object erased");
      return;
    }
    if (mode === 'select') {
      e.stopPropagation(); 
      setSelectedId(id);
      setIsDragging(true);
      setDragStart(getCoords(e));
    }
  };

  const updateSelectedStyle = (key: keyof UIModification, value: any) => {
      if (selectedId) {
          setMods(prev => prev.map(m => m.id === selectedId ? { ...m, [key]: value } : m));
      }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setMods(prev => prev.filter(m => m.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleSave = async () => {
    if (!file || !imageDims) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const newBytes = await modifyPDF(file.file, mods, imageDims.width);
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setState({ isProcessing: false, progress: 100, error: null, resultUrl: url, resultName: `edited_${file.name}` });
      toast.success("PDF Saved!");
    } catch(e) {
      console.error(e);
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error("Failed to save PDF");
    }
  };

  const undoLast = () => {
    setMods(prev => prev.slice(0, -1));
  };

  const handleSignatureApply = (imageData: string) => {
     if (!imageDims) return;
     const id = uuidv4();
     const width = 200; 
     const height = 100;
     const newMod: UIModification = {
        id,
        pageIndex: currentPage - 1,
        type: 'image',
        x: (imageDims.width / 2) - (width / 2),
        y: (imageDims.height / 2) - (height / 2),
        width,
        height,
        imageData
     };
     setMods(prev => [...prev, newMod]);
     setSelectedId(id);
     setMode('select');
  };

  return (
    <ToolContainer title={title} description={description}>
      <SignatureModal 
        isOpen={isSignatureModalOpen} 
        onClose={() => setIsSignatureModalOpen(false)}
        onApply={handleSignatureApply}
      />

      {!file ? (
        <FileUploader accept=".pdf" multiple={false} onFilesSelected={handleFilesSelected} description="Drop PDF to edit" />
      ) : (
        <div className="flex flex-col gap-4 animate-fade-in outline-none" tabIndex={0} onKeyDown={(e) => { if(e.key === 'Delete' || e.key === 'Backspace') deleteSelected(); }}>
          {/* Toolbar */}
          <div className="sticky top-20 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur border border-gray-200 dark:border-slate-700 p-3 rounded-xl shadow-lg flex flex-wrap gap-4 justify-center items-center">
             
             {/* Tools */}
             <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                <button onClick={() => setMode('pan')} className={`p-2 rounded-md transition-all ${mode === 'pan' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`} title="Pan / Scroll"><Hand className="w-5 h-5" /></button>
                <button onClick={() => setMode('select')} className={`p-2 rounded-md transition-all ${mode === 'select' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`} title="Select & Move"><MousePointer2 className="w-5 h-5" /></button>
                <button onClick={() => setIsSignatureModalOpen(true)} className="p-2 rounded-md transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-slate-600" title="Create Signature"><Feather className="w-5 h-5" /></button>
                <button onClick={() => setMode('draw')} className={`p-2 rounded-md transition-all ${mode === 'draw' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`} title="Freehand Draw"><PenTool className="w-5 h-5" /></button>
                <button onClick={() => setMode('eraser')} className={`p-2 rounded-md transition-all ${mode === 'eraser' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`} title="Eraser"><Eraser className="w-5 h-5" /></button>
                <button onClick={() => setMode('redact')} className={`p-2 rounded-md transition-all ${mode === 'redact' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`} title="Redact Box"><Square className="w-5 h-5" /></button>
             </div>

             <div className="h-8 w-px bg-gray-300 dark:bg-slate-600"></div>

             {/* Style Controls */}
             <div className="flex items-center gap-4">
               {mode !== 'eraser' && (
                  <div className="flex items-center gap-2" title="Color">
                    <input type="color" value={color} onChange={(e) => { setColor(e.target.value); updateSelectedStyle('color', e.target.value); }} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                  </div>
               )}
             </div>

             <div className="h-8 w-px bg-gray-300 dark:bg-slate-600"></div>

             <div className="flex items-center gap-2">
                <button onClick={undoLast} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Undo"><RotateCcw className="w-5 h-5" /></button>
                <button disabled={!selectedId} onClick={deleteSelected} className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent" title="Delete"><Trash2 className="w-5 h-5" /></button>
             </div>

             <div className="h-8 w-px bg-gray-300 dark:bg-slate-600"></div>
             
             <div className="flex items-center gap-2">
                 <button disabled={currentPage <= 1} onClick={() => loadPage(file.file, currentPage - 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium disabled:opacity-50">Prev</button>
                 <span className="text-sm font-medium dark:text-slate-300">Page {currentPage} of {totalPages}</span>
                 <button disabled={currentPage >= totalPages} onClick={() => loadPage(file.file, currentPage + 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium disabled:opacity-50">Next</button>
             </div>
          </div>

          {/* Editor Canvas */}
          <div ref={containerRef} className={`relative overflow-auto bg-gray-100 dark:bg-slate-900 p-8 rounded-xl min-h-[600px] flex justify-center items-start shadow-inner border border-gray-200 dark:border-slate-700 ${mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : ''}`}>
             {pageImage && (
               <div 
                 ref={canvasRef}
                 className="relative shadow-2xl bg-white select-none origin-top"
                 style={{ width: imageDims ? `${imageDims.width}px` : 'auto', maxWidth: '100%' }}
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}
                 onMouseLeave={handleMouseUp}
               >
                 <img src={pageImage} alt="page" className="w-full h-full pointer-events-none select-none block" draggable={false} />
                 
                 {/* Vector & Additions Layer */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${imageDims?.width || 100} ${imageDims?.height || 100}`}>
                    {mods.filter(m => m.pageIndex === currentPage - 1 && m.type === 'drawing').map(m => (
                       <polyline key={m.id} points={m.path?.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={m.color} strokeWidth={m.strokeWidth || 3} strokeLinecap="round" strokeLinejoin="round" className={`${mode === 'select' || mode === 'eraser' ? 'pointer-events-auto cursor-pointer hover:opacity-70' : ''}`} onClick={(e) => handleItemMouseDown(e, m.id)} />
                    ))}
                    {(mode === 'draw' || mode === 'eraser') && currentPath.length > 1 && (
                       <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={mode === 'eraser' ? '#ffffff' : color} strokeWidth={mode === 'eraser' ? 20 : strokeWidth} strokeLinecap="round" strokeLinejoin="round" className="opacity-70" />
                    )}
                    {selectedId && mods.find(m => m.id === selectedId && m.type === 'drawing') && (
                        <polyline points={mods.find(m => m.id === selectedId)?.path?.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" className="pointer-events-none" />
                    )}
                 </svg>

                 {mods.filter(m => m.pageIndex === currentPage - 1 && m.type !== 'drawing').map(m => (
                   <div key={m.id} className={`absolute ${mode === 'select' ? 'cursor-move' : ''} ${selectedId === m.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} style={{ left: `${(m.x / (imageDims?.width || 1)) * 100}%`, top: `${(m.y / (imageDims?.height || 1)) * 100}%`, width: (m.type === 'rectangle' || m.type === 'image') ? `${(m.width! / (imageDims?.width || 1)) * 100}%` : 'auto', height: (m.type === 'rectangle' || m.type === 'image') ? `${(m.height! / (imageDims?.height || 1)) * 100}%` : 'auto', backgroundColor: m.type === 'rectangle' ? m.color : 'transparent' }} onMouseDown={(e) => handleItemMouseDown(e, m.id)}>
                      {m.type === 'image' ? (
                          <img src={m.imageData} alt="signature" className="w-full h-full object-contain pointer-events-none" draggable={false} />
                      ) : null}
                   </div>
                 ))}
               </div>
             )}
          </div>

          {!state.resultUrl ? (
             <div className="flex justify-center mt-4">
               <button onClick={handleSave} disabled={state.isProcessing} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg">
                 {state.isProcessing ? <Loader2 className="animate-spin" /> : <>Save & Download <ArrowRight /></>}
               </button>
             </div>
          ) : (
             <div className="flex flex-col items-center mt-4 w-full animate-slide-up">
               <PDFPreview pdfUrl={state.resultUrl} />
               <div className="p-6 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center gap-4">
                  <h3 className="text-xl font-bold text-green-800">Changes Applied!</h3>
                  <div className="flex gap-4">
                      <a href={state.resultUrl} download={state.resultName || "edited.pdf"} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg">
                        <Download /> Download Edited PDF
                      </a>
                      <button onClick={() => { setState(prev => ({...prev, resultUrl: null})); }} className="px-6 py-3 bg-white text-green-700 border border-green-200 rounded-xl font-bold hover:bg-green-50">
                        Edit Again
                      </button>
                  </div>
               </div>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default EditPDFTool;
