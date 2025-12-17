
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Unlock } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import { PDFFile, ProcessingState } from '../../types';
import { unlockPDF } from '../../services/pdfService';

const UnlockTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [password, setPassword] = useState('');
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
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
    setPassword('');
  };

  const handleUnlock = async () => {
    if (!file || !password) {
      toast.error("Please enter the password to unlock");
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const unlockedBytes = await unlockPDF(file.file, password);
      
      const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `unlocked_${file.name}`
      });
      toast.success("PDF Unlocked successfully!");
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: "Incorrect password or corrupted file." }));
      toast.error("Failed to unlock. Check your password.");
    }
  };

  return (
    <ToolContainer
      title="Unlock PDF"
      description="Remove password security from PDF files."
    >
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a protected PDF to unlock"
        />
      ) : (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
             <label className="block text-sm font-medium text-gray-700 mb-2">Enter PDF Password</label>
             <div className="relative">
                <Unlock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  placeholder="Password"
                />
             </div>
          </div>

          {!state.resultUrl ? (
            <div className="flex justify-center">
              <button
                onClick={handleUnlock}
                disabled={state.isProcessing || !password}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all
                  ${state.isProcessing || !password
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-pink-600 hover:bg-pink-700 hover:shadow-pink-600/30 hover:-translate-y-1'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" /> Unlocking...
                  </>
                ) : (
                  <>
                    Unlock PDF <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in w-full">
               <PDFPreview pdfUrl={state.resultUrl} />
               <a 
                 href={state.resultUrl} 
                 download={state.resultName || "unlocked.pdf"}
                 className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
               >
                 <Download className="w-5 h-5" /> Download Unlocked PDF
               </a>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default UnlockTool;
