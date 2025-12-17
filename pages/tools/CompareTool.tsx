
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, FileDiff, Loader2 } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { renderPageToImage } from '../../services/pdfService';

const CompareTool: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [img1, setImg1] = useState<string | null>(null);
  const [img2, setImg2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setLoading(true);
    try {
      const i1 = await renderPageToImage(file1, 1);
      const i2 = await renderPageToImage(file2, 1);
      setImg1(i1);
      setImg2(i2);
      toast.success("Comparison generated");
    } catch(e) {
      toast.error("Error comparing files");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolContainer title="Compare PDF" description="Compare two PDF files side by side visually.">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold mb-2 text-center text-gray-700">File 1</h3>
              {!file1 ? (
                <FileUploader accept=".pdf" multiple={false} onFilesSelected={f => setFile1(f[0])} description="Select first PDF" />
              ) : (
                 <div className="text-center">
                    <p className="mb-2 font-medium text-green-600">{file1.name}</p>
                    <button onClick={() => setFile1(null)} className="text-sm text-red-500 underline">Change</button>
                 </div>
              )}
           </div>
           <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold mb-2 text-center text-gray-700">File 2</h3>
              {!file2 ? (
                <FileUploader accept=".pdf" multiple={false} onFilesSelected={f => setFile2(f[0])} description="Select second PDF" />
              ) : (
                 <div className="text-center">
                    <p className="mb-2 font-medium text-green-600">{file2.name}</p>
                    <button onClick={() => setFile2(null)} className="text-sm text-red-500 underline">Change</button>
                 </div>
              )}
           </div>
        </div>

        {file1 && file2 && !img1 && (
            <div className="flex justify-center">
               <button onClick={handleCompare} disabled={loading} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 flex items-center gap-2">
                 {loading ? <Loader2 className="animate-spin" /> : <>Compare <FileDiff /></>}
               </button>
            </div>
        )}

        {img1 && img2 && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in bg-gray-100 p-4 rounded-xl">
               <div>
                  <p className="text-center text-sm font-bold text-gray-500 mb-2">File 1 - Page 1</p>
                  <img src={img1} className="w-full border shadow" alt="File 1" />
               </div>
               <div>
                  <p className="text-center text-sm font-bold text-gray-500 mb-2">File 2 - Page 1</p>
                  <img src={img2} className="w-full border shadow" alt="File 2" />
               </div>
            </div>
        )}
      </div>
    </ToolContainer>
  );
};

export default CompareTool;
