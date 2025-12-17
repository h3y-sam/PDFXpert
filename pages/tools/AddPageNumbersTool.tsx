
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Hash } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import { PDFFile, ProcessingState } from '../../types';
import { addPageNumbers } from '../../services/pdfService';

const AddPageNumbersTool: React.FC = () => {
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

  const handleProcess = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const newBytes = await addPageNumbers(file.file);
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `numbered_${file.name}`
      });
      toast.success("Page numbers added!");
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: "Failed to add page numbers." }));
      toast.error("An error occurred.");
    }
  };

  return (
    <ToolContainer title="Add Page Numbers" description="Add page numbers to your PDFs easily.">
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF to add page numbers"
        />
      ) : (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <div className="p-6 bg-blue-50 rounded-full">
              <Hash className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <p className="text-center text-gray-700 font-medium">{file.name}</p>

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleProcess}
                disabled={state.isProcessing}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                {state.isProcessing ? <><Loader2 className="animate-spin w-6 h-6" /> Processing...</> : <>Add Numbers <ArrowRight className="w-6 h-6" /></>}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in w-full">
               <PDFPreview pdfUrl={state.resultUrl} />
               <a 
                 href={state.resultUrl} 
                 download={state.resultName || "numbered.pdf"}
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

export default AddPageNumbersTool;
