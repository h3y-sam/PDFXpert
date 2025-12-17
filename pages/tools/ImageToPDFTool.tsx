
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { imagesToPDF } from '../../services/pdfService';

const ImageToPDFTool: React.FC = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const location = useLocation();
  const isScan = location.pathname.includes('scan');
  const title = isScan ? "Scan to PDF" : "JPG to PDF";
  const description = isScan 
    ? "Capture document scans from your mobile device and convert them to PDF."
    : "Convert your images to PDF. Adjust orientation and margins.";

  const handleFilesSelected = (newFiles: File[]) => {
    // Generate previews for images
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const id = uuidv4();
        setFiles(prev => [...prev, {
          id,
          file: f,
          name: f.name,
          size: f.size,
          preview: e.target?.result as string
        }]);
      };
      reader.readAsDataURL(f);
    });

    if (state.resultUrl) {
      setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const rawFiles = files.map(f => f.file);
      const pdfBytes = await imagesToPDF(rawFiles);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `${isScan ? 'scan' : 'images'}_converted.pdf`
      });
      toast.success("Converted to PDF successfully!");
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Conversion failed." }));
      toast.error("An error occurred during conversion.");
    }
  };

  return (
    <ToolContainer
      title={title}
      description={description}
    >
      <FileUploader 
        accept="image/*"
        multiple={true}
        onFilesSelected={handleFilesSelected}
        selectedFiles={files}
        onRemoveFile={handleRemoveFile}
        description={isScan ? "Take photos or drop images" : "Drop JPG or PNG images here"}
      />

      {files.length > 0 && !state.resultUrl && (
        <div className="mt-8 flex justify-center animate-fade-in">
          <button
            onClick={handleConvert}
            disabled={state.isProcessing}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
              ${state.isProcessing
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/30 hover:-translate-y-1'
              }
            `}
          >
            {state.isProcessing ? (
              <>
                <Loader2 className="animate-spin w-6 h-6" /> Converting...
              </>
            ) : (
              <>
                Convert to PDF <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      )}

      {state.resultUrl && (
        <div className="mt-8 text-center animate-fade-in">
          <div className="p-6 bg-green-50 rounded-2xl border border-green-100 inline-block">
            <h3 className="text-xl font-bold text-green-800 mb-4">Your PDF is ready!</h3>
            <a 
              href={state.resultUrl} 
              download={state.resultName || "converted.pdf"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              <Download className="w-5 h-5" /> Download PDF
            </a>
            <button 
              onClick={() => {
                setFiles([]);
                setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
              }}
              className="block mt-4 text-sm text-green-600 hover:underline mx-auto"
            >
              Convert more files
            </button>
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default ImageToPDFTool;
