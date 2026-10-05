
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, FileDiff, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { renderPageToImage, getPageCount } from '../../services/pdfService';

const CompareTool: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [pages1, setPages1] = useState(1);
  const [pages2, setPages2] = useState(1);
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);
  const [img1, setImg1] = useState<string | null>(null);
  const [img2, setImg2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile1 = async (files: File[]) => {
    const f = files[0];
    setFile1(f);
    setImg1(null);
    const count = await getPageCount(f).catch(() => 1);
    setPages1(count);
    setPage1(1);
  };

  const handleFile2 = async (files: File[]) => {
    const f = files[0];
    setFile2(f);
    setImg2(null);
    const count = await getPageCount(f).catch(() => 1);
    setPages2(count);
    setPage2(1);
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setLoading(true);
    try {
      const [i1, i2] = await Promise.all([
        renderPageToImage(file1, page1),
        renderPageToImage(file2, page2),
      ]);
      setImg1(i1);
      setImg2(i2);
      toast.success('Comparison generated');
    } catch (e) {
      toast.error('Error comparing files');
    } finally {
      setLoading(false);
    }
  };

  const PageNav = ({
    current, total, onChange
  }: { current: number; total: number; onChange: (p: number) => void }) => (
    <div className="flex items-center gap-2 justify-center mt-2">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current <= 1}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[60px] text-center">
        {current} / {total}
      </span>
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current >= total}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );

  return (
    <ToolContainer title="Compare PDF" description="Compare two PDF files side by side, page by page.">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold mb-2 text-center text-gray-700 dark:text-gray-200">File 1</h3>
            {!file1 ? (
              <FileUploader accept=".pdf" multiple={false} onFilesSelected={handleFile1} description="Select first PDF" />
            ) : (
              <div className="text-center">
                <p className="mb-1 font-medium text-green-600 dark:text-green-400 text-sm truncate">{file1.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{pages1} pages</p>
                <PageNav current={page1} total={pages1} onChange={p => { setPage1(p); setImg1(null); }} />
                <button onClick={() => { setFile1(null); setImg1(null); }} className="mt-2 text-xs text-red-500 underline">Change</button>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold mb-2 text-center text-gray-700 dark:text-gray-200">File 2</h3>
            {!file2 ? (
              <FileUploader accept=".pdf" multiple={false} onFilesSelected={handleFile2} description="Select second PDF" />
            ) : (
              <div className="text-center">
                <p className="mb-1 font-medium text-green-600 dark:text-green-400 text-sm truncate">{file2.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{pages2} pages</p>
                <PageNav current={page2} total={pages2} onChange={p => { setPage2(p); setImg2(null); }} />
                <button onClick={() => { setFile2(null); setImg2(null); }} className="mt-2 text-xs text-red-500 underline">Change</button>
              </div>
            )}
          </div>
        </div>

        {file1 && file2 && (
          <div className="flex justify-center">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><ArrowRight /> Compare Pages</>}
            </button>
          </div>
        )}

        {img1 && img2 && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in bg-gray-100 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <div>
              <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                File 1 — Page {page1}
              </p>
              <img src={img1} className="w-full border border-gray-200 dark:border-slate-700 shadow rounded" alt="File 1" />
            </div>
            <div>
              <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                File 2 — Page {page2}
              </p>
              <img src={img2} className="w-full border border-gray-200 dark:border-slate-700 shadow rounded" alt="File 2" />
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
};

export default CompareTool;
