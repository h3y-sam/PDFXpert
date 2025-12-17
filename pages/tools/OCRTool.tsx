import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, ScanText } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import Tesseract from 'tesseract.js';
import { renderPageToImage, getPageCount } from '../../services/pdfService';

const OCRTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [extractedText, setExtractedText] = useState('');
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
    setExtractedText('');
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleOCR = async () => {
    if (!file) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    setExtractedText('');

    try {
      const pageCount = await getPageCount(file.file);
      let fullText = '';

      for (let i = 1; i <= pageCount; i++) {
        // Render PDF page to image
        const dataUrl = await renderPageToImage(file.file, i);
        
        // Recognize text
        const result = await Tesseract.recognize(dataUrl, 'eng', {
            // logger: m => console.log(m) // Optional logging
        });
        
        fullText += `--- Page ${i} ---\n${result.data.text}\n\n`;
      }
      
      setExtractedText(fullText);
      
      // Create a text file download
      const blob = new Blob([fullText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `${file.name}_ocr.txt`
      });
      toast.success("Text recognized successfully!");

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "OCR failed." }));
      toast.error("Failed to recognize text.");
    }
  };

  return (
    <ToolContainer
      title="OCR PDF"
      description="Extract text from scanned PDF files using Optical Character Recognition."
    >
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a scanned PDF here"
        />
      ) : (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          
          {extractedText && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {extractedText}
              </div>
          )}

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleOCR}
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
                    <Loader2 className="animate-spin w-6 h-6" /> Scanning...
                  </>
                ) : (
                  <>
                    Start OCR <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in">
               <a 
                 href={state.resultUrl} 
                 download={state.resultName || "ocr_text.txt"}
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

export default OCRTool;