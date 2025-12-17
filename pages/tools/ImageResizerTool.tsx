
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { ProcessingState } from '../../types';

const ImageResizerTool: React.FC = () => {
  const [file, setFile] = useState<{id: string, file: File, preview: string} | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            setWidth(img.width);
            setHeight(img.height);
            setAspectRatio(img.width / img.height);
            setFile({ id: uuidv4(), file: f, preview: e.target?.result as string });
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(f);
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleWidthChange = (val: number) => {
      setWidth(val);
      if (maintainAspect) setHeight(Math.round(val / aspectRatio));
  };

  const handleHeightChange = (val: number) => {
      setHeight(val);
      if (maintainAspect) setWidth(Math.round(val * aspectRatio));
  };

  const handleResize = () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true }));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        ctx?.drawImage(img, 0, 0, width, height);
        const url = canvas.toDataURL(file.file.type);
        setState({
            isProcessing: false,
            progress: 100,
            error: null,
            resultUrl: url,
            resultName: `resized_${file.file.name}`
        });
        toast.success("Image resized!");
    };
    img.src = file.preview;
  };

  return (
    <ToolContainer title="Image Resizer" description="Resize images maintaining quality.">
      {!file ? (
        <FileUploader accept="image/*" multiple={false} onFilesSelected={handleFilesSelected} description="Drop an image to resize" />
      ) : (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
           <img src={file.preview} alt="preview" className="max-h-60 mx-auto rounded-lg shadow-md" />
           <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Width (px)</label>
                  <input type="number" value={width} onChange={e => handleWidthChange(parseInt(e.target.value))} className="w-full p-2 border rounded" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Height (px)</label>
                  <input type="number" value={height} onChange={e => handleHeightChange(parseInt(e.target.value))} className="w-full p-2 border rounded" />
              </div>
           </div>
           <div className="flex items-center gap-2 justify-center">
               <input type="checkbox" checked={maintainAspect} onChange={e => setMaintainAspect(e.target.checked)} id="aspect" />
               <label htmlFor="aspect" className="text-sm text-gray-700">Maintain Aspect Ratio</label>
           </div>
           
           {!state.resultUrl ? (
             <div className="flex justify-center">
               <button onClick={handleResize} className="px-8 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold">Resize Image</button>
             </div>
           ) : (
             <div className="text-center">
                 <a href={state.resultUrl} download={state.resultName || "image.png"} className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                     <Download className="w-5 h-5" /> Download Image
                 </a>
             </div>
           )}
        </div>
      )}
    </ToolContainer>
  );
};

export default ImageResizerTool;
