import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Printer, Download, Sparkles, Image as ImageIcon, Sliders, 
  RotateCw, RefreshCw, Scissors, Grid, FileCheck, Check, Layers,
  ZoomIn, ZoomOut, Move, Eye, ShieldCheck, HelpCircle
} from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFDocument, rgb } from 'pdf-lib';
import toast from 'react-hot-toast';

interface PhotoSizePreset {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

const PHOTO_SIZES: PhotoSizePreset[] = [
  { id: 'in-uk-eu', name: '3.5 x 4.5 cm', country: 'India, UK, EU, Schengen, Canada', widthMm: 35, heightMm: 45, description: 'Standard Passport & Visa' },
  { id: 'us-visa', name: '2 x 2 inch (51x51 mm)', country: 'USA, OCI, US Visa', widthMm: 50.8, heightMm: 50.8, description: 'Square US Passport' },
  { id: 'stamp-size', name: '2.5 x 3.0 cm', country: 'Stamp / Badge ID', widthMm: 25, heightMm: 30, description: 'Small ID & Stamp size' },
  { id: 'asia-id', name: '3.0 x 4.0 cm', country: 'Japan, Korea, China, Singapore', widthMm: 30, heightMm: 40, description: 'Asian standard ID' },
  { id: 'driving-license', name: '3.5 x 3.5 cm', country: 'Driving License / Standard Square', widthMm: 35, heightMm: 35, description: 'Compact Square Photo' },
];

interface PaperPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
}

const PAPER_SIZES: PaperPreset[] = [
  { id: 'a4', name: 'A4 Paper (210 × 297 mm)', widthMm: 210, heightMm: 297, dpi: 300 },
  { id: '4x6', name: '4 × 6 inch Photo Paper (100 × 150 mm)', widthMm: 101.6, heightMm: 152.4, dpi: 300 },
  { id: 'letter', name: 'Letter (8.5 × 11 inch)', widthMm: 215.9, heightMm: 279.4, dpi: 300 },
  { id: '5x7', name: '5 × 7 inch (127 × 178 mm)', widthMm: 127, heightMm: 177.8, dpi: 300 },
];

const BACKGROUND_COLORS = [
  { id: 'original', name: 'Original', color: 'transparent', border: 'border-slate-300' },
  { id: 'white', name: 'Pure White', color: '#ffffff', border: 'border-slate-300' },
  { id: 'light-blue', name: 'Studio Light Blue', color: '#dbeafe', border: 'border-blue-300' },
  { id: 'light-gray', name: 'Studio Off-White', color: '#f1f5f9', border: 'border-slate-300' },
  { id: 'cream', name: 'Warm White', color: '#fffbeb', border: 'border-amber-300' },
];

const PassportPhotoMakerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Settings
  const [selectedPhotoSize, setSelectedPhotoSize] = useState<PhotoSizePreset>(PHOTO_SIZES[0]);
  const [selectedPaper, setSelectedPaper] = useState<PaperPreset>(PAPER_SIZES[0]);
  const [photoCount, setPhotoCount] = useState<number>(12);
  const [cutBorder, setCutBorder] = useState<'solid' | 'dashed' | 'none'>('dashed');
  const [gapMm, setGapMm] = useState<number>(3);
  const [marginMm, setMarginMm] = useState<number>(10);
  const [bgColor, setBgColor] = useState<string>('original');
  
  // Image Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const singlePhotoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Image
  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please upload a valid image (JPG, PNG, WebP).');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setPanOffset({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Calculate Grid Capacity
  const getGridCapacity = useCallback(() => {
    const usableWidth = selectedPaper.widthMm - (marginMm * 2);
    const usableHeight = selectedPaper.heightMm - (marginMm * 2);
    const cols = Math.floor((usableWidth + gapMm) / (selectedPhotoSize.widthMm + gapMm));
    const rows = Math.floor((usableHeight + gapMm) / (selectedPhotoSize.heightMm + gapMm));
    const maxCapacity = Math.max(1, cols * rows);
    return { cols: Math.max(1, cols), rows: Math.max(1, rows), maxCapacity };
  }, [selectedPaper, selectedPhotoSize, gapMm, marginMm]);

  // Adjust photoCount if exceeding capacity
  useEffect(() => {
    const { maxCapacity } = getGridCapacity();
    if (photoCount > maxCapacity) {
      setPhotoCount(maxCapacity);
    }
  }, [getGridCapacity, photoCount]);

  // Render High-Res Single Cropped Passport Photo
  const renderSinglePhoto = useCallback((targetWidthPx: number, targetHeightPx: number): HTMLCanvasElement | null => {
    if (!imageSrc) return null;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidthPx;
    canvas.height = targetHeightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background color
    if (bgColor !== 'original') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
    }

    const img = new Image();
    img.src = imageSrc;
    if (!img.complete) return null;

    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Center & Apply Pan, Zoom, Rotation
    ctx.translate(targetWidthPx / 2, targetHeightPx / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x, panOffset.y);

    // Calculate aspect ratio fill
    const hRatio = targetWidthPx / img.width;
    const vRatio = targetHeightPx / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const drawWidth = img.width * ratio;
    const drawHeight = img.height * ratio;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    return canvas;
  }, [imageSrc, bgColor, brightness, contrast, rotation, zoom, panOffset]);

  // Render Full Print Sheet Canvas
  const renderPrintSheet = useCallback(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert MM to Pixels at 300 DPI (1 inch = 25.4 mm = 300 px => 1 mm = 11.811 px)
    const mmToPx = (selectedPaper.dpi / 25.4);
    const paperWidthPx = Math.round(selectedPaper.widthMm * mmToPx);
    const paperHeightPx = Math.round(selectedPaper.heightMm * mmToPx);

    canvas.width = paperWidthPx;
    canvas.height = paperHeightPx;

    // Sheet Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);

    const photoWidthPx = Math.round(selectedPhotoSize.widthMm * mmToPx);
    const photoHeightPx = Math.round(selectedPhotoSize.heightMm * mmToPx);
    const gapPx = Math.round(gapMm * mmToPx);
    const marginPx = Math.round(marginMm * mmToPx);

    const singlePhoto = renderSinglePhoto(photoWidthPx, photoHeightPx);
    if (!singlePhoto) return;

    const { cols, rows } = getGridCapacity();
    const effectiveCount = Math.min(photoCount, cols * rows);

    // Calculate centering offset
    const actualGridWidth = (cols * photoWidthPx) + ((cols - 1) * gapPx);
    const startX = Math.max(marginPx, Math.round((paperWidthPx - actualGridWidth) / 2));
    const startY = marginPx;

    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= effectiveCount) break;

        const x = startX + c * (photoWidthPx + gapPx);
        const y = startY + r * (photoHeightPx + gapPx);

        // Draw photo
        ctx.drawImage(singlePhoto, x, y);

        // Draw cut border / crop marks
        if (cutBorder === 'solid') {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
        } else if (cutBorder === 'dashed') {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
          ctx.setLineDash([]);
        }

        placed++;
      }
      if (placed >= effectiveCount) break;
    }

    // Footer info mark
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `PDFXpert Studio Print Sheet • ${selectedPhotoSize.name} (${selectedPhotoSize.country}) • ${effectiveCount} Photos • 100% Offline & Private`,
      paperWidthPx / 2,
      paperHeightPx - 30
    );
  }, [imageSrc, selectedPaper, selectedPhotoSize, gapMm, marginMm, renderSinglePhoto, getGridCapacity, photoCount, cutBorder]);

  // Re-render when image/settings change
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => renderPrintSheet();
    }
  }, [imageSrc, renderPrintSheet]);

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Direct Print Action
  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to open the print dialog.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photos - PDFXpert</title>
          <style>
            @page {
              size: ${selectedPaper.widthMm}mm ${selectedPaper.heightMm}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: white;
            }
            img {
              width: 100%;
              height: auto;
              max-width: ${selectedPaper.widthMm}mm;
              max-height: ${selectedPaper.heightMm}mm;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download High-Res PDF
  const handleDownloadPDF = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      // 1 pt = 1/72 inch, 1 mm = 72 / 25.4 pt = 2.83465 pt
      const mmToPt = 72 / 25.4;
      const pageWidthPt = selectedPaper.widthMm * mmToPt;
      const pageHeightPt = selectedPaper.heightMm * mmToPt;

      const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
      const pngImageBytes = await fetch(canvasRef.current.toDataURL('image/png', 1.0)).then((res) => res.arrayBuffer());
      const embeddedImage = await pdfDoc.embedPng(pngImageBytes);

      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: pageWidthPt,
        height: pageHeightPt,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Passport_Photos_${selectedPhotoSize.name.replace(/\s+/g, '_')}_${photoCount}qty.pdf`;
      link.click();
      toast.success('High-Res Studio PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF sheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download High-Res PNG
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.download = `Passport_Photos_Sheet_${selectedPaper.id.toUpperCase()}_300DPI.png`;
    link.click();
    toast.success('High-Res 300 DPI Image Sheet downloaded!');
  };

  const { maxCapacity } = getGridCapacity();

  return (
    <ToolContainer
      title="Passport Photo Sheet & Studio Print Maker"
      description="Create print-ready passport, visa, and ID photo sheets tiled on A4 or 4x6 photo paper with cut borders. 100% offline & studio-quality."
    >
      {!file ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <FileUploader
            onFilesSelected={handleFileSelect}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            title="Upload Portrait or Passport Photo"
            subtitle="Drop your photo here or click to browse from device / camera"
          />

          {/* Quick presets guide */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" /> Supported Standard Dimensions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-rose-600 dark:text-rose-400">3.5 × 4.5 cm:</span> India, UK, Schengen, EU, Canada Passport & Visa
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-rose-600 dark:text-rose-400">2 × 2 inch (51×51 mm):</span> US Passport, OCI, US Visa, India OCI
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-rose-600 dark:text-rose-400">3.0 × 4.0 cm:</span> Japan, Korea, China, Asian ID
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-rose-600 dark:text-rose-400">4 × 6" / A4 Sheets:</span> Tile 6, 8, 12, 16, 24 or 30 photos on one page
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Sidebar (Left 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Size & Paper Preset Selection */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Scissors className="w-4 h-4 text-rose-500" /> 1. Photo & Paper Standards
              </h3>

              {/* Photo Size */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Passport / ID Size Standard
                </label>
                <select
                  value={selectedPhotoSize.id}
                  onChange={(e) => {
                    const preset = PHOTO_SIZES.find((p) => p.id === e.target.value) || PHOTO_SIZES[0];
                    setSelectedPhotoSize(preset);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                >
                  {PHOTO_SIZES.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name} ({size.country})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {selectedPhotoSize.description}
                </p>
              </div>

              {/* Paper Size */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Print Paper Sheet Size
                </label>
                <select
                  value={selectedPaper.id}
                  onChange={(e) => {
                    const paper = PAPER_SIZES.find((p) => p.id === e.target.value) || PAPER_SIZES[0];
                    setSelectedPaper(paper);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                >
                  {PAPER_SIZES.map((paper) => (
                    <option key={paper.id} value={paper.id}>
                      {paper.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo Count on Sheet */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Number of Photos on Page
                  </label>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {photoCount} / {maxCapacity} Max
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={maxCapacity}
                    value={photoCount}
                    onChange={(e) => setPhotoCount(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <button
                    onClick={() => setPhotoCount(maxCapacity)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shrink-0"
                  >
                    Fill Max
                  </button>
                </div>
                {/* Common Count Shortcuts */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[4, 6, 8, 12, 16, 24, 30]
                    .filter((cnt) => cnt <= maxCapacity)
                    .map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setPhotoCount(cnt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          photoCount === cnt
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {cnt} Pcs
                      </button>
                    ))}
                </div>
              </div>

              {/* Cut Borders */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Cutting Line Guide
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dashed', 'solid', 'none'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCutBorder(mode)}
                      className={`py-1.5 text-xs font-bold capitalize rounded-xl border ${
                        cutBorder === mode
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Photo Adjustments & Crop Alignment */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-500" /> 2. Position & Lighting Enhancements
              </h3>

              {/* Interactive Crop / Pan Box */}
              <div className="flex flex-col items-center">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <Move className="w-3 h-3" /> Drag inside preview to position head & chin properly
                </div>
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="relative overflow-hidden cursor-move border-2 border-rose-500 rounded-2xl shadow-inner bg-slate-100 dark:bg-slate-900 flex items-center justify-center select-none"
                  style={{
                    width: `${selectedPhotoSize.widthMm * 3.5}px`,
                    height: `${selectedPhotoSize.heightMm * 3.5}px`,
                  }}
                >
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Crop preview"
                      draggable={false}
                      style={{
                        transform: `translate(${panOffset.x / 2}px, ${panOffset.y / 2}px) scale(${zoom}) rotate(${rotation}deg)`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'cover',
                      }}
                      className="pointer-events-none"
                    />
                  )}
                  {/* Passport guideline overlay */}
                  <div className="absolute inset-0 border border-white/40 pointer-events-none flex flex-col justify-between p-2">
                    <div className="w-full border-b border-dashed border-rose-400/60 text-[9px] text-rose-500 font-bold text-center">
                      Top of Head (70-80%)
                    </div>
                    <div className="w-full border-t border-dashed border-rose-400/60 text-[9px] text-rose-500 font-bold text-center">
                      Chin Line
                    </div>
                  </div>
                </div>
              </div>

              {/* Zoom & Rotation */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Zoom: {Math.round(zoom * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Rotate: {rotation}°
                  </label>
                  <button
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="w-full py-1 px-3 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" /> Rotate 90°
                  </button>
                </div>
              </div>

              {/* Brightness & Contrast */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Brightness: {brightness}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Contrast: {contrast}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>

              {/* Background Color Backdrop */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Studio Background Tint
                </label>
                <div className="flex items-center gap-2">
                  {BACKGROUND_COLORS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBgColor(bg.color)}
                      title={bg.name}
                      style={{ backgroundColor: bg.color === 'transparent' ? '#ffffff' : bg.color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        bgColor === bg.color ? 'border-rose-500 scale-110 shadow' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    />
                  ))}
                  <button
                    onClick={() => {
                      setPanOffset({ x: 0, y: 0 });
                      setZoom(1);
                      setRotation(0);
                      setBrightness(100);
                      setContrast(100);
                      setBgColor('original');
                    }}
                    className="ml-auto text-[11px] text-slate-500 hover:text-rose-500 flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Change Photo Button */}
            <button
              onClick={() => {
                setFile(null);
                setImageSrc(null);
              }}
              className="w-full py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Choose Different Photo
            </button>
          </div>

          {/* Sheet Preview & Export Actions (Right 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Print Sheet Live Preview (300 DPI Ultra HD)
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-full">
                  {selectedPaper.name.split(' ')[0]} • {photoCount} Photos
                </span>
              </div>

              {/* Visual Sheet Canvas */}
              <div className="w-full flex justify-center p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden max-h-[580px] overflow-y-auto">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto object-contain shadow-2xl rounded-sm border border-slate-300"
                  style={{ maxHeight: '540px' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-6">
                {/* 1. Direct Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  <Printer className="w-4 h-4" />
                  Print Now
                </button>

                {/* 2. Download PDF */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  {isProcessing ? 'Generating PDF...' : 'Download PDF'}
                </button>

                {/* 3. Download Image */}
                <button
                  onClick={handleDownloadImage}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
                >
                  <ImageIcon className="w-4 h-4" />
                  Download 300DPI Image
                </button>
              </div>

              {/* Privacy badge */}
              <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% In-Browser Rendering • Your photos are never sent to any server</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default PassportPhotoMakerTool;
