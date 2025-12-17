
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tools from './pages/Tools';

// Implemented Tools
import MergeTool from './pages/tools/MergeTool';
import SplitTool from './pages/tools/SplitTool';
import ImageToPDFTool from './pages/tools/ImageToPDFTool';
import PDFToImageTool from './pages/tools/PDFToImageTool';
import CompressTool from './pages/tools/CompressTool';
import RotateTool from './pages/tools/RotateTool';
import ProtectTool from './pages/tools/ProtectTool';
import UnlockTool from './pages/tools/UnlockTool';
import WatermarkTool from './pages/tools/WatermarkTool';
import OCRTool from './pages/tools/OCRTool';
import PDFToWordTool from './pages/tools/PDFToWordTool';
import PDFToTextTool from './pages/tools/PDFToTextTool';
import DeletePagesTool from './pages/tools/DeletePagesTool';
import ReorderPagesTool from './pages/tools/ReorderPagesTool';
import MetadataTool from './pages/tools/MetadataTool';
import ImageResizerTool from './pages/tools/ImageResizerTool';
import ImageCompressorTool from './pages/tools/ImageCompressorTool';
import AddPageNumbersTool from './pages/tools/AddPageNumbersTool';
import RepairTool from './pages/tools/RepairTool';
import FlattenTool from './pages/tools/FlattenTool';

// New Tools
import EditPDFTool from './pages/tools/EditPDFTool';
import CropTool from './pages/tools/CropTool';
import CompareTool from './pages/tools/CompareTool';
import PDFToOfficeTool from './pages/tools/PDFToOfficeTool';
import OfficeToPDFTool from './pages/tools/OfficeToPDFTool';

import ComingSoon from './pages/tools/ComingSoon';
import { Toaster } from 'react-hot-toast';

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
      <ScrollToTop />
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
            <Route path="/tools/edit-pdf" element={<EditPDFTool />} />
            <Route path="/tools/sign-pdf" element={<EditPDFTool />} />
            <Route path="/tools/redact-pdf" element={<EditPDFTool />} />
            <Route path="/tools/crop-pdf" element={<CropTool />} />
            <Route path="/tools/compare-pdf" element={<CompareTool />} />
            
            {/* Conversion Tools */}
            <Route path="/tools/pdf-to-word" element={<PDFToWordTool />} />
            <Route path="/tools/pdf-to-excel" element={<PDFToOfficeTool />} />
            <Route path="/tools/pdf-to-ppt" element={<PDFToOfficeTool />} />
            <Route path="/tools/pdf-to-csv" element={<PDFToOfficeTool />} />
            <Route path="/tools/pdf-to-html" element={<PDFToOfficeTool />} />
            <Route path="/tools/pdf-to-json" element={<PDFToOfficeTool />} />
            
            {/* Inverse Conversions (Text/Image based) */}
            <Route path="/tools/word-to-pdf" element={<OfficeToPDFTool />} />
            <Route path="/tools/ppt-to-pdf" element={<OfficeToPDFTool />} />
            <Route path="/tools/excel-to-pdf" element={<OfficeToPDFTool />} />
            <Route path="/tools/html-to-pdf" element={<OfficeToPDFTool />} />
            <Route path="/tools/speech-to-pdf" element={<OfficeToPDFTool />} />
            <Route path="/tools/pdf-to-pdfa" element={<MetadataTool />} /> {/* Metadata tagging is partial PDF/A compliance step */}

            {/* Still genuinely coming soon or requiring heavy backend */}
            <Route path="/tools/youtube-to-mp3" element={<ComingSoon />} />
            <Route path="/tools/pdf-to-zip" element={<ComingSoon />} />
            <Route path="/tools/pdf-to-audio" element={<ComingSoon />} />
            
            <Route path="/tools/*" element={<ComingSoon />} />
            <Route path="*" element={<Home />} />
          </Routes>
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
    </HashRouter>
  );
};

export default App;
