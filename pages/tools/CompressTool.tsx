
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Archive } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import { PDFFile, ProcessingState } from '../../types';
import { compressPDF, generateZip } from '../../services/pdfService';

const CompressTool: React.FC = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [level, setLevel] = useState<number>(0.5); // Compression level (Quality of JPG)
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const location = useLocation();
  const isOptimize = location.pathname.includes('optimize');
  const title = isOptimize ? "Optimize PDF" : "Compress PDF";
  const description = isOptimize 
    ? "Optimize multiple PDF files for web and sharing."
    : "Reduce file size for multiple PDFs at once.";


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

  const handleCompress = async () => {
    if (files.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    const processedFiles: {name: string, data: Uint8Array}[] = [];

    try {
      for (const file of files) {
        // NOTE: This is a client-side simulation using canvas re-rendering
        const compressedBytes = await compressPDF(file.file, level);
        const prefix = isOptimize ? 'optimized' : 'compressed';
        processedFiles.push({
          name: `${prefix}_${file.name}`,
          data: compressedBytes
        });
      }

      let url = '';
      let name = '';

      if (processedFiles.length === 1) {
        const blob = new Blob([processedFiles[0].data], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
        name = processedFiles[0].name;
      } else {
        const zipBlob = await generateZip(processedFiles);
        url = URL.createObjectURL(zipBlob);
        name = `${isOptimize ? 'optimized' : 'compressed'}_files.zip`;
      }
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: name
      });
      toast.success(`${files.length} PDF${files.length > 1 ? 's' : ''} processed successfully!`);
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Compression failed." }));
      toast.error("Failed to process.");
    }
  };

  return (
    <ToolContainer
      title={title}
      description={description}
    >
      <FileUploader 
        accept=".pdf"
        multiple={true}
        onFilesSelected={handleFilesSelected}
        selectedFiles={files}
        onRemoveFile={handleRemoveFile}
        description={`Drop PDF files to ${isOptimize ? 'optimize' : 'compress'}`}
      />

      {files.length > 0 && (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in mt-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
             <div className="flex items-center justify-between mb-4">
                 <span className="font-semibold text-gray-700 dark:text-gray-200">Compression Level</span>
                 <span className="text-sm text-blue-600 dark:text-blue-400 font-bold">{Math.round((1 - level) * 100)}%</span>
             </div>
             <input 
               type="range" 
               min="0.1" 
               max="0.9" 
               step="0.1" 
               value={level}
               onChange={(e) => setLevel(parseFloat(e.target.value))}
               className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
             />
             <div className="flex justify-between text-xs text-gray-400 mt-2">
                 <span>Extreme (Low Quality)</span>
                 <span>Recommended</span>
                 <span>Low (High Quality)</span>
             </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
             <strong>Note:</strong> This client-side optimization re-renders pages as images. Text may no longer be selectable.
          </div>

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleCompress}
                disabled={state.isProcessing}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30 hover:-translate-y-1'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Processing {files.length} files...
                  </>
                ) : (
                  <>
                    {title} {files.length > 1 ? 'All' : ''} <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in w-full">
               {files.length === 1 && <PDFPreview pdfUrl={state.resultUrl} />}
               
               <a 
                 href={state.resultUrl} 
                 download={state.resultName || "result.pdf"}
                 className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
               >
                 {files.length > 1 ? <Archive className="w-5 h-5" /> : <Download className="w-5 h-5" />} 
                 Download {files.length > 1 ? 'ZIP Archive' : 'PDF'}
               </a>
                <button 
                  onClick={() => {
                    setFiles([]);
                    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
                  }}
                  className="block mt-4 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mx-auto"
                >
                  Process more files
                </button>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default CompressTool;
