import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, Lock, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import PDFPreview from '../../components/PDFPreview';
import ProcessTransparencyModal from '../../components/ProcessTransparencyModal';
import { PDFFile, ProcessingState } from '../../types';
import { protectPDF } from '../../services/pdfService';
import { TransparencyTracker } from '../../services/transparencyTracker';

const ProtectTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleProtect = async () => {
    if (!file || !password) {
      toast.error("Please enter a password");
      return;
    }

    const tracker = new TransparencyTracker(
      [
        'Initialize offline cryptographic engine',
        'Parse document object catalog in memory',
        'Derive AES-256 encryption keys & initialization vectors',
        'Encrypt stream objects and generate protected PDF',
      ],
      (updated) => setState((prev) => ({ ...prev, ...updated }))
    );

    try {
      tracker.setStep(0, `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      await new Promise((r) => setTimeout(r, 120));

      tracker.setStep(1, 'Loading cross-reference tables');
      await new Promise((r) => setTimeout(r, 150));

      tracker.setStep(2, 'Deriving AES encryption key from user password');
      await new Promise((r) => setTimeout(r, 200));

      tracker.setStep(3, 'Encrypting page dictionaries and streams');
      const protectedBytes = await protectPDF(file.file, password);
      
      const blob = new Blob([protectedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `protected_${file.name}`;
      
      tracker.complete(url, outName, `Encrypted with AES standard`);
      toast.success("PDF Protected successfully!");
    } catch (err: any) {
      console.error(err);
      tracker.fail(err?.message || "Protection failed.");
      toast.error("Failed to protect PDF.");
    }
  };

  return (
    <ToolContainer
      title="Protect PDF"
      description="Encrypt your PDF file with a password using client-side cryptographic security."
    >
      <ProcessTransparencyModal
        state={state}
        title="Encrypting PDF Document"
        originalSize={file?.size}
        onClose={() => setState((prev) => ({ ...prev, isProcessing: false, error: null }))}
        onDownload={() => {
          if (state.resultUrl) {
            const a = document.createElement('a');
            a.href = state.resultUrl;
            a.download = state.resultName || 'protected.pdf';
            a.click();
          }
        }}
      />

      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF to protect"
        />
      ) : (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          {/* File Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setPassword(''); }}
              className="text-xs text-slate-400 hover:text-rose-500 font-medium ml-3 shrink-0"
            >
              Change file
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">Set Security Password</label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 p-3.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                placeholder="Enter password..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> AES encryption applied directly in your browser without transmitting your password.
            </p>
          </div>

          {!state.resultUrl && (
            <div className="flex justify-center">
              <button
                onClick={handleProtect}
                disabled={state.isProcessing || !password}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl transition-all
                  ${state.isProcessing || !password
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:shadow-rose-500/25 hover:-translate-y-0.5'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Encrypting...
                  </>
                ) : (
                  <>
                    Protect PDF Now <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {state.resultUrl && (
            <div className="mt-8 text-center animate-fade-in w-full max-w-4xl mx-auto">
              <PDFPreview pdfUrl={state.resultUrl} />
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 inline-block mt-4">
                <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Password Protection Active!</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">Your document is now secured with password encryption.</p>
                <a 
                  href={state.resultUrl} 
                  download={state.resultName || "protected.pdf"}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-5 h-5" /> Download Protected PDF
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default ProtectTool;
