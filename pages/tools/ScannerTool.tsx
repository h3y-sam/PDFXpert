import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RotateCw,
  Trash2,
  Download,
  Plus,
  Sliders,
  CheckCircle2,
  FileText,
  ShieldCheck,
  VideoOff,
  Video,
} from 'lucide-react';
import ToolContainer from '../ToolContainer';
import { imagesToPDF } from '../../services/pdfService';
import ProcessTransparencyModal from '../../components/ProcessTransparencyModal';
import { TransparencyTracker } from '../../services/transparencyTracker';
import { ProcessingState } from '../../types';
import toast from 'react-hot-toast';

interface ScannedPage {
  id: string;
  dataUrl: string;
  filter: 'color' | 'bw' | 'contrast';
}

export default function ScannerTool() {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [activeFilter, setActiveFilter] = useState<'color' | 'bw' | 'contrast'>('color');
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    resultUrl: null,
    resultName: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start / Stop camera stream
  const toggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        toast.success('Camera activated for document scanning.');
      } catch (err) {
        console.error(err);
        toast.error('Unable to access camera. Please allow camera permissions or upload images.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (activeFilter === 'bw') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const threshold = avg > 128 ? 255 : 0;
        data[i] = threshold;
        data[i + 1] = threshold;
        data[i + 2] = threshold;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (activeFilter === 'contrast') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.5 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.5 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.5 + 128));
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPages((prev) => [
      ...prev,
      { id: Date.now().toString(), dataUrl, filter: activeFilter },
    ]);
    toast.success(`Page ${pages.length + 1} captured!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              dataUrl: event.target!.result as string,
              filter: 'color',
            },
          ]);
        }
      };
      reader.readAsDataURL(f);
    });
    toast.success('Images added to scan list.');
  };

  const handleExportPDF = async () => {
    if (pages.length === 0) return;

    const tracker = new TransparencyTracker(
      [
        'Convert captures to binary image streams',
        'Initialize offline canvas buffer',
        'Embed pages into standard PDF document',
        'Serialize final scanned PDF',
      ],
      (updated) => setState((prev) => ({ ...prev, ...updated }))
    );

    try {
      tracker.setStep(0, `Processing ${pages.length} scanned page(s)`);

      const fileObjects: File[] = [];
      for (let i = 0; i < pages.length; i++) {
        const res = await fetch(pages[i].dataUrl);
        const blob = await res.blob();
        fileObjects.push(new File([blob], `scan_page_${i + 1}.jpg`, { type: 'image/jpeg' }));
      }

      tracker.setStep(2, 'Embedding into PDF document stream');
      const pdfBytes = await imagesToPDF(fileObjects);

      tracker.setStep(3, 'Assembling local PDF file');
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      tracker.complete(url, 'scanned_document.pdf');
      toast.success('Scanned PDF generated successfully!');
    } catch (err: any) {
      console.error(err);
      tracker.fail(err?.message || 'Failed to generate scanned PDF.');
      toast.error('Export failed.');
    }
  };

  return (
    <ToolContainer
      title="PDF Scanner (Camera & Photos)"
      description="Scan physical documents directly using your webcam or phone camera into a crisp PDF."
    >
      <ProcessTransparencyModal
        state={state}
        title="Generating Scanned PDF"
        onClose={() => setState((prev) => ({ ...prev, isProcessing: false, error: null }))}
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Camera Viewport or Start Prompt */}
        <div className="relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl min-h-[380px] flex items-center justify-center">
          {cameraActive ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-[460px] object-contain rounded-2xl"
              />
              {/* Document Alignment Frame */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-rose-500/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-rose-500" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-rose-500" />
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-rose-500" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-rose-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Camera Scanner Ready</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Click below to activate your webcam or phone camera for real-time document capture.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={toggleCamera}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Video className="w-4 h-4" /> Start Camera
                </button>
                <label className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl cursor-pointer text-sm transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Upload Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {cameraActive && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60">
              <button
                onClick={capturePhoto}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Snap Page ({pages.length})
              </button>
              <button
                onClick={stopCamera}
                className="p-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
                title="Stop Camera"
              >
                <VideoOff className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Filter Selection */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Scan Filter:
            </span>
          </div>
          <div className="flex gap-2">
            {(['color', 'contrast', 'bw'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                  activeFilter === f
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {f === 'color' ? 'Full Color' : f === 'contrast' ? 'High Contrast' : 'B&W Document'}
              </button>
            ))}
          </div>
        </div>

        {/* Captured Pages Gallery */}
        {pages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" /> Captured Pages ({pages.length})
              </h4>
              <button
                onClick={handleExportPDF}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Save as Scanned PDF
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((page, idx) => (
                <div
                  key={page.id}
                  className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm group"
                >
                  <img src={page.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-40 object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md">
                    Page {idx + 1}
                  </div>
                  <button
                    onClick={() => setPages((prev) => prev.filter((p) => p.id !== page.id))}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
}
