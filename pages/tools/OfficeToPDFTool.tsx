
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { textToPDF } from '../../services/pdfService';

const OfficeToPDFTool: React.FC = () => {
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

  const handleConvert = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Read file as text
      const text = await file.file.text();
      const pdfBytes = await textToPDF(text);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({ isProcessing: false, progress: 100, error: null, resultUrl: url, resultName: `${file.name}.pdf` });
      toast.success("Converted to PDF!");
    } catch(e) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error("Conversion failed.");
    }
  };

  return (
    <ToolContainer title="Convert to PDF" description="Convert Word, Excel, PowerPoint, HTML or Text files to PDF (Text-based).">
      {!file ? (
        <FileUploader accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.html,.csv,.xml" multiple={false} onFilesSelected={handleFilesSelected} description="Drop file to convert" />
      ) : (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
           <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm text-center">
             Note: This tool uses text extraction to generate a PDF. Complex layouts or images in Office documents may not be preserved.
           </div>
           
           {!state.resultUrl ? (
             <div className="flex justify-center">
               <button onClick={handleConvert} disabled={state.isProcessing} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                 {state.isProcessing ? <Loader2 className="animate-spin" /> : <>Convert to PDF <ArrowRight /></>}
               </button>
             </div>
           ) : (
             <div className="flex justify-center">
               <a href={state.resultUrl} download={state.resultName || "converted.pdf"} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2">
                 <Download /> Download PDF
               </a>
             </div>
           )}
        </div>
      )}
    </ToolContainer>
  );
};

export default OfficeToPDFTool;
