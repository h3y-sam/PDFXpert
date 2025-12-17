
export enum ToolType {
  // Existing
  MERGE = 'merge',
  SPLIT = 'split',
  COMPRESS = 'compress',
  PDF_TO_IMG = 'pdf-to-img',
  IMG_TO_PDF = 'img-to-pdf',
  OCR = 'ocr',
  ROTATE = 'rotate',
  PROTECT = 'protect',
  UNLOCK = 'unlock',
  WATERMARK = 'watermark',
  PDF_TO_WORD = 'pdf-to-word',

  // Images
  IMAGE_RESIZER = 'image-resizer',
  IMAGE_COMPRESSOR = 'image-compressor',
  
  // PDF Conversions (From PDF)
  PDF_TO_CSV = 'pdf-to-csv',
  PDF_TO_EXCEL = 'pdf-to-excel',
  PDF_TO_HTML = 'pdf-to-html',
  PDF_TO_JSON = 'pdf-to-json',
  PDF_TO_PNG = 'pdf-to-png',
  PDF_TO_XML = 'pdf-to-xml',
  PDF_TO_ZIP = 'pdf-to-zip',
  PDF_TO_WEBP = 'pdf-to-webp',
  PDF_TO_TEXT = 'pdf-to-text',
  PDF_TO_PPT = 'pdf-to-ppt',
  PDF_TO_PPTX = 'pdf-to-pptx',
  PDF_TO_DOC = 'pdf-to-doc',
  PDF_TO_EPUB = 'pdf-to-epub',
  PDF_TO_MOBI = 'pdf-to-mobi',
  PDF_TO_MARKDOWN = 'pdf-to-markdown',
  PDF_TO_TIFF = 'pdf-to-tiff',
  PDF_TO_SVG = 'pdf-to-svg',
  PDF_TO_AUDIO = 'pdf-to-audio',
  PDF_TO_COREL = 'pdf-to-corel',
  PDF_TO_DXF = 'pdf-to-dxf',
  PDF_TO_PSD = 'pdf-to-psd',
  PDF_TO_PDFA = 'pdf-to-pdfa',

  // PDF Conversions (To PDF)
  CSV_TO_PDF = 'csv-to-pdf',
  EXCEL_TO_PDF = 'excel-to-pdf',
  HTML_TO_PDF = 'html-to-pdf',
  JPG_TO_PDF = 'jpg-to-pdf',
  JSON_TO_PDF = 'json-to-pdf',
  PNG_TO_PDF = 'png-to-pdf',
  SPEECH_TO_PDF = 'speech-to-pdf',
  TEXT_TO_PDF = 'text-to-pdf',
  WEBP_TO_PDF = 'webp-to-pdf',
  XML_TO_PDF = 'xml-to-pdf',
  WORD_TO_PDF = 'word-to-pdf',
  PPT_TO_PDF = 'ppt-to-pdf',
  PPTX_TO_PDF = 'pptx-to-pdf',
  DOC_TO_PDF = 'doc-to-pdf',
  XPS_TO_PDF = 'xps-to-pdf',
  DWG_TO_PDF = 'dwg-to-pdf',
  RTF_TO_PDF = 'rtf-to-pdf',
  SHREE_LIPI_TO_PDF = 'shree-lipi-to-pdf',
  PNR_TO_PDF = 'pnr-to-pdf',
  BIN_TO_PDF = 'bin-to-pdf',
  JFIF_TO_PDF = 'jfif-to-pdf',
  IPYNB_TO_PDF = 'ipynb-to-pdf',
  RAR_TO_PDF = 'rar-to-pdf',
  PRN_TO_PDF = 'prn-to-pdf',
  SCAN_TO_PDF = 'scan-to-pdf',

  // PDF Editing
  EDIT_PDF = 'edit-pdf',
  SIGN_PDF = 'sign-pdf',
  DELETE_PAGES = 'delete-pages',
  EXTRACT_PAGES = 'extract-pages',
  REORDER_PAGES = 'reorder-pages',
  ADD_PAGE_NUMBERS = 'add-page-numbers',
  EDIT_METADATA = 'edit-metadata',
  FLATTEN_PDF = 'flatten-pdf',
  REPAIR_PDF = 'repair-pdf',
  COMPARE_PDF = 'compare-pdf',
  REDACT_PDF = 'redact-pdf',
  CROP_PDF = 'crop-pdf',
  OPTIMIZE_PDF = 'optimize-pdf',

  // Other
  YOUTUBE_TO_MP3 = 'youtube-to-mp3',
}

export enum ToolCategory {
  ORGANIZE = 'Organize PDF',
  CONVERT_TO = 'Convert to PDF',
  CONVERT_FROM = 'Convert from PDF',
  EDIT = 'Edit PDF',
  SECURITY = 'PDF Security',
  OPTIMIZE = 'Optimize PDF'
}

export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview?: string; // Data URL for preview if applicable
  rotation?: number; // 0, 90, 180, 270
}

export interface ToolConfig {
  id: ToolType;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  popular?: boolean;
  category: ToolCategory;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  resultUrl: string | null;
  resultName: string | null;
}
