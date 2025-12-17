
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, FilePenLine } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import SortablePDFGrid from '../../components/SortablePDFGrid';
import PDFPreview from '../../components/PDFPreview';
import { PDFFile, ProcessingState } from '../../types';
import { mergePDFs, renderPageToImage } from '../../services/pdfService';

const MergeTool: React.FC = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [outputName, setOutputName] = useState('merged_document');
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  // Generate Thumbnails Effect
  useEffect(() => {
    let active = true;
    const generateThumbnails = async () => {
        const filesToProcess = files.filter(f => !f.preview);
        if (filesToProcess.length === 0) return;

        for (const fileItem of filesToProcess) {
            if (!active) break;
            try {
                const previewUrl = await renderPageToImage(fileItem.file, 1, 0.5);
                if (!active) break;
                
                setFiles(prev => prev.map(f => {
                    if (f.id === fileItem.id) {
                        return { ...f, preview: previewUrl };
                    }
                    return f;
                }));
            } catch (e) {
                console.error("Thumbnail generation failed for", fileItem.name);
            }
        }
    };

    if (files.length > 0) {
        generateThumbnails();
    }
    
    return () => { active = false; };
  }, [files.length]);

  const handleFilesSelected = (newFiles: File[]) => {
    const pdfFiles: PDFFile[] = newFiles.map(f => ({
      id: uuidv4(),
      file: f,
      name: f.name,
      size: f.size,
      rotation: 0
    }));
    setFiles(prev => [...prev, ...pdfFiles]);
    if (state.resultUrl) {
      setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge.");
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const mergedBytes = await mergePDFs(files);
      
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const finalName = outputName.toLowerCase().endsWith('.pdf') ? outputName : `${outputName}.pdf`;

      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: finalName
      });
      toast.success("PDFs merged successfully!");
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Failed to merge PDFs. Please try again." }));
      toast.error("An error occurred while merging.");
    }
  };

  return (
    <ToolContainer
      title="Merge PDF files"
      description="Combine PDFs in the order you want with the easiest PDF merger available."
    >
      {files.length === 0 ? (
          <FileUploader 
            accept=".pdf"
            multiple={true}
            onFilesSelected={handleFilesSelected}
            selectedFiles={files}
            description="Drop PDF files here to merge"
          />
      ) : (
          <div className="space-y-8">
            <SortablePDFGrid 
                files={files} 
                setFiles={setFiles} 
                onAddFiles={handleFilesSelected} 
            />
          </div>
      )}

      {files.length > 0 && !state.resultUrl && (
        <div className="mt-8 animate-fade-in border-t border-gray-100 dark:border-slate-700 pt-8 flex flex-col items-center gap-6">
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Filename</label>
            <div className="relative">
                <FilePenLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  placeholder="merged_document"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">.pdf</span>
            </div>
          </div>

          <button
            onClick={handleMerge}
            disabled={state.isProcessing || files.length < 2}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
              ${state.isProcessing || files.length < 2
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/30 hover:-translate-y-1'
              }
            `}
          >
            {state.isProcessing ? (
              <>
                <Loader2 className="animate-spin w-6 h-6" /> Merging PDFs...
              </>
            ) : (
              <>
                Merge PDF <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      )}

      {state.resultUrl && (
        <div className="mt-8 text-center animate-fade-in w-full max-w-4xl mx-auto">
          <PDFPreview pdfUrl={state.resultUrl} />
          
          <div className="p-6 bg-green-50 rounded-2xl border border-green-100 inline-block">
            <h3 className="text-xl font-bold text-green-800 mb-4">Your PDF is ready!</h3>
            <a 
              href={state.resultUrl} 
              download={state.resultName || "merged.pdf"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              <Download className="w-5 h-5" /> Download Merged PDF
            </a>
            <button 
              onClick={() => {
                setFiles([]);
                setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
              }}
              className="block mt-4 text-sm text-green-600 hover:underline mx-auto"
            >
              Merge more files
            </button>
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default MergeTool;
