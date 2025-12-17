
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, ArrowLeftRight, FilePenLine } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import SortablePageGrid, { PageItem } from '../../components/SortablePageGrid';
import { PDFFile, ProcessingState } from '../../types';
import { getPageCount, assemblePDF, renderPageToImage } from '../../services/pdfService';

const ReorderPagesTool: React.FC = () => {
  // We store source files to reference them later during assembly
  const [sourceFiles, setSourceFiles] = useState<Map<string, File>>(new Map());
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputName, setOutputName] = useState('organized_document');
  
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    setIsGenerating(true);
    const newPages: PageItem[] = [];
    const newSourceFiles = new Map(sourceFiles);

    // If it's the first file and we had no files, set default name
    if (sourceFiles.size === 0 && newFiles.length > 0) {
        setOutputName(newFiles[0].name.replace('.pdf', ''));
    }

    try {
        for (const f of newFiles) {
            const fileId = uuidv4();
            newSourceFiles.set(fileId, f);
            
            const count = await getPageCount(f);
            const limit = Math.min(count, 100); // Safety limit per file
            
            for (let i = 1; i <= limit; i++) {
                try {
                    // Generate low-res thumbnail
                    const url = await renderPageToImage(f, i, 0.4); 
                    newPages.push({
                        id: uuidv4(),
                        fileId: fileId,
                        originalIndex: i - 1, // 0-based
                        preview: url
                    });
                } catch(e) {
                    console.error("Error rendering page", i);
                }
            }
            if (count > 100) toast("Large file: Only first 100 pages loaded", { icon: 'ℹ️' });
        }
        
        setSourceFiles(newSourceFiles);
        setPages(prev => [...prev, ...newPages]);
        setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
        
    } catch (e) {
        toast.error("Error processing PDF files");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAssemble = async () => {
    if (pages.length === 0) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Map current pages back to source file + index
      const pageInstructions = pages.map(p => {
          const file = sourceFiles.get(p.fileId);
          if (!file) throw new Error("Source file missing");
          return {
              file: file,
              pageIndex: p.originalIndex
          };
      });

      const newBytes = await assemblePDF(pageInstructions);
      
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const finalName = outputName.toLowerCase().endsWith('.pdf') ? outputName : `${outputName}.pdf`;

      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: finalName
      });
      toast.success("PDF Organized successfully!");
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Failed to assemble PDF." }));
      toast.error("Error creating PDF.");
    }
  };

  const handleReset = () => {
      setPages([]);
      setSourceFiles(new Map());
      setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  return (
    <ToolContainer
      title="Organize PDF"
      description="Sort, add, delete, and rotate pages from multiple PDF files."
    >
      {pages.length === 0 && !isGenerating ? (
        <FileUploader 
          accept=".pdf"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          description="Drop PDF files to organize"
        />
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl gap-4">
             <div>
                 <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    {pages.length} Pages <span className="text-sm font-normal text-gray-500">from {sourceFiles.size} files</span>
                 </p>
                 <p className="text-sm text-gray-500 dark:text-slate-400">Drag pages to reorder or add more files.</p>
             </div>
             <button onClick={handleReset} className="text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                Remove All
             </button>
          </div>

          {/* Grid */}
          <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700 min-h-[300px]">
             {isGenerating && pages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                    <span>Processing files...</span>
                 </div>
             ) : (
                 <SortablePageGrid 
                    pages={pages} 
                    setPages={setPages} 
                    onAddFiles={handleFilesSelected}
                 />
             )}
          </div>

          {/* Controls */}
          {!state.resultUrl ? (
            <div className="flex flex-col items-center gap-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Filename</label>
                <div className="relative">
                    <FilePenLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={outputName}
                      onChange={(e) => setOutputName(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      placeholder="organized_document"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">.pdf</span>
                </div>
              </div>

              <button
                onClick={handleAssemble}
                disabled={state.isProcessing || isGenerating || pages.length === 0}
                className={`
                  flex items-center gap-3 px-10 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing || isGenerating || pages.length === 0
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 hover:-translate-y-1'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Assembling...
                  </>
                ) : (
                  <>
                    Organize & Merge <ArrowLeftRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in">
               <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 inline-block">
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4">Done!</h3>
                  <a 
                    href={state.resultUrl} 
                    download={state.resultName || "organized.pdf"}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                  >
                    <Download className="w-5 h-5" /> Download Organized PDF
                  </a>
                  <button 
                    onClick={() => setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null })}
                    className="block mt-4 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mx-auto underline"
                  >
                    Keep Editing
                  </button>
               </div>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default ReorderPagesTool;
