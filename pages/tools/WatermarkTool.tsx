
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Stamp, Image as ImageIcon, Type, LayoutGrid } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { watermarkPDF, renderPageToImage } from '../../services/pdfService';

type Position = 'top-left' | 'top-center' | 'top-right' | 'left-center' | 'center' | 'right-center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const WatermarkTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  
  // Settings
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('CONFIDENTIAL');
  const [wmImage, setWmImage] = useState<string | null>(null);
  const [wmImageFile, setWmImageFile] = useState<File | null>(null);
  
  // Style
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(-45);
  const [size, setSize] = useState(40); // Font size or Scale %
  const [position, setPosition] = useState<Position>('center');
  const [color, setColor] = useState('#ff0000');

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
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    
    // Load preview of page 1
    try {
        const url = await renderPageToImage(f, 1, 1.0);
        setPreviewImg(url);
    } catch(e) {
        toast.error("Could not load preview");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          const img = e.target.files[0];
          setWmImageFile(img);
          const reader = new FileReader();
          reader.onload = (ev) => setWmImage(ev.target?.result as string);
          reader.readAsDataURL(img);
          setSize(0.5); // Reset scale for image
          setRotation(0);
      }
  };

  const handleApply = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const watermarkedBytes = await watermarkPDF(file.file, {
          type: activeTab,
          text: activeTab === 'text' ? text : undefined,
          imageFile: activeTab === 'image' && wmImageFile ? wmImageFile : undefined,
          opacity,
          rotation,
          size,
          position,
          color
      });
      
      const blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({ isProcessing: false, progress: 100, error: null, resultUrl: url, resultName: `watermarked_${file.name}` });
      toast.success("Watermark added!");
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Failed." }));
      toast.error("Failed to add watermark.");
    }
  };

  // Helper to get Position Styles for CSS Preview
  const getPosStyle = (): React.CSSProperties => {
      const styles: React.CSSProperties = { position: 'absolute', transform: `translate(-50%, -50%) rotate(${rotation}deg)`, opacity: opacity };
      
      switch(position) {
          case 'top-left': styles.top = '10%'; styles.left = '10%'; break;
          case 'top-center': styles.top = '10%'; styles.left = '50%'; break;
          case 'top-right': styles.top = '10%'; styles.left = '90%'; break;
          case 'left-center': styles.top = '50%'; styles.left = '10%'; break;
          case 'center': styles.top = '50%'; styles.left = '50%'; break;
          case 'right-center': styles.top = '50%'; styles.left = '90%'; break;
          case 'bottom-left': styles.top = '90%'; styles.left = '10%'; break;
          case 'bottom-center': styles.top = '90%'; styles.left = '50%'; break;
          case 'bottom-right': styles.top = '90%'; styles.left = '90%'; break;
      }
      return styles;
  };

  return (
    <ToolContainer title="Watermark PDF" description="Add custom text or image stamps to your PDF pages.">
      {!file ? (
        <FileUploader accept=".pdf" multiple={false} onFilesSelected={handleFilesSelected} description="Drop PDF to watermark" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in w-full max-w-6xl mx-auto">
          
          {/* Controls Panel */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col gap-6">
             
             {/* Tabs */}
             <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                 <button onClick={() => setActiveTab('text')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500'}`}>
                     <Type className="w-4 h-4" /> Text
                 </button>
                 <button onClick={() => setActiveTab('image')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'image' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500'}`}>
                     <ImageIcon className="w-4 h-4" /> Image
                 </button>
             </div>

             {/* Content Input */}
             <div>
                 {activeTab === 'text' ? (
                     <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Watermark Text</label>
                         <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white" />
                         <div className="mt-3 flex items-center gap-2">
                             <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer border-0" />
                             <span className="text-sm text-gray-500">Color</span>
                         </div>
                     </div>
                 ) : (
                     <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Upload Image</label>
                         <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                     </div>
                 )}
             </div>

             {/* Sliders */}
             <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                        <span>Rotation</span> <span>{rotation}°</span>
                    </label>
                    <input type="range" min="-180" max="180" value={rotation} onChange={e => setRotation(parseInt(e.target.value))} className="w-full" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                        <span>Opacity</span> <span>{Math.round(opacity*100)}%</span>
                    </label>
                    <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                        <span>{activeTab === 'text' ? 'Font Size' : 'Scale'}</span> <span>{size}</span>
                    </label>
                    <input 
                        type="range" 
                        min={activeTab === 'text' ? "10" : "0.1"} 
                        max={activeTab === 'text' ? "200" : "2.0"} 
                        step={activeTab === 'text' ? "1" : "0.1"} 
                        value={size} 
                        onChange={e => setSize(parseFloat(e.target.value))} 
                        className="w-full" 
                    />
                 </div>
             </div>

             {/* Position Grid */}
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Position</label>
                <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                    {['top-left', 'top-center', 'top-right', 'left-center', 'center', 'right-center', 'bottom-left', 'bottom-center', 'bottom-right'].map(p => (
                        <button 
                            key={p} 
                            onClick={() => setPosition(p as Position)}
                            className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${position === p ? 'bg-blue-500 border-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                        </button>
                    ))}
                </div>
             </div>

             <button 
                 onClick={handleApply} 
                 disabled={state.isProcessing}
                 className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
             >
                 {state.isProcessing ? <Loader2 className="animate-spin" /> : <>Stamp Watermark <Stamp className="w-4 h-4" /></>}
             </button>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-gray-100 dark:bg-slate-900 rounded-2xl p-8 flex items-center justify-center min-h-[500px] border border-gray-200 dark:border-slate-700">
             {!state.resultUrl ? (
                 previewImg ? (
                     <div className="relative shadow-2xl bg-white max-w-full">
                         <img src={previewImg} alt="Preview" className="max-h-[70vh] w-auto block" draggable={false} />
                         {/* Visual Watermark Overlay */}
                         <div style={{ ...getPosStyle(), zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                             {activeTab === 'text' ? (
                                 <span style={{ fontSize: `${size}px`, fontWeight: 'bold', color: color, fontFamily: 'Helvetica, sans-serif' }}>{text}</span>
                             ) : (
                                 wmImage && <img src={wmImage} alt="wm" style={{ transform: `scale(${size})`, transformOrigin: 'center' }} />
                             )}
                         </div>
                     </div>
                 ) : <Loader2 className="animate-spin text-gray-400" />
             ) : (
                 <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
                    <h3 className="text-2xl font-bold text-green-600 mb-4">Watermark Applied!</h3>
                    <a href={state.resultUrl} download={state.resultName || "watermarked.pdf"} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg justify-center">
                        <Download /> Download PDF
                    </a>
                    <button onClick={() => setState(p => ({...p, resultUrl: null}))} className="mt-4 text-gray-500 hover:underline block w-full">Apply Another</button>
                 </div>
             )}
          </div>

        </div>
      )}
    </ToolContainer>
  );
};

export default WatermarkTool;
