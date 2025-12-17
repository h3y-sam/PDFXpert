
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { ProcessingState } from '../../types';

const ImageCompressorTool: React.FC = () => {
  const [file, setFile] = useState<{id: string, file: File, preview: string} | null>(null);
  const [quality, setQuality] = useState<number>(0.7);
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
        setFile({ id: uuidv4(), file: f, preview: e.target?.result as string });
    };
    reader.readAsDataURL(f);
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleCompress = () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true }));

    const canvas = document.createElement('canvas');
    const img = new Image();
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        
        // Compress as JPEG
        const url = canvas.toDataURL('image/jpeg', quality);
        setState({
            isProcessing: false,
            progress: 100,
            error: null,
            resultUrl: url,
            resultName: `compressed_${file.file.name.split('.')[0]}.jpg`
        });
        toast.success("Image compressed!");
    };
    img.src = file.preview;
  };

  return (
    <ToolContainer title="Image Compressor" description="Compress images to reduce file size.">
      {!file ? (
        <FileUploader accept="image/*" multiple={false} onFilesSelected={handleFilesSelected} description="Drop an image to compress" />
      ) : (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
           <img src={file.preview} alt="preview" className="max-h-60 mx-auto rounded-lg shadow-md" />
           
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality: {Math.round(quality * 100)}%</label>
              <input type="range" min="0.1" max="1.0" step="0.1" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
           </div>

           {!state.resultUrl ? (
             <div className="flex justify-center">
               <button onClick={handleCompress} className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold">Compress Image</button>
             </div>
           ) : (
             <div className="text-center">
                 <a href={state.resultUrl} download={state.resultName || "image.jpg"} className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                     <Download className="w-5 h-5" /> Download Image
                 </a>
             </div>
           )}
        </div>
      )}
    </ToolContainer>
  );
};

export default ImageCompressorTool;
