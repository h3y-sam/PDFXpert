
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Layers } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import { PDFFile, ProcessingState } from '../../types';
import { flattenPDF } from '../../services/pdfService';

const FlattenTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
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
    setFile({ id: uuidv4(), file: f, name: f.name, size: f.size });
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleFlatten = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const newBytes = await flattenPDF(file.file);
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `flattened_${file.name}`
      });
      toast.success("PDF Flattened!");
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: "Failed to flatten." }));
      toast.error("An error occurred.");
    }
  };

  return (
    <ToolContainer title="Flatten PDF" description="Merge annotations and forms into the page content.">
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF to flatten"
        />
      ) : (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
           <div className="flex justify-center">
            <div className="p-6 bg-amber-50 rounded-full">
              <Layers className="w-10 h-10 text-amber-600" />
            </div>
          </div>
          <p className="text-center text-gray-700 font-medium">{file.name}</p>

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleFlatten}
                disabled={state.isProcessing}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}
                `}
              >
                {state.isProcessing ? <><Loader2 className="animate-spin w-6 h-6" /> Flattening...</> : <>Flatten PDF <ArrowRight className="w-6 h-6" /></>}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in w-full">
               <PDFPreview pdfUrl={state.resultUrl} />
               <a 
                 href={state.resultUrl} 
                 download={state.resultName || "flattened.pdf"}
                 className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
               >
                 <Download className="w-5 h-5" /> Download PDF
               </a>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default FlattenTool;
