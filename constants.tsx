
import { ToolType, ToolConfig, ToolCategory } from './types';
import { 
  Merge, Scissors, Minimize2, Image as ImageIcon, FileImage, ScanText, 
  RotateCw, Lock, Unlock, Stamp, FileText, Trash2, ArrowLeftRight, 
  Hash, FileJson, FileCode, Speaker, Music, Video, Database, 
  FileSpreadsheet, Monitor, FolderArchive, Wrench, Layers, Type,
  FileDigit, FileType, Code, Mic, Key, Settings, PenTool, Crop, 
  FileDiff, EyeOff, Archive, Smartphone, FileOutput, Gauge
} from 'lucide-react';
import React from 'react';

export const TOOLS: ToolConfig[] = [
  // --- ORGANIZE PDF ---
  {
    id: ToolType.MERGE,
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document.',
    icon: 'Merge',
    color: 'text-rose-500',
    path: '/tools/merge',
    popular: true,
    category: ToolCategory.ORGANIZE
  },
  {
    id: ToolType.SPLIT,
    title: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion.',
    icon: 'Scissors',
    color: 'text-red-500',
    path: '/tools/split',
    popular: true,
    category: ToolCategory.ORGANIZE
  },
  {
    id: ToolType.DELETE_PAGES,
    title: 'Remove Pages',
    description: 'Remove unwanted pages from your PDF document.',
    icon: 'Trash2',
    color: 'text-red-600',
    path: '/tools/delete-pages',
    category: ToolCategory.ORGANIZE
  },
  {
    id: ToolType.EXTRACT_PAGES,
    title: 'Extract Pages',
    description: 'Extract selected pages from your PDF file.',
    icon: 'FileOutput',
    color: 'text-blue-500',
    path: '/tools/extract-pages',
    category: ToolCategory.ORGANIZE
  },
  {
    id: ToolType.REORDER_PAGES,
    title: 'Organize PDF',
    description: 'Sort pages of your PDF file however you like.',
    icon: 'ArrowLeftRight',
    color: 'text-indigo-500',
    path: '/tools/reorder-pages',
    category: ToolCategory.ORGANIZE
  },
  {
    id: ToolType.ROTATE,
    title: 'Rotate PDF',
    description: 'Rotate your PDF pages specifically 90, 180 or 270 degrees.',
    icon: 'RotateCw',
    color: 'text-purple-500',
    path: '/tools/rotate',
    category: ToolCategory.ORGANIZE
  },
  {
    id: ToolType.CROP_PDF,
    title: 'Crop PDF',
    description: 'Crop margins of PDF documents or select specific areas.',
    icon: 'Crop',
    color: 'text-lime-600',
    path: '/tools/crop-pdf',
    category: ToolCategory.ORGANIZE
  },

  // --- OPTIMIZE PDF ---
  {
    id: ToolType.COMPRESS,
    title: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    icon: 'Minimize2',
    color: 'text-green-500',
    path: '/tools/compress',
    popular: true,
    category: ToolCategory.OPTIMIZE
  },
  {
    id: ToolType.OPTIMIZE_PDF,
    title: 'Optimize PDF',
    description: 'Optimize your PDF files for web and sharing.',
    icon: 'Gauge',
    color: 'text-emerald-600',
    path: '/tools/optimize-pdf',
    category: ToolCategory.OPTIMIZE
  },
  {
    id: ToolType.OCR,
    title: 'OCR PDF',
    description: 'Convert scanned PDF and images into searchable text.',
    icon: 'ScanText',
    color: 'text-blue-500',
    path: '/tools/ocr',
    category: ToolCategory.OPTIMIZE
  },

  // --- CONVERT TO PDF ---
  {
    id: ToolType.IMG_TO_PDF,
    title: 'JPG to PDF',
    description: 'Convert JPG, PNG, BMP, GIF, and TIFF images to PDF.',
    icon: 'ImageIcon',
    color: 'text-orange-500',
    path: '/tools/img-to-pdf',
    popular: true,
    category: ToolCategory.CONVERT_TO
  },
  {
    id: ToolType.WORD_TO_PDF,
    title: 'Word to PDF',
    description: 'Make DOC and DOCX files into easy to read PDF.',
    icon: 'FileText',
    color: 'text-blue-700',
    path: '/tools/word-to-pdf',
    category: ToolCategory.CONVERT_TO
  },
  {
    id: ToolType.PPT_TO_PDF,
    title: 'PowerPoint to PDF',
    description: 'Make PPT and PPTX slideshows into PDF.',
    icon: 'FileSpreadsheet',
    color: 'text-orange-700',
    path: '/tools/ppt-to-pdf',
    category: ToolCategory.CONVERT_TO
  },
  {
    id: ToolType.EXCEL_TO_PDF,
    title: 'Excel to PDF',
    description: 'Make EXCEL spreadsheets into PDF.',
    icon: 'FileSpreadsheet',
    color: 'text-green-700',
    path: '/tools/excel-to-pdf',
    category: ToolCategory.CONVERT_TO
  },
  {
    id: ToolType.HTML_TO_PDF,
    title: 'HTML to PDF',
    description: 'Convert webpages in HTML to PDF.',
    icon: 'Code',
    color: 'text-pink-600',
    path: '/tools/html-to-pdf',
    category: ToolCategory.CONVERT_TO
  },
  {
    id: ToolType.SCAN_TO_PDF,
    title: 'Scan to PDF',
    description: 'Capture document scans from your mobile device to PDF.',
    icon: 'Smartphone',
    color: 'text-slate-600',
    path: '/tools/scan-to-pdf',
    category: ToolCategory.CONVERT_TO
  },

  // --- CONVERT FROM PDF ---
  {
    id: ToolType.PDF_TO_IMG,
    title: 'PDF to JPG',
    description: 'Convert each PDF page into a JPG or extract all images.',
    icon: 'FileImage',
    color: 'text-yellow-500',
    path: '/tools/pdf-to-img',
    popular: true,
    category: ToolCategory.CONVERT_FROM
  },
  {
    id: ToolType.PDF_TO_WORD,
    title: 'PDF to Word',
    description: 'Easily convert your PDF files into easy to edit DOCX documents.',
    icon: 'FileText',
    color: 'text-blue-600',
    path: '/tools/pdf-to-word',
    popular: true,
    category: ToolCategory.CONVERT_FROM
  },
  {
    id: ToolType.PDF_TO_PPT,
    title: 'PDF to PowerPoint',
    description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
    icon: 'FileSpreadsheet',
    color: 'text-orange-600',
    path: '/tools/pdf-to-ppt',
    category: ToolCategory.CONVERT_FROM
  },
  {
    id: ToolType.PDF_TO_EXCEL,
    title: 'PDF to Excel',
    description: 'Pull data straight from PDFs into Excel spreadsheets.',
    icon: 'FileSpreadsheet',
    color: 'text-green-600',
    path: '/tools/pdf-to-excel',
    category: ToolCategory.CONVERT_FROM
  },
  {
    id: ToolType.PDF_TO_TEXT,
    title: 'PDF to Text',
    description: 'Extract text content from your PDF documents.',
    icon: 'FileText',
    color: 'text-gray-600',
    path: '/tools/pdf-to-text',
    category: ToolCategory.CONVERT_FROM
  },
  {
    id: ToolType.PDF_TO_PDFA,
    title: 'PDF to PDF/A',
    description: 'Transform your PDF to PDF/A for long-term archiving.',
    icon: 'Archive',
    color: 'text-amber-700',
    path: '/tools/pdf-to-pdfa',
    category: ToolCategory.CONVERT_FROM
  },

  // --- EDIT PDF ---
  {
    id: ToolType.EDIT_PDF,
    title: 'Edit PDF',
    description: 'Add text, images, shapes or freehand annotations to a PDF.',
    icon: 'PenTool',
    color: 'text-purple-600',
    path: '/tools/edit-pdf',
    popular: true,
    category: ToolCategory.EDIT
  },
  {
    id: ToolType.ADD_PAGE_NUMBERS,
    title: 'Page Numbers',
    description: 'Add page numbers into PDFs with ease.',
    icon: 'Hash',
    color: 'text-blue-400',
    path: '/tools/add-page-numbers',
    category: ToolCategory.EDIT
  },
  {
    id: ToolType.WATERMARK,
    title: 'Watermark',
    description: 'Stamp an image or text over your PDF.',
    icon: 'Stamp',
    color: 'text-teal-500',
    path: '/tools/watermark',
    category: ToolCategory.EDIT
  },
  {
    id: ToolType.EDIT_METADATA,
    title: 'Edit Metadata',
    description: 'Edit title, author, and keywords of your PDF.',
    icon: 'FileDigit',
    color: 'text-gray-500',
    path: '/tools/edit-metadata',
    category: ToolCategory.EDIT
  },
  {
    id: ToolType.FLATTEN_PDF,
    title: 'Flatten PDF',
    description: 'Flatten forms and annotations into the page layer.',
    icon: 'Layers',
    color: 'text-amber-600',
    path: '/tools/flatten-pdf',
    category: ToolCategory.EDIT
  },
  {
    id: ToolType.REPAIR_PDF,
    title: 'Repair PDF',
    description: 'Repair a damaged PDF and recover data from corrupt PDF.',
    icon: 'Wrench',
    color: 'text-gray-700',
    path: '/tools/repair-pdf',
    category: ToolCategory.EDIT
  },
  {
    id: ToolType.COMPARE_PDF,
    title: 'Compare PDF',
    description: 'Show a side-by-side document comparison.',
    icon: 'FileDiff',
    color: 'text-cyan-600',
    path: '/tools/compare-pdf',
    category: ToolCategory.EDIT
  },

  // --- PDF SECURITY ---
  {
    id: ToolType.PROTECT,
    title: 'Protect PDF',
    description: 'Encrypt your PDF file with a password.',
    icon: 'Lock',
    color: 'text-indigo-500',
    path: '/tools/protect',
    category: ToolCategory.SECURITY
  },
  {
    id: ToolType.UNLOCK,
    title: 'Unlock PDF',
    description: 'Remove password security from PDF files.',
    icon: 'Unlock',
    color: 'text-pink-500',
    path: '/tools/unlock',
    category: ToolCategory.SECURITY
  },
  {
    id: ToolType.SIGN_PDF,
    title: 'Sign PDF',
    description: 'Sign yourself or request electronic signatures from others.',
    icon: 'PenTool',
    color: 'text-indigo-600',
    path: '/tools/sign-pdf',
    category: ToolCategory.SECURITY
  },
  {
    id: ToolType.REDACT_PDF,
    title: 'Redact PDF',
    description: 'Redact text and graphics to permanently remove sensitive info.',
    icon: 'EyeOff',
    color: 'text-zinc-800',
    path: '/tools/redact-pdf',
    category: ToolCategory.SECURITY
  },
];

export const getIcon = (name: string, className?: string) => {
  const props = { className: className || "w-6 h-6" };
  const icons: {[key: string]: React.ReactNode} = {
    'Merge': <Merge {...props} />,
    'Scissors': <Scissors {...props} />,
    'Minimize2': <Minimize2 {...props} />,
    'FileImage': <FileImage {...props} />,
    'ImageIcon': <ImageIcon {...props} />,
    'ScanText': <ScanText {...props} />,
    'RotateCw': <RotateCw {...props} />,
    'Lock': <Lock {...props} />,
    'Unlock': <Unlock {...props} />,
    'Stamp': <Stamp {...props} />,
    'FileText': <FileText {...props} />,
    'Trash2': <Trash2 {...props} />,
    'ArrowLeftRight': <ArrowLeftRight {...props} />,
    'Hash': <Hash {...props} />,
    'FileJson': <FileJson {...props} />,
    'Code': <Code {...props} />,
    'Speaker': <Speaker {...props} />,
    'Music': <Music {...props} />,
    'Video': <Video {...props} />,
    'Database': <Database {...props} />,
    'FileSpreadsheet': <FileSpreadsheet {...props} />,
    'Monitor': <Monitor {...props} />,
    'FolderArchive': <FolderArchive {...props} />,
    'Wrench': <Wrench {...props} />,
    'Layers': <Layers {...props} />,
    'Type': <Type {...props} />,
    'FileDigit': <FileDigit {...props} />,
    'FileType': <FileType {...props} />,
    'Mic': <Mic {...props} />,
    'Key': <Key {...props} />,
    'Settings': <Settings {...props} />,
    'PenTool': <PenTool {...props} />,
    'Crop': <Crop {...props} />,
    'FileDiff': <FileDiff {...props} />,
    'EyeOff': <EyeOff {...props} />,
    'Archive': <Archive {...props} />,
    'Smartphone': <Smartphone {...props} />,
    'FileOutput': <FileOutput {...props} />,
    'Gauge': <Gauge {...props} />
  };

  return icons[name] || <FileText {...props} />;
};
