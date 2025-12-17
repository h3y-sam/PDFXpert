import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { getPageCount, renderPageToImage } from '../../services/pdfService';

const PDFToImageTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    setFile({
      id: uuidv4(),
      file: f,
      name: f.name,
      size: f.size
    });
    setGeneratedImages([]);
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleConvert = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    setGeneratedImages([]);

    try {
      const pageCount = await getPageCount(file.file);
      const images: string[] = [];

      for(let i = 1; i <= pageCount; i++) {
        // Update status for better UX on large files
        // In a real app we'd update a progress bar here
        const dataUrl = await renderPageToImage(file.file, i);
        images.push(dataUrl);
      }

      setGeneratedImages(images);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: 'dummy', // Not using single URL download for multiple files
        resultName: 'images'
      });
      toast.success("Converted successfully!");

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Conversion failed." }));
      toast.error("Failed to convert PDF to images.");
    }
  };

  return (
    <ToolContainer
      title="PDF to JPG"
      description="Convert each page of your PDF into a JPG image."
    >
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF to convert to images"
        />
      ) : (
        <div className="space-y-8 animate-fade-in">
          {generatedImages.length === 0 ? (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={state.isProcessing}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-yellow-500/30 hover:-translate-y-1'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Converting Pages...
                  </>
                ) : (
                  <>
                    Convert to JPG <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Generated Images</h3>
                <button 
                  onClick={() => {
                    setFile(null);
                    setGeneratedImages([]);
                  }}
                  className="text-sm text-red-500 hover:underline"
                >
                  Clear & Start Over
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedImages.map((img, idx) => (
                  <div key={idx} className="group relative rounded-lg overflow-hidden shadow-md border border-gray-100">
                    <img src={img} alt={`Page ${idx + 1}`} className="w-full h-auto" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a 
                        href={img} 
                        download={`${file.name}_page_${idx+1}.jpg`}
                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-blue-50"
                        title="Download Image"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 text-center text-xs py-1">
                      Page {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default PDFToImageTool;