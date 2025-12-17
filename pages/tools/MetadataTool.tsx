
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { ArrowRight, Download, Loader2, FileDigit } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFFile, ProcessingState } from '../../types';
import { editMetadata } from '../../services/pdfService';

const MetadataTool: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [meta, setMeta] = useState({ title: '', author: '', subject: '', keywords: '' });
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
    setFile({ id: uuidv4(), file: f, name: f.name, size: f.size });
    setMeta({ title: f.name.replace('.pdf', ''), author: '', subject: '', keywords: '' });
    setState({ isProcessing: false, progress: 0, error: null, resultUrl: null, resultName: null });
  };

  const handleUpdate = async () => {
    if (!file) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const keywords = meta.keywords.split(',').map(k => k.trim()).filter(k => k);
      const newBytes = await editMetadata(file.file, { ...meta, keywords });
      
      const blob = new Blob([newBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState({
        isProcessing: false,
        progress: 100,
        error: null,
        resultUrl: url,
        resultName: `metadata_${file.name}`
      });
      toast.success("Metadata updated!");
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: "Failed to update." }));
      toast.error("Failed to update metadata.");
    }
  };

  return (
    <ToolContainer
      title="Edit PDF Metadata"
      description="Modify title, author, subject and keywords of your PDF."
    >
      {!file ? (
        <FileUploader 
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Drop a PDF to edit metadata"
        />
      ) : (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Author</label>
              <input type="text" value={meta.author} onChange={e => setMeta({...meta, author: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" value={meta.subject} onChange={e => setMeta({...meta, subject: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Keywords (comma separated)</label>
              <input type="text" value={meta.keywords} onChange={e => setMeta({...meta, keywords: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
          </div>

          {!state.resultUrl ? (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleUpdate}
                disabled={state.isProcessing}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all ${state.isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {state.isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <>Update Metadata <FileDigit className="w-5 h-5" /></>}
              </button>
            </div>
          ) : (
             <div className="text-center animate-fade-in">
               <a href={state.resultUrl} download={state.resultName || "document.pdf"} className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg">
                 <Download className="w-5 h-5" /> Download PDF
               </a>
             </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
};

export default MetadataTool;
