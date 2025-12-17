
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Crop } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { cropPDF, renderPageToImage } from '../../services/pdfService';

const CropTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 }); // Intrinsic dimensions
  
  // Crop Box state (Percentage based to handle responsiveness)
  const [cropBox, setCropBox] = useState({ top: 10, left: 10, width: 80, height: 80 }); 
  
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

    // Load first page for visual crop
    try {
        const url = await renderPageToImage(f, 1, 1.5);
        const img = new Image();
        img.onload = () => {
            setImageDims({ width: img.width, height: img.height });
            setPageImage(url);
        };
        img.src = url;
    } catch(e) {
        toast.error("Failed to load PDF preview");
    }
  };

  const handleCrop = async () => {
    if (!file || !imageDims.width) return;
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Convert Percentage back to PDF Points (Approximate mapping since imageDims is pixel based)
      // Note: This logic assumes all pages are same size as page 1.
      
      const margin_left = (cropBox.left / 100) * imageDims.width;
      const margin_top = (cropBox.top / 100) * imageDims.height;
      const crop_width = (cropBox.width / 100) * imageDims.width;
      const crop_height = (cropBox.height / 100) * imageDims.height;

      const margin_right = imageDims.width - (margin_left + crop_width);
      const margin_bottom = imageDims.height - (margin_top + crop_height);

      // We pass margins to the service
      // Note: PDF coordinates are usually points (72 DPI). Our image render scale affects this.
      // renderPageToImage uses scale=1.5. So 1px here = 1/1.5 points roughly. 
      // Ideally we should get actual PDF page size from pdf-lib first, but for now we rely on relative margins.
      // The service uses setCropBox(x, y, w, h).
      
      // Let's rely on ratio:
      const scaleFactor = 1 / 1.5; // Reverse the render scale

      const finalMargins = {
          top: margin_top * scaleFactor,
          bottom: margin_bottom * scaleFactor,
          left: margin_left * scaleFactor,
          right: margin_right * scaleFactor
      };

      const newBytes = await cropPDF(file.file, finalMargins);
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setState({ isProcessing: false, progress: 100, error: null, resultUrl: url, resultName: `cropped_${file.name}` });
      toast.success("PDF Cropped!");
    } catch(e) {
      console.error(e);
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error("Crop failed.");
    }
  };

  return (
    <ToolContainer title="Crop PDF" description="Adjust crop area visually to trim margins.">
      {!file ? (
        <FileUploader accept=".pdf" multiple={false} onFilesSelected={handleFilesSelected} description="Drop PDF to crop" />
      ) : (
        <div className="w-full animate-fade-in flex flex-col items-center">
           
           {!state.resultUrl ? (
               <>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex gap-4 w-full max-w-2xl justify-between items-center">
                    <div>
                        <h4 className="font-bold text-gray-700">Adjust Crop Area</h4>
                        <p className="text-sm text-gray-500">Drag sliders to adjust margins</p>
                    </div>
                    <button 
                        onClick={handleCrop} 
                        disabled={state.isProcessing} 
                        className="px-6 py-2.5 bg-lime-600 text-white rounded-xl font-bold hover:bg-lime-700 flex items-center gap-2 shadow-lg shadow-lime-600/20"
                    >
                        {state.isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <>Crop PDF <Crop className="w-4 h-4" /></>}
                    </button>
                </div>

                <div className="relative w-full max-w-3xl bg-gray-100 p-8 rounded-xl overflow-hidden shadow-inner flex justify-center">
                    {pageImage ? (
                        <div className="relative inline-block shadow-2xl">
                            <img src={pageImage} alt="Crop Preview" className="max-w-full h-auto block max-h-[60vh]" draggable={false} />
                            
                            {/* Overlay Dark Areas (Margins) */}
                            <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: `${cropBox.top}%` }}></div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50" style={{ height: `${100 - (cropBox.top + cropBox.height)}%` }}></div>
                            <div className="absolute top-0 left-0 bottom-0 bg-black/50" style={{ width: `${cropBox.left}%`, top: `${cropBox.top}%`, bottom: `${100 - (cropBox.top + cropBox.height)}%` }}></div>
                            <div className="absolute top-0 right-0 bottom-0 bg-black/50" style={{ width: `${100 - (cropBox.left + cropBox.width)}%`, top: `${cropBox.top}%`, bottom: `${100 - (cropBox.top + cropBox.height)}%` }}></div>

                            {/* Crop Box Border */}
                            <div 
                                className="absolute border-2 border-lime-400 box-border pointer-events-none"
                                style={{
                                    top: `${cropBox.top}%`,
                                    left: `${cropBox.left}%`,
                                    width: `${cropBox.width}%`,
                                    height: `${cropBox.height}%`
                                }}
                            >
                                {/* Crosshairs */}
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-lime-400/50"></div>
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-lime-400/50"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center text-gray-400"><Loader2 className="animate-spin mr-2" /> Loading preview...</div>
                    )}
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full max-w-2xl mt-8">
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Top Margin</label>
                        <input type="range" min="0" max="45" value={cropBox.top} onChange={e => setCropBox(p => ({...p, top: parseInt(e.target.value)}))} className="w-full accent-lime-600" />
                     </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Bottom Margin</label>
                        <input type="range" min="0" max="45" value={100 - (cropBox.top + cropBox.height)} onChange={e => {
                             const margin = parseInt(e.target.value);
                             setCropBox(p => ({...p, height: 100 - p.top - margin}));
                        }} className="w-full accent-lime-600" />
                     </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Left Margin</label>
                        <input type="range" min="0" max="45" value={cropBox.left} onChange={e => setCropBox(p => ({...p, left: parseInt(e.target.value)}))} className="w-full accent-lime-600" />
                     </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Right Margin</label>
                        <input type="range" min="0" max="45" value={100 - (cropBox.left + cropBox.width)} onChange={e => {
                             const margin = parseInt(e.target.value);
                             setCropBox(p => ({...p, width: 100 - p.left - margin}));
                        }} className="w-full accent-lime-600" />
                     </div>
                </div>
               </>
           ) : (
             <div className="flex flex-col items-center w-full">
               <div className="p-8 bg-green-50 border border-green-200 rounded-2xl text-center">
                   <h3 className="text-xl font-bold text-green-800 mb-4">Crop Successful!</h3>
                   <a href={state.resultUrl} download={state.resultName || "cropped.pdf"} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg">
                     <Download /> Download Cropped PDF
                   </a>
                   <button onClick={() => { setState(p => ({...p, resultUrl: null})); }} className="mt-4 text-sm text-green-600 hover:underline block mx-auto">Crop Another</button>
               </div>
             </div>
           )}
        </div>
      )}
    </ToolContainer>
  );
};

export default CropTool;
