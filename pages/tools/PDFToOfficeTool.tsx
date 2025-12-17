
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { extractTextFromPDF } from '../../services/pdfService';

const PDFToOfficeTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const location = useLocation();
  const path = location.pathname;
  
  let targetFormat = 'doc';
  let mimeType = 'application/msword';
  let title = "PDF to Word";
  
  if (path.includes('excel') || path.includes('csv')) {
      targetFormat = 'csv';
      mimeType = 'text/csv';
      title = path.includes('excel') ? "PDF to Excel" : "PDF to CSV";
  } else if (path.includes('ppt')) {
      targetFormat = 'ppt';
      mimeType = 'application/vnd.ms-powerpoint';
      title = "PDF to PowerPoint";
  } else if (path.includes('html')) {
      targetFormat = 'html';
      mimeType = 'text/html';
      title = "PDF to HTML";
  } else if (path.includes('json')) {
      targetFormat = 'json';
      mimeType = 'application/json';
      title = "PDF to JSON";
  }

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
      const text = await extractTextFromPDF(file.file);
      let content = '';

      if (targetFormat === 'csv') {
          // Naive CSV conversion: treat lines as rows, tabs/double-spaces as columns
          content = text.split('\n').map(line => line.replace(/\s{2,}/g, ',')).join('\n');
      } else if (targetFormat === 'json') {
          content = JSON.stringify({ filename: file.name, textContent: text }, null, 2);
      } else if (targetFormat === 'html') {
          content = `<html><body><pre>${text}</pre></body></html>`;
      } else if (targetFormat === 'ppt') {
          // Simple HTML-based PPT export
          content = `<html><body><div class="slide"><h1>${file.name}</h1><p>${text.replace(/\n\n/g, '</div><div class="slide"><p>').replace(/\n/g, '<br/>')}</p></div></body></html>`;
      } else {
          // Word (Doc)
          content = `<html><body><pre>${text}</pre></body></html>`;
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      setState({ isProcessing: false, progress: 100, error: null, resultUrl: url, resultName: `${file.name.split('.')[0]}.${targetFormat}` });
      toast.success(`Converted to ${title.split(' ')[2]}!`);
    } catch(e) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error("Conversion failed.");
    }
  };

  return (
    <ToolContainer title={title} description={`Convert PDF documents to ${targetFormat.toUpperCase()} format.`}>
      {!file ? (
        <FileUploader accept=".pdf" multiple={false} onFilesSelected={handleFilesSelected} description="Drop PDF to convert" />
      ) : (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
           <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm text-center">
             Note: This text-based conversion extracts content from the PDF. Formatting may not be preserved perfectly in the {targetFormat.toUpperCase()} output.
           </div>
           
           {!state.resultUrl ? (
             <div className="flex justify-center">
               <button onClick={handleConvert} disabled={state.isProcessing} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                 {state.isProcessing ? <Loader2 className="animate-spin" /> : <>Convert to {targetFormat.toUpperCase()} <ArrowRight /></>}
               </button>
             </div>
           ) : (
             <div className="flex justify-center">
               <a href={state.resultUrl} download={state.resultName || `doc.${targetFormat}`} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2">
                 <Download /> Download {targetFormat.toUpperCase()}
               </a>
             </div>
           )}
        </div>
      )}
    </ToolContainer>
  );
};

export default PDFToOfficeTool;
