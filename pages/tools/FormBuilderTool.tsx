import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Download, Eye, Edit3, CheckSquare, 
  Type, List, Calendar, PenTool, Sparkles, ShieldCheck, 
  Layers, Move, Copy, Settings, Check, RefreshCw, FileText
} from 'lucide-react';
import ToolContainer from '../ToolContainer';
import FileUploader from '../../components/FileUploader';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

// Setup pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

type FormFieldType = 'text' | 'checkbox' | 'dropdown' | 'date' | 'signature';

interface FormFieldItem {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  x: number; // percentage of page width
  y: number; // percentage of page height
  width: number; // percentage of page width
  height: number; // percentage of page height
  pageIndex: number;
  options?: string[]; // for dropdown
  defaultValue?: string;
  required?: boolean;
}

const FIELD_TYPES: { type: FormFieldType; label: string; icon: any; defaultW: number; defaultH: number }[] = [
  { type: 'text', label: 'Text Field', icon: Type, defaultW: 30, defaultH: 4.5 },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, defaultW: 4, defaultH: 3.5 },
  { type: 'dropdown', label: 'Dropdown List', icon: List, defaultW: 30, defaultH: 4.5 },
  { type: 'date', label: 'Date Field', icon: Calendar, defaultW: 25, defaultH: 4.5 },
  { type: 'signature', label: 'Signature Box', icon: PenTool, defaultW: 35, defaultH: 8 },
];

const FormBuilderTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageRendering, setPageRendering] = useState<boolean>(false);

  const [fields, setFields] = useState<FormFieldItem[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeToolType, setActiveToolType] = useState<FormFieldType | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Load PDF file
  const handleFileSelect = async (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      const buffer = await selectedFile.arrayBuffer();
      setPdfBytes(buffer);

      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      setCurrentPage(0);
      setFields([]);
      setSelectedFieldId(null);
      toast.success(`Loaded PDF: ${pdf.numPages} page(s)`);
    }
  };

  // Create Blank Document
  const handleCreateBlank = async () => {
    const doc = await PDFDocument.create();
    doc.addPage([595.28, 841.89]); // A4
    const buffer = await doc.save();
    setPdfBytes(buffer.buffer);
    setFile(new File([buffer], 'Blank_Form.pdf', { type: 'application/pdf' }));
    setNumPages(1);
    setCurrentPage(0);
    setFields([]);
    setSelectedFieldId(null);
    toast.success('Created blank A4 form template');
  };

  // Render Page to Canvas
  useEffect(() => {
    if (!pdfBytes || !canvasRef.current) return;

    let isMounted = true;
    const render = async () => {
      setPageRendering(true);
      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPage + 1);

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas || !isMounted) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setPageRendering(false);
      }
    };

    render();
    return () => { isMounted = false; };
  }, [pdfBytes, currentPage]);

  // Click on Page to place active field
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeToolType || !overlayRef.current || isPreviewMode) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const toolMeta = FIELD_TYPES.find(f => f.type === activeToolType);
    if (!toolMeta) return;

    const newField: FormFieldItem = {
      id: `field_${Date.now()}`,
      type: activeToolType,
      name: `${activeToolType}_${fields.length + 1}`,
      label: `${toolMeta.label} ${fields.length + 1}`,
      x: Math.min(Math.max(2, clickX), 100 - toolMeta.defaultW),
      y: Math.min(Math.max(2, clickY), 100 - toolMeta.defaultH),
      width: toolMeta.defaultW,
      height: toolMeta.defaultH,
      pageIndex: currentPage,
      options: activeToolType === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      required: false,
    };

    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setActiveToolType(null); // Reset after placing
    toast.success(`Placed ${toolMeta.label}`);
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const updateSelectedField = (updates: Partial<FormFieldItem>) => {
    if (!selectedFieldId) return;
    setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  // Export AcroForm Interactive PDF with Embedded Form Fields
  const handleExportFormPDF = async () => {
    if (!pdfBytes) return;
    setIsExporting(true);
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      fields.forEach(field => {
        if (field.pageIndex >= pages.length) return;
        const page = pages[field.pageIndex];
        const { width: pWidth, height: pHeight } = page.getSize();

        // Convert percentage coordinates to PDF Points (origin is bottom-left in PDF)
        const fieldXPts = (field.x / 100) * pWidth;
        const fieldWPts = (field.width / 100) * pWidth;
        const fieldHPts = (field.height / 100) * pHeight;
        const fieldYPts = pHeight - ((field.y / 100) * pHeight) - fieldHPts;

        if (field.type === 'text' || field.type === 'date') {
          const tf = form.createTextField(field.name);
          tf.setText(field.defaultValue || '');
          tf.addToPage(page, {
            x: fieldXPts,
            y: fieldYPts,
            width: fieldWPts,
            height: fieldHPts,
            borderColor: rgb(0.2, 0.4, 0.8),
            backgroundColor: rgb(0.97, 0.98, 1),
            borderWidth: 1,
          });
        } else if (field.type === 'checkbox') {
          const cb = form.createCheckBox(field.name);
          if (field.defaultValue === 'true') cb.check();
          cb.addToPage(page, {
            x: fieldXPts,
            y: fieldYPts,
            width: Math.max(fieldWPts, 14),
            height: Math.max(fieldHPts, 14),
            borderColor: rgb(0.2, 0.4, 0.8),
            backgroundColor: rgb(0.97, 0.98, 1),
            borderWidth: 1,
          });
        } else if (field.type === 'dropdown') {
          const dd = form.createDropdown(field.name);
          dd.setOptions(field.options || ['Option 1', 'Option 2']);
          dd.addToPage(page, {
            x: fieldXPts,
            y: fieldYPts,
            width: fieldWPts,
            height: fieldHPts,
            borderColor: rgb(0.2, 0.4, 0.8),
            backgroundColor: rgb(0.97, 0.98, 1),
            borderWidth: 1,
          });
        } else if (field.type === 'signature') {
          const tf = form.createTextField(field.name);
          tf.addToPage(page, {
            x: fieldXPts,
            y: fieldYPts,
            width: fieldWPts,
            height: fieldHPts,
            borderColor: rgb(0.8, 0.2, 0.3),
            backgroundColor: rgb(1, 0.96, 0.96),
            borderWidth: 1,
          });
          // Label signature placeholder
          page.drawText('✍ Sign Here', {
            x: fieldXPts + 6,
            y: fieldYPts + 6,
            size: 10,
            font: font,
            color: rgb(0.8, 0.2, 0.3),
          });
        }
      });

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Fillable_Form_${file?.name || 'Document'}.pdf`;
      link.click();
      toast.success('Interactive Fillable PDF saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export interactive form.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentPageFields = fields.filter(f => f.pageIndex === currentPage);

  return (
    <ToolContainer
      title="Interactive Fillable PDF Form Builder"
      description="Create official fillable PDF forms. Drag and drop text fields, checkboxes, dropdowns, dates, and signature boxes. 100% offline AcroForm generator."
      maxWidth="6xl"
    >
      {!pdfBytes ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <FileUploader
            onFilesSelected={handleFileSelect}
            accept={{ 'application/pdf': ['.pdf'] }}
            title="Upload PDF Document to Add Form Fields"
            subtitle="Drop any existing document or contract here to make it fillable"
          />

          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-semibold text-slate-400">OR</span>
          </div>

          <button
            onClick={handleCreateBlank}
            className="w-full py-4 px-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-3xl border-2 border-dashed border-rose-300 dark:border-rose-800 text-slate-800 dark:text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5 text-rose-500" />
            Start with Blank Form Template (A4 Sheet)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Elements Toolbar (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Element Selector */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" /> Add Form Elements
              </h3>
              <p className="text-[11px] text-slate-500">
                Click an element below, then click anywhere on the PDF page to place it.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {FIELD_TYPES.map(ft => {
                  const Icon = ft.icon;
                  const isActive = activeToolType === ft.type;
                  return (
                    <button
                      key={ft.type}
                      onClick={() => setActiveToolType(isActive ? null : ft.type)}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{ft.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeToolType && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Click on the document page to place field</span>
                </div>
              )}
            </div>

            {/* 2. Selected Field Properties Inspector */}
            {selectedField && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-500" /> Field Properties
                  </h3>
                  <button
                    onClick={() => removeField(selectedField.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Field Name (ID)
                  </label>
                  <input
                    type="text"
                    value={selectedField.name}
                    onChange={e => updateSelectedField({ name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Display Label / Hint
                  </label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={e => updateSelectedField({ label: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                {selectedField.type === 'dropdown' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={selectedField.options?.join(', ') || ''}
                      onChange={e => updateSelectedField({ options: e.target.value.split(',').map(s => s.trim()) })}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Width / Height adjust */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Width (%)</label>
                    <input
                      type="number"
                      min={4}
                      max={95}
                      value={Math.round(selectedField.width)}
                      onChange={e => updateSelectedField({ width: parseInt(e.target.value) || 10 })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Height (%)</label>
                    <input
                      type="number"
                      min={2}
                      max={40}
                      value={Math.round(selectedField.height)}
                      onChange={e => updateSelectedField({ height: parseInt(e.target.value) || 5 })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Change file */}
            <button
              onClick={() => {
                setPdfBytes(null);
                setFile(null);
                setFields([]);
              }}
              className="w-full py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Choose Different Document
            </button>
          </div>

          {/* PDF Page Canvas & Interactive Form Field Overlay (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Top Bar / Pagination & Mode */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Page {currentPage + 1} of {numPages}
                </span>
                <button
                  disabled={currentPage >= numPages - 1}
                  onClick={() => setCurrentPage(prev => Math.min(numPages - 1, prev + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isPreviewMode
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isPreviewMode ? 'Editing Mode' : 'Test Fill Mode'}
                </button>

                <button
                  onClick={handleExportFormPDF}
                  disabled={isExporting || fields.length === 0}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/25 flex items-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting ? 'Saving...' : `Save Fillable PDF (${fields.length})`}
                </button>
              </div>
            </div>

            {/* Interactive Document Workspace */}
            <div className="relative flex justify-center p-2 sm:p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto overflow-y-auto max-h-[520px] sm:max-h-[640px]">
              <div 
                ref={overlayRef}
                onClick={handlePageClick}
                className="relative inline-block shadow-2xl bg-white select-none cursor-crosshair min-w-[320px] sm:min-w-0"
              >
                <canvas ref={canvasRef} className="block w-full h-auto" />

                {/* Overlaid Form Fields */}
                {currentPageFields.map(field => {
                  const isSelected = selectedFieldId === field.id;
                  return (
                    <div
                      key={field.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isPreviewMode) setSelectedFieldId(field.id);
                      }}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width}%`,
                        height: `${field.height}%`,
                      }}
                      className={`absolute rounded transition-all ${
                        isPreviewMode
                          ? 'bg-blue-50/80 border border-blue-400 p-1 flex items-center'
                          : isSelected
                            ? 'ring-2 ring-rose-500 bg-rose-100/70 border border-rose-400 cursor-pointer shadow-md'
                            : 'border-2 border-dashed border-blue-500 bg-blue-50/60 hover:bg-blue-100/60 cursor-pointer'
                      }`}
                    >
                      {isPreviewMode ? (
                        field.type === 'checkbox' ? (
                          <input type="checkbox" className="w-4 h-4 accent-blue-600 m-auto" />
                        ) : field.type === 'dropdown' ? (
                          <select className="w-full h-full text-[11px] bg-white border border-slate-300 rounded outline-none px-1">
                            {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
                          </select>
                        ) : field.type === 'signature' ? (
                          <div className="w-full h-full border border-dashed border-red-400 bg-red-50/40 rounded flex items-center justify-center text-[10px] text-red-500 font-bold">
                            ✍ Click to Sign
                          </div>
                        ) : (
                          <input
                            type={field.type === 'date' ? 'date' : 'text'}
                            placeholder={field.label}
                            className="w-full h-full text-xs bg-white border border-slate-300 rounded px-1.5 outline-none font-medium"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-between px-1 text-[10px] font-bold text-blue-700 truncate">
                          <span className="truncate">{field.label}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-blue-200/80 text-blue-800 ml-1">
                            {field.type}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Standard PDF AcroForm Specification • Compatible with Adobe Reader, Chrome & Mac Preview</span>
              </div>
              <span className="font-semibold">{fields.length} Field(s) Added</span>
            </div>
          </div>
        </div>
      )}
    </ToolContainer>
  );
};

export default FormBuilderTool;
