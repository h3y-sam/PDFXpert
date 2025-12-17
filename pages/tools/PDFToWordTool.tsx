
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, FileText, Archive } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { extractTextFromPDF, generateZip } from '../../services/pdfService';

const PDFToWordTool: React.FC = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const addedFiles = newFiles.map(f => ({
      id: uuidv4(),
      file: f,
      name: f.name,
      size: f.size
    }));
    setFiles(prev => [...prev, ...addedFiles]);
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    const processedFiles: {name: string, data: Blob}[] = [];

    try {
      for (const file of files) {
        const text = await extractTextFromPDF(file.file);
        
        // Simple "Word" document as HTML which Word can open
        const docContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head>
          <body>${text.replace(/\n/g, '<br/>')}</body></html>
        `;
        
        const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
        processedFiles.push({
            name: `${file.name.replace('.pdf', '')}.doc`,
            data: blob
        });
      }

      let url = '';
      let name = '';

      if (processedFiles.length === 1) {
        url = URL.createObjectURL(processedFiles[0].data);
        name = processedFiles[0].name;
      } else {
        const zipBlob = await generateZip(processedFiles);
        url = URL.createObjectURL(zipBlob);
        name = 'converted_docs.zip';
      }
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: name
      });
      toast.success("PDFs converted successfully!");
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Conversion failed." }));
      toast.error("Failed to convert PDF.");
    }
  };

  return (
    <ToolContainer
      title="PDF to Word"
      description="Convert multiple PDF files to editable Word documents at once."
    >
      <FileUploader 
        accept=".pdf"
        multiple={true}
        onFilesSelected={handleFilesSelected}
        selectedFiles={files}
        onRemoveFile={handleRemoveFile}
        description="Drop PDF files to convert"
      />

      {files.length > 0 && (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in mt-8">
          <div className="flex items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-full w-24 h-24 mx-auto border border-blue-100 dark:border-blue-900">
             <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-center font-medium text-gray-700 dark:text-gray-300">
            {files.length} Document{files.length > 1 ? 's' : ''} Ready
          </p>

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={state.isProcessing}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-1'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Converting {files.length} files...
                  </>
                ) : (
                  <>
                    Convert to Word <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in">
               <a 
                 href={state.resultUrl} 
                 download={state.resultName || "documents.zip"}
                 className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
               >
                 {files.length > 1 ? <Archive className="w-5 h-5" /> : <Download className="w-5 h-5" />} 
                 Download {files.length > 1 ? 'ZIP Archive' : 'Word Doc'}
               </a>
                <button 
                  onClick={() => {
                    setFiles([]);
                    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
                  }}
                  className="block mt-4 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mx-auto"
                >
                  Convert more files
                </button>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default PDFToWordTool;
