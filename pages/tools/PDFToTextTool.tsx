
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, FileText } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { extractTextFromPDF } from '../../services/pdfService';

const PDFToTextTool: React.FC = () => {
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
    setFile({
      id: uuidv4(),
      file: f,
      name: f.name,
      size: f.size
    });
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleConvert = async () => {
    if (!file) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const text = await extractTextFromPDF(file.file);
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `${file.name.replace('.pdf', '')}.txt`
      });
      toast.success("PDF converted to Text successfully!");
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Conversion failed." }));
      toast.error("Failed to convert PDF.");
    }
  };

  return (
    <ToolContainer
      title="PDF to Text"
      description="Extract all text content from your PDF file."
    >
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF to extract text"
        />
      ) : (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-full w-24 h-24 mx-auto border border-gray-200">
             <FileText className="w-12 h-12 text-gray-600" />
          </div>
          <p className="text-center font-medium">{file.name}</p>

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={state.isProcessing}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-600 hover:bg-gray-700 hover:shadow-gray-600/30 hover:-translate-y-1'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Extracting...
                  </>
                ) : (
                  <>
                    Convert to Text <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in">
               <a 
                 href={state.resultUrl} 
                 download={state.resultName || "document.txt"}
                 className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
               >
                 <Download className="w-5 h-5" /> Download Text File
               </a>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default PDFToTextTool;
