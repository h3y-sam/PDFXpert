
import React, { useState, useEffect, useRef } from 'react';
import { X, PenTool, Type, User, Upload, Image as ImageIcon, Check, Eraser } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (imageData: string) => void;
}

const FONTS = [
  { name: 'Great Vibes', family: 'font-signature1', label: 'Signature' },
  { name: 'Sacramento', family: 'font-signature2', label: 'Signature' },
  { name: 'Dancing Script', family: 'font-signature3', label: 'Signature' },
  { name: 'Allura', family: 'font-signature4', label: 'Signature' },
];

const COLORS = [
  { name: 'Black', value: '#000000', class: 'bg-zinc-800' },
  { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Green', value: '#22C55E', class: 'bg-green-500' },
];

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onApply }) => {
  const [activeTab, setActiveTab] = useState<'signature' | 'initials' | 'stamp'>('signature');
  const [subMode, setSubMode] = useState<'type' | 'draw' | 'upload'>('type');
  
  const [fullName, setFullName] = useState('');
  const [initials, setInitials] = useState('');
  
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  
  // Draw Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  // Upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Reset drawing when switching to draw mode
  useEffect(() => {
    if (subMode === 'draw' && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = 2;
            setHasDrawing(false);
        }
    }
  }, [subMode, selectedColor, isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      setIsDrawing(true);
      setHasDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
  };

  const stopDrawing = () => {
      setIsDrawing(false);
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          setHasDrawing(false);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleApply = () => {
    let dataUrl = '';

    if (subMode === 'type') {
        let text = fullName || 'Signature';
        if (activeTab === 'initials') text = initials || 'AB';
        if (activeTab === 'stamp') text = fullName || 'APPROVED';

        const font = FONTS[selectedFontIndex];
        
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.font = `100px "${font.name}", cursive`; // Ensure fallback to cursive
        ctx.fillStyle = selectedColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        dataUrl = canvas.toDataURL('image/png');

    } else if (subMode === 'draw') {
        if (!canvasRef.current) return;
        dataUrl = canvasRef.current.toDataURL('image/png');
    } else if (subMode === 'upload' && uploadedImage) {
        dataUrl = uploadedImage;
    }

    if (dataUrl) {
        onApply(dataUrl);
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-[#121212] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
           <h2 className="text-xl font-semibold text-zinc-100">Set your signature details</h2>
           <div className="flex items-center gap-4">
               <button className="text-red-500 border border-red-500/50 hover:bg-red-500/10 px-4 py-1.5 rounded text-sm font-medium transition-colors">
                   Login
               </button>
               <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
           </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
           
           {/* Inputs Row */}
           <div className="flex gap-4 items-start">
               <div className="mt-7 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                   <User className="w-5 h-5" />
               </div>
               <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Full name:</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-2.5 text-white focus:border-red-500 outline-none transition-colors placeholder-zinc-600"
                        placeholder="Your name"
                        autoFocus
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Initials:</label>
                      <input 
                        type="text" 
                        value={initials}
                        onChange={(e) => setInitials(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-2.5 text-white focus:border-red-500 outline-none transition-colors placeholder-zinc-600"
                        placeholder="Your initials"
                      />
                  </div>
               </div>
           </div>

           {/* Tabs */}
           <div className="flex gap-8 border-b border-zinc-800 mt-2">
              <button 
                 onClick={() => setActiveTab('signature')}
                 className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'signature' ? 'text-white border-red-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                  <PenTool className="w-4 h-4 inline-block mr-2" /> Signature
              </button>
              <button 
                 onClick={() => setActiveTab('initials')}
                 className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'initials' ? 'text-white border-red-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                  <Type className="w-4 h-4 inline-block mr-2" /> Initials
              </button>
              <button 
                 onClick={() => setActiveTab('stamp')}
                 className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stamp' ? 'text-white border-red-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                  <ImageIcon className="w-4 h-4 inline-block mr-2" /> Company Stamp
              </button>
           </div>

           {/* Editor Area */}
           <div className="flex border border-zinc-800 rounded-lg bg-[#1e1e1e] h-64 overflow-hidden relative">
               
               {/* Vertical Toolbar */}
               <div className="w-14 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 bg-[#181818]">
                   <button 
                      onClick={() => setSubMode('type')}
                      className={`p-2.5 rounded-lg transition-all ${subMode === 'type' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                      title="Type"
                   >
                       <Type className="w-5 h-5" />
                   </button>
                   <button 
                      onClick={() => setSubMode('draw')}
                      className={`p-2.5 rounded-lg transition-all ${subMode === 'draw' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                      title="Draw"
                   >
                       <PenTool className="w-5 h-5" />
                   </button>
                   <button 
                      onClick={() => setSubMode('upload')}
                      className={`p-2.5 rounded-lg transition-all ${subMode === 'upload' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                      title="Upload"
                   >
                       <Upload className="w-5 h-5" />
                   </button>
               </div>

               {/* Main Panel */}
               <div className="flex-1 relative bg-[#151515]">
                   
                   {/* TYPE MODE */}
                   {subMode === 'type' && (
                       <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2">
                           <div className="space-y-1">
                               {FONTS.map((font, idx) => (
                                   <div 
                                      key={idx}
                                      onClick={() => setSelectedFontIndex(idx)}
                                      className={`
                                          group flex items-center p-3 rounded cursor-pointer transition-all border
                                          ${selectedFontIndex === idx ? 'bg-[#252525] border-zinc-700' : 'border-transparent hover:bg-[#1e1e1e]'}
                                      `}
                                   >
                                       {/* Radio Circle */}
                                       <div className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center ${selectedFontIndex === idx ? 'border-green-500 bg-green-500/10' : 'border-zinc-600'}`}>
                                           {selectedFontIndex === idx && <Check className="w-3 h-3 text-green-500" />}
                                       </div>
                                       
                                       <span 
                                          className={`text-3xl ${font.family}`}
                                          style={{ color: selectedColor }}
                                       >
                                           {activeTab === 'initials' 
                                              ? (initials || 'Initials') 
                                              : activeTab === 'stamp' 
                                                ? (fullName || 'APPROVED') 
                                                : (fullName || 'Signature')}
                                       </span>
                                   </div>
                               ))}
                           </div>
                           
                           {/* Floating Color Picker within Type Mode */}
                           <div className="sticky bottom-0 bg-[#151515]/95 backdrop-blur p-3 border-t border-zinc-800 flex items-center gap-3">
                               <span className="text-xs text-zinc-500 uppercase font-bold">Color:</span>
                               <div className="flex gap-2">
                                   {COLORS.map((c) => (
                                       <button 
                                          key={c.name}
                                          onClick={() => setSelectedColor(c.value)}
                                          className={`w-6 h-6 rounded-full ${c.class} transition-transform hover:scale-110 ${selectedColor === c.value ? 'ring-2 ring-white/50 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                          title={c.name}
                                       />
                                   ))}
                               </div>
                           </div>
                       </div>
                   )}

                   {/* DRAW MODE */}
                   {subMode === 'draw' && (
                       <div className="w-full h-full relative cursor-crosshair bg-[#1a1a1a]">
                           <canvas 
                               ref={canvasRef}
                               width={600}
                               height={256}
                               className="w-full h-full touch-none"
                               onMouseDown={startDrawing}
                               onMouseMove={draw}
                               onMouseUp={stopDrawing}
                               onMouseLeave={stopDrawing}
                           />
                           {hasDrawing && (
                               <button 
                                  onClick={clearCanvas} 
                                  className="absolute top-2 right-2 p-2 bg-zinc-800 rounded text-zinc-400 hover:text-white text-xs flex items-center gap-1"
                               >
                                   <Eraser className="w-3 h-3" /> Clear
                               </button>
                           )}
                           <div className="absolute bottom-2 left-2 flex gap-2">
                               {COLORS.map((c) => (
                                   <button 
                                      key={c.name}
                                      onClick={() => setSelectedColor(c.value)}
                                      className={`w-6 h-6 rounded-full ${c.class} shadow-sm border border-zinc-900 ${selectedColor === c.value ? 'ring-2 ring-white' : ''}`}
                                   />
                               ))}
                           </div>
                       </div>
                   )}

                   {/* UPLOAD MODE */}
                   {subMode === 'upload' && (
                       <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-500">
                           {uploadedImage ? (
                               <div className="relative w-full h-full flex items-center justify-center">
                                   <img src={uploadedImage} alt="Uploaded" className="max-w-full max-h-full object-contain" />
                                   <button 
                                      onClick={() => setUploadedImage(null)}
                                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                                   >
                                       <X className="w-4 h-4" />
                                   </button>
                               </div>
                           ) : (
                               <>
                                   <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                                       <Upload className="w-8 h-8 text-zinc-600" />
                                   </div>
                                   <p className="text-sm mb-4">Upload an image of your signature</p>
                                   <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer transition-colors text-sm font-medium">
                                       Choose File
                                       <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                   </label>
                               </>
                           )}
                       </div>
                   )}
               </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-end bg-[#181818]">
           <button 
             onClick={handleApply}
             className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg shadow-red-900/20 transition-all transform active:scale-95 text-sm uppercase tracking-wide"
           >
              Apply
           </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
