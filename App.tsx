
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tools from './pages/Tools';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-Loaded Tools for Optimal First Contentful Paint & Mobile Performance
const MergeTool = lazy(() => import('./pages/tools/MergeTool'));
const SplitTool = lazy(() => import('./pages/tools/SplitTool'));
const ImageToPDFTool = lazy(() => import('./pages/tools/ImageToPDFTool'));
const PDFToImageTool = lazy(() => import('./pages/tools/PDFToImageTool'));
const CompressTool = lazy(() => import('./pages/tools/CompressTool'));
const RotateTool = lazy(() => import('./pages/tools/RotateTool'));
const ProtectTool = lazy(() => import('./pages/tools/ProtectTool'));
const UnlockTool = lazy(() => import('./pages/tools/UnlockTool'));
const WatermarkTool = lazy(() => import('./pages/tools/WatermarkTool'));
const OCRTool = lazy(() => import('./pages/tools/OCRTool'));
const PDFToWordTool = lazy(() => import('./pages/tools/PDFToWordTool'));
const PDFToTextTool = lazy(() => import('./pages/tools/PDFToTextTool'));
const DeletePagesTool = lazy(() => import('./pages/tools/DeletePagesTool'));
const ReorderPagesTool = lazy(() => import('./pages/tools/ReorderPagesTool'));
const MetadataTool = lazy(() => import('./pages/tools/MetadataTool'));
const ImageResizerTool = lazy(() => import('./pages/tools/ImageResizerTool'));
const ImageCompressorTool = lazy(() => import('./pages/tools/ImageCompressorTool'));
const AddPageNumbersTool = lazy(() => import('./pages/tools/AddPageNumbersTool'));
const RepairTool = lazy(() => import('./pages/tools/RepairTool'));
const FlattenTool = lazy(() => import('./pages/tools/FlattenTool'));
const EditPDFTool = lazy(() => import('./pages/tools/EditPDFTool'));
const CropTool = lazy(() => import('./pages/tools/CropTool'));
const CompareTool = lazy(() => import('./pages/tools/CompareTool'));
const PDFToOfficeTool = lazy(() => import('./pages/tools/PDFToOfficeTool'));
const OfficeToPDFTool = lazy(() => import('./pages/tools/OfficeToPDFTool'));
const AIPDFTool = lazy(() => import('./pages/tools/AIPDFTool'));
const ScannerTool = lazy(() => import('./pages/tools/ScannerTool'));
const PDFReaderTool = lazy(() => import('./pages/tools/PDFReaderTool'));
const PDFConverterTool = lazy(() => import('./pages/tools/PDFConverterTool'));
const PassportPhotoMakerTool = lazy(() => import('./pages/tools/PassportPhotoMakerTool'));
const BulkPDFTool = lazy(() => import('./pages/tools/BulkPDFTool'));
const FormBuilderTool = lazy(() => import('./pages/tools/FormBuilderTool'));
const ComingSoon = lazy(() => import('./pages/tools/ComingSoon'));

import { Toaster } from 'react-hot-toast';
import { PremiumProvider } from './context/PremiumContext';
import UpgradeModal from './components/UpgradeModal';
import InstallPwaBanner from './components/InstallPwaBanner';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading tool...</span>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <HashRouter>
      <PremiumProvider>
        <ScrollToTop />
        <UpgradeModal />
        <InstallPwaBanner />
        <div className={`flex flex-col min-h-screen relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
          
          {/* Header with Logo and Navigation */}
          <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />

          {/* Background blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
          </div>
          
          {/* Main Content with top padding to account for fixed header */}
          <main className="flex-grow z-10 pt-20">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tools" element={<Tools />} />
                  
                  {/* Core Tools */}
                  <Route path="/tools/merge" element={<MergeTool />} />
                  <Route path="/tools/split" element={<SplitTool />} />
                  <Route path="/tools/img-to-pdf" element={<ImageToPDFTool />} />
                  <Route path="/tools/pdf-to-img" element={<PDFToImageTool />} />
                  <Route path="/tools/compress" element={<CompressTool />} />
                  <Route path="/tools/rotate" element={<RotateTool />} />
                  <Route path="/tools/protect" element={<ProtectTool />} />
                  <Route path="/tools/unlock" element={<UnlockTool />} />
                  <Route path="/tools/watermark" element={<WatermarkTool />} />
                  <Route path="/tools/ocr" element={<OCRTool />} />
                  <Route path="/tools/pdf-to-text" element={<PDFToTextTool />} />
                  <Route path="/tools/delete-pages" element={<DeletePagesTool />} />
                  <Route path="/tools/reorder-pages" element={<ReorderPagesTool />} />
                  <Route path="/tools/edit-metadata" element={<MetadataTool />} />
                  <Route path="/tools/image-resizer" element={<ImageResizerTool />} />
                  <Route path="/tools/image-compressor" element={<ImageCompressorTool />} />
                  <Route path="/tools/add-page-numbers" element={<AddPageNumbersTool />} />
                  <Route path="/tools/repair-pdf" element={<RepairTool />} />
                  <Route path="/tools/flatten-pdf" element={<FlattenTool />} />

                  {/* Aliases */}
                  <Route path="/tools/jpg-to-pdf" element={<ImageToPDFTool />} />
                  <Route path="/tools/png-to-pdf" element={<ImageToPDFTool />} />
                  <Route path="/tools/pdf-to-png" element={<PDFToImageTool />} />
                  <Route path="/tools/extract-pages" element={<SplitTool />} />
                  <Route path="/tools/optimize-pdf" element={<CompressTool />} />
                  <Route path="/tools/scan-to-pdf" element={<ImageToPDFTool />} />

                  {/* New Functional Tools */}
                  <Route path="/tools/form-builder" element={<FormBuilderTool />} />
                  <Route path="/tools/create-form" element={<FormBuilderTool />} />
                  <Route path="/tools/fillable-form" element={<FormBuilderTool />} />
                  <Route path="/tools/edit-pdf" element={<EditPDFTool />} />
                  <Route path="/tools/sign-pdf" element={<EditPDFTool />} />
                  <Route path="/tools/redact-pdf" element={<EditPDFTool />} />
                  <Route path="/tools/form-filler" element={<EditPDFTool />} />
                  <Route path="/tools/request-signatures" element={<EditPDFTool />} />
                  <Route path="/tools/share-pdf" element={<EditPDFTool />} />
                  <Route path="/tools/crop-pdf" element={<CropTool />} />
                  <Route path="/tools/compare-pdf" element={<CompareTool />} />
                  
                  {/* AI PDF Suite */}
                  <Route path="/tools/ai-assistant" element={<AIPDFTool />} />
                  <Route path="/tools/chat-pdf" element={<AIPDFTool />} />
                  <Route path="/tools/summarize-pdf" element={<AIPDFTool />} />
                  <Route path="/tools/translate-pdf" element={<AIPDFTool />} />
                  <Route path="/tools/question-generator" element={<AIPDFTool />} />
                  <Route path="/tools/ai-quiz-generator" element={<AIPDFTool />} />

                  {/* Studio Print & Photo Tools */}
                  <Route path="/tools/passport-photo-maker" element={<PassportPhotoMakerTool />} />
                  <Route path="/tools/passport-photo" element={<PassportPhotoMakerTool />} />
                  <Route path="/tools/print-photo" element={<PassportPhotoMakerTool />} />

                  {/* Bulk & Batch PDF Automation */}
                  <Route path="/tools/bulk-pdf" element={<BulkPDFTool />} />
                  <Route path="/tools/batch-pdf" element={<BulkPDFTool />} />
                  <Route path="/tools/bulk-compress" element={<BulkPDFTool />} />
                  <Route path="/tools/bulk-watermark" element={<BulkPDFTool />} />

                  {/* PDF Scanner & Viewer */}
                  <Route path="/tools/scan" element={<ScannerTool />} />
                  <Route path="/tools/scan-to-pdf" element={<ScannerTool />} />
                  <Route path="/tools/pdf-scanner" element={<ScannerTool />} />
                  <Route path="/tools/pdf-reader" element={<PDFReaderTool />} />
                  <Route path="/tools/annotate-pdf" element={<PDFReaderTool />} />
                  <Route path="/tools/pdf-converter" element={<PDFConverterTool />} />
                  <Route path="/tools/converter" element={<PDFConverterTool />} />

                  {/* Conversion Tools */}
                  <Route path="/tools/pdf-to-word" element={<PDFToWordTool />} />
                  <Route path="/tools/pdf-to-excel" element={<PDFToOfficeTool />} />
                  <Route path="/tools/pdf-to-ppt" element={<PDFToOfficeTool />} />
                  <Route path="/tools/pdf-to-csv" element={<PDFToOfficeTool />} />
                  <Route path="/tools/pdf-to-html" element={<PDFToOfficeTool />} />
                  <Route path="/tools/pdf-to-json" element={<PDFToOfficeTool />} />
                  
                  {/* Inverse Conversions (Text/Image/Office based) */}
                  <Route path="/tools/word-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/ppt-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/excel-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/html-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/speech-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/odt-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/ods-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/odp-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/pages-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/hwp-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/epub-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/rtf-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/txt-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/csv-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/zip-to-pdf" element={<OfficeToPDFTool />} />
                  <Route path="/tools/pdf-to-pdfa" element={<MetadataTool />} />

                  {/* Still genuinely coming soon or requiring heavy backend */}
                  <Route path="/tools/youtube-to-mp3" element={<ComingSoon />} />
                  <Route path="/tools/pdf-to-audio" element={<ComingSoon />} />
                  
                  <Route path="/tools/*" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          
          <Footer />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: darkMode ? '#1e293b' : '#fff',
                color: darkMode ? '#fff' : '#333',
                border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              },
            }}
          />
        </div>
      </PremiumProvider>
    </HashRouter>
  );
};

export default App;
