
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, FileText, Scissors, Layers, Archive, FilePenLine, Plus, RotateCw, Trash2, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { getPageCount, splitPDF, splitPDFMultiple, generateZip, renderPageToImage } from '../../services/pdfService';

type SplitMode = 'ranges' | 'extract';

const SplitTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  
  // Split State
  const [splitMode, setSplitMode] = useState<SplitMode>('ranges');
  const [splitPoints, setSplitPoints] = useState<Set<number>>(new Set()); // Index of page AFTER which split occurs (0-based)
  const [splitStep, setSplitStep] = useState<number | string>(1);
  const [isFixedSplit, setIsFixedSplit] = useState(false);
  
  // Extract State
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  // General Settings
  const [outputName, setOutputName] = useState('split_document');
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const location = useLocation();
  const isExtractRoute = location.pathname.includes('extract');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExtractRoute) setSplitMode('extract');
    else setSplitMode('ranges');
  }, [isExtractRoute]);

  // Generate Fixed Splits when option is toggled or step changes
  useEffect(() => {
    if (isFixedSplit && file && thumbnails.length > 0) {
      const step = typeof splitStep === 'string' ? parseInt(splitStep) || 1 : splitStep;
      const newSplits = new Set<number>();
      for (let i = step - 1; i < thumbnails.length - 1; i += step) {
        newSplits.add(i);
      }
      setSplitPoints(newSplits);
    }
  }, [isFixedSplit, splitStep, thumbnails.length, file]);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0]; 
    
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    setSplitPoints(new Set());
    setSelectedPages(new Set());
    setThumbnails([]);

    try {
      const count = await getPageCount(f);
      setFile({
        id: uuidv4(),
        file: f,
        name: f.name,
        size: f.size
      });
      setOutputName(f.name.replace('.pdf', ''));
      
      // Generate thumbnails
      setIsGeneratingPreviews(true);
      const thumbs: string[] = [];
      // Limit preview generation for performance, max 50 pages
      const limit = Math.min(count, 50);
      
      for (let i = 1; i <= limit; i++) {
         try {
             const url = await renderPageToImage(f, i, 0.4); // Low res
             thumbs.push(url);
             setThumbnails([...thumbs]); // Progressive update
         } catch (e) {
             console.error("Error rendering page", i);
         }
      }
      setIsGeneratingPreviews(false);
      if (count > 50) toast("Large file: Only showing first 50 pages", { icon: 'ℹ️' });

    } catch (e) {
      toast.error("Could not read PDF file.");
      setIsGeneratingPreviews(false);
    }
  };

  const toggleSplit = (index: number) => {
    if (isFixedSplit) return; // Disable manual toggle in fixed mode
    const newSplits = new Set(splitPoints);
    if (newSplits.has(index)) {
      newSplits.delete(index);
    } else {
      newSplits.add(index);
    }
    setSplitPoints(newSplits);
  };

  const toggleSelection = (index: number) => {
    const newSel = new Set(selectedPages);
    if (newSel.has(index)) newSel.delete(index);
    else newSel.add(index);
    setSelectedPages(newSel);
  };

  const selectAll = () => {
    if (selectedPages.size === thumbnails.length) setSelectedPages(new Set());
    else setSelectedPages(new Set(thumbnails.map((_, i) => i)));
  };

  const handleProcess = async () => {
    if (!file) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      if (splitMode === 'extract') {
          // Explicit cast to number[] to fix arithmetic sorting errors
          const pages = (Array.from(selectedPages) as number[]).sort((a, b) => a - b);
          if (pages.length === 0) throw new Error("Please select at least one page to extract.");

          const bytes = await splitPDF(file.file, pages);
          createDownload(bytes, `${outputName}_extracted.pdf`);
          
      } else {
          // Ranges Mode
          const ranges: number[][] = [];
          let currentRange: number[] = [];
          
          // Assuming thumbnails length is accurate for total pages (or use actual page count if implemented fully)
          const totalPages = thumbnails.length; 
          
          for (let i = 0; i < totalPages; i++) {
              currentRange.push(i);
              if (splitPoints.has(i) || i === totalPages - 1) {
                  ranges.push(currentRange);
                  currentRange = [];
              }
          }

          if (ranges.length === 0) ranges.push([0]); // Fallback
          
          await processMultipleSplit(ranges);
      }

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: err.message || "Error processing" }));
      toast.error(err.message || "Error processing");
    }
  };

  const processMultipleSplit = async (ranges: number[][]) => {
     if(!file) return;
     const results = await splitPDFMultiple(file.file, ranges, outputName);
     
     if (results.length === 1) {
         createDownload(results[0].data, results[0].name);
     } else {
         const zip = await generateZip(results);
         const url = URL.createObjectURL(zip);
         setState({
            isProcessing: false,
            progress: 100,
            error: null,
            resultUrl: url,
            resultName: `${outputName}_split_files.zip`
         });
         toast.success(`Split into ${results.length} files successfully!`);
     }
  };

  const createDownload = (data: Uint8Array, name: string) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: name
      });
      toast.success("Processed successfully!");
  };

  // UI Helpers
  const getRangeName = (index: number) => {
    // Explicit cast to number[] to fix arithmetic operation errors
    let start = 0;
    let rangeIndex = 1;
    const sortedSplits = (Array.from(splitPoints) as number[]).sort((a, b) => a - b);
    
    for (const splitPoint of sortedSplits) {
        if (index <= splitPoint) {
            return { rangeIndex, start: start + 1, end: splitPoint + 1 };
        }
        start = splitPoint + 1;
        rangeIndex++;
    }
    return { rangeIndex, start: start + 1, end: thumbnails.length };
  };

  return (
    <ToolContainer
      title={isExtractRoute ? "Extract Pages" : "Split PDF"}
      description="Extract pages from your PDF or split it into multiple files."
      actionArea={
        !file ? null : (
            <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-8 animate-fade-in">
                 {/* Rename Input */}
                 <div className="w-full mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Filename</label>
                    <div className="relative">
                        <FilePenLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          value={outputName}
                          onChange={(e) => setOutputName(e.target.value)}
                          className="w-full pl-10 p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                          placeholder="filename"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm opacity-50">.pdf</span>
                    </div>
                 </div>

                 {!state.resultUrl ? (
                    <button
                        onClick={handleProcess}
                        disabled={state.isProcessing || isGeneratingPreviews}
                        className={`
                        flex items-center gap-3 px-12 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all w-full md:w-auto justify-center
                        ${state.isProcessing || isGeneratingPreviews
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:-translate-y-1'
                        }
                        `}
                    >
                        {state.isProcessing ? (
                        <>
                            <Loader2 className="animate-spin w-6 h-6" /> Processing...
                        </>
                        ) : (
                        <>
                            {splitMode === 'extract' ? 'Extract Pages' : 'Split PDF'} <ArrowRight className="w-6 h-6" />
                        </>
                        )}
                    </button>
                 ) : (
                    <div className="text-center animate-fade-in w-full">
                        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                           <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4">Success!</h3>
                           <a 
                             href={state.resultUrl} 
                             download={state.resultName || "result.pdf"}
                             className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                           >
                             {state.resultName?.endsWith('.zip') ? <Archive className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                             Download {state.resultName?.endsWith('.zip') ? 'ZIP Archive' : 'PDF'}
                           </a>
                           <button 
                             onClick={() => { setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null }); }}
                             className="block mt-4 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mx-auto underline"
                           >
                             Process another file
                           </button>
                        </div>
                    </div>
                 )}
            </div>
        )
      }
    >
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF file here"
        />
      ) : (
        <div className="w-full">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                <button 
                  onClick={() => setSplitMode('ranges')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${splitMode === 'ranges' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                >
                   <Scissors className="w-4 h-4" /> Split by Range
                </button>
                <button 
                  onClick={() => setSplitMode('extract')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${splitMode === 'extract' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                >
                   <FileText className="w-4 h-4" /> Extract Pages
                </button>
             </div>

             {/* Split Options */}
             {splitMode === 'ranges' && (
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2">
                       <input 
                         type="checkbox" 
                         id="fixedSplit" 
                         checked={isFixedSplit} 
                         onChange={e => setIsFixedSplit(e.target.checked)}
                         className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                       />
                       <label htmlFor="fixedSplit" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Split after every</label>
                   </div>
                   <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden w-28 bg-white dark:bg-slate-800">
                       <button disabled={!isFixedSplit} onClick={() => setSplitStep(prev => Math.max(1, (typeof prev === 'number' ? prev : parseInt(prev) || 1) - 1))} className="px-2 py-1 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 disabled:opacity-50 text-gray-600 dark:text-gray-300">-</button>
                       <input 
                          type="number" 
                          value={splitStep}
                          onChange={(e) => setSplitStep(e.target.value)}
                          disabled={!isFixedSplit}
                          className="w-full text-center p-1 outline-none text-sm dark:bg-slate-800 dark:text-white"
                          min="1"
                       />
                       <button disabled={!isFixedSplit} onClick={() => setSplitStep(prev => (typeof prev === 'number' ? prev : parseInt(prev) || 1) + 1)} className="px-2 py-1 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 disabled:opacity-50 text-gray-600 dark:text-gray-300">+</button>
                   </div>
                   <span className="text-sm text-gray-600 dark:text-gray-400">pages</span>
                </div>
             )}

             {splitMode === 'extract' && (
                 <div className="flex items-center gap-2">
                    <button onClick={selectAll} className="text-sm text-blue-600 hover:underline font-medium">
                        {selectedPages.size === thumbnails.length ? 'Deselect All' : 'Select All'}
                    </button>
                 </div>
             )}
          </div>

          {/* Main Visual Area */}
          <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 min-h-[300px] p-6 overflow-hidden">
             
             {isGeneratingPreviews && thumbnails.length === 0 ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                     <Loader2 className="w-8 h-8 animate-spin mb-2" />
                     <p>Generating page previews...</p>
                 </div>
             ) : (
                <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
                   <div className="flex items-start gap-0 min-w-max px-4 pt-8">
                      {thumbnails.map((thumb, index) => {
                         const isSplit = splitPoints.has(index);
                         const isSelected = selectedPages.has(index);
                         const rangeInfo = getRangeName(index);
                         
                         return (
                           <React.Fragment key={index}>
                              {/* Page Card */}
                              <div 
                                className={`relative group w-36 flex flex-col items-center transition-all duration-200 ${splitMode === 'extract' ? 'cursor-pointer' : ''}`}
                                onClick={() => splitMode === 'extract' && toggleSelection(index)}
                              >
                                 {/* Extract Selection Checkbox */}
                                 {splitMode === 'extract' && (
                                     <div className={`absolute -top-3 right-2 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                         {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                     </div>
                                 )}

                                 <div className={`
                                     relative w-32 aspect-[1/1.4] bg-white dark:bg-slate-800 rounded-lg shadow-sm border overflow-hidden transition-all
                                     ${splitMode === 'extract' && isSelected ? 'ring-2 ring-blue-500 shadow-md transform scale-105' : 'border-gray-200 dark:border-slate-600'}
                                     ${splitMode === 'ranges' ? 'hover:shadow-md' : 'hover:border-blue-300'}
                                 `}>
                                     <div className="w-full h-full flex items-center justify-center p-2">
                                         <img src={thumb} alt={`Page ${index + 1}`} className="max-w-full max-h-full object-contain shadow-sm pointer-events-none" />
                                     </div>
                                     <div className="absolute bottom-0 inset-x-0 bg-white/90 dark:bg-slate-800/90 text-center py-1 border-t border-gray-100 dark:border-slate-700">
                                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{index + 1}</span>
                                     </div>
                                 </div>

                                 {/* Range Label (Only for Split Mode) */}
                                 {splitMode === 'ranges' && (
                                     <div className="mt-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-medium rounded-full truncate max-w-full">
                                         {outputName}_{rangeInfo.rangeIndex}
                                     </div>
                                 )}
                              </div>

                              {/* Divider / Splitter (Only if not last page) */}
                              {index < thumbnails.length - 1 && splitMode === 'ranges' && (
                                  <div className="relative w-12 h-48 flex items-center justify-center -mx-4 z-10">
                                      {/* Clickable Area */}
                                      <div 
                                        className="group cursor-pointer flex flex-col items-center h-full justify-center w-full"
                                        onClick={() => toggleSplit(index)}
                                      >
                                          {/* The Line */}
                                          <div className={`w-0.5 h-full transition-colors duration-200 ${isSplit ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700 group-hover:bg-blue-300'}`}></div>
                                          
                                          {/* The Scissor Icon */}
                                          <div className={`
                                              absolute bg-white dark:bg-slate-800 rounded-full p-1.5 border transition-all duration-200 shadow-sm
                                              ${isSplit ? 'border-blue-500 text-blue-500 scale-110' : 'border-gray-300 dark:border-slate-600 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400'}
                                          `}>
                                              <Scissors className="w-4 h-4" />
                                          </div>
                                      </div>
                                  </div>
                              )}
                              
                              {/* Simple spacer for extract mode */}
                              {index < thumbnails.length - 1 && splitMode === 'extract' && <div className="w-4"></div>}

                           </React.Fragment>
                         );
                      })}
                      
                      {/* Add PDF Card Placeholder */}
                      {splitMode === 'ranges' && (
                        <div className="ml-4 w-32 aspect-[1/1.4] rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60" title="Processing multiple files is coming soon">
                            <Plus className="w-8 h-8" />
                            <span className="text-xs font-medium text-center px-2">Merge & Split<br/>Coming Soon</span>
                        </div>
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default SplitTool;
