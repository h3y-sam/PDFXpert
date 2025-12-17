
import { PDFDocument, rgb, degrees, StandardFonts, grayscale } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

/**
 * Generates a ZIP file from multiple blobs/buffers
 */
export const generateZip = async (files: {name: string, data: Blob | Uint8Array}[]): Promise<Blob> => {
  const zip = new JSZip();
  files.forEach(f => {
    zip.file(f.name, f.data);
  });
  return await zip.generateAsync({ type: 'blob' });
};

/**
 * Merges multiple PDF files into one
 */
export const mergePDFs = async (files: {file: File, rotation?: number}[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const item of files) {
    const arrayBuffer = await item.file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      if (item.rotation) {
         const currentRotation = page.getRotation().angle;
         page.setRotation(degrees(currentRotation + item.rotation));
      }
      mergedPdf.addPage(page);
    });
  }

  return await mergedPdf.save();
};

/**
 * Assembles a new PDF from a list of specific pages from different source files.
 */
export const assemblePDF = async (pages: { file: File, pageIndex: number }[]): Promise<Uint8Array> => {
  const newPdf = await PDFDocument.create();
  const loadedDocs = new Map<File, PDFDocument>();

  for (const p of pages) {
    let srcDoc = loadedDocs.get(p.file);
    if (!srcDoc) {
      const buffer = await p.file.arrayBuffer();
      srcDoc = await PDFDocument.load(buffer);
      loadedDocs.set(p.file, srcDoc);
    }
    const [copiedPage] = await newPdf.copyPages(srcDoc, [p.pageIndex]);
    newPdf.addPage(copiedPage);
  }
  return await newPdf.save();
};

/**
 * Splits a PDF file into a SINGLE new file containing specific pages (Extract Mode)
 */
export const splitPDF = async (file: File, pageIndices: number[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
};

/**
 * Splits a PDF file into MULTIPLE files based on ranges
 */
export const splitPDFMultiple = async (file: File, ranges: number[][], baseName: string): Promise<{name: string, data: Uint8Array}[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const results: {name: string, data: Uint8Array}[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    if (range.length === 0) continue;

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, range);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    const startPage = range[0] + 1;
    const endPage = range[range.length - 1] + 1;
    let suffix = `${startPage}`;
    if (startPage !== endPage) suffix = `${startPage}-${endPage}`;

    results.push({
        name: `${baseName}_${suffix}.pdf`,
        data: pdfBytes
    });
  }
  return results;
};

/**
 * Converts Images (JPG/PNG) to a single PDF
 */
export const imagesToPDF = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png';
    let image;
    try {
      if (isPng) image = await pdfDoc.embedPng(arrayBuffer);
      else image = await pdfDoc.embedJpg(arrayBuffer);
    } catch (e) { continue; }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return await pdfDoc.save();
};

/**
 * Converts Text content to PDF
 */
export const textToPDF = async (text: string): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const { height } = page.getSize();
  
  page.drawText(text, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
    maxWidth: page.getWidth() - 100,
    lineHeight: 14,
  });
  return await pdfDoc.save();
};

/**
 * Gets page count of a PDF
 */
export const getPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  return pdf.numPages;
};

/**
 * Renders a PDF page to a Data URL (image)
 */
export const renderPageToImage = async (file: File, pageNumber: number, scale = 1.5): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error("Canvas context not available");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport: viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * Rotates pages in a PDF (Bulk or Individual)
 * @param rotations Map of pageIndex (0-based) to rotation angle (degrees)
 */
export const rotatePDFPages = async (file: File, rotations: Map<number, number>): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  pages.forEach((page, index) => {
    const angleToAdd = rotations.get(index);
    if (angleToAdd) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + angleToAdd));
    }
  });

  return await pdfDoc.save();
};

export const rotatePDF = async (file: File, rotation: number): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  pages.forEach(page => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
  });
  return await pdfDoc.save();
};


export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  imageFile?: File;
  opacity: number;
  rotation: number;
  size: number;
  position: 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'left-center' | 'right-center';
  color?: string;
}

export const watermarkPDF = async (file: File, options: WatermarkOptions): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  let embeddedImage;
  if (options.type === 'image' && options.imageFile) {
      const imgBuffer = await options.imageFile.arrayBuffer();
      try {
         if (options.imageFile.type === 'image/png') {
             embeddedImage = await pdfDoc.embedPng(imgBuffer);
         } else {
             embeddedImage = await pdfDoc.embedJpg(imgBuffer);
         }
      } catch (e) {
          throw new Error("Invalid image format");
      }
  }

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    let x = 0;
    let y = 0;
    let contentWidth = 0;
    let contentHeight = 0;

    if (options.type === 'text' && options.text) {
        contentHeight = options.size;
        contentWidth = font.widthOfTextAtSize(options.text, options.size);
    } else if (options.type === 'image' && embeddedImage) {
        contentWidth = embeddedImage.width * options.size;
        contentHeight = embeddedImage.height * options.size;
    }

    switch(options.position) {
        case 'top-left': x = 20; y = height - contentHeight - 20; break;
        case 'top-center': x = (width - contentWidth) / 2; y = height - contentHeight - 20; break;
        case 'top-right': x = width - contentWidth - 20; y = height - contentHeight - 20; break;
        case 'left-center': x = 20; y = (height - contentHeight) / 2; break;
        case 'center': x = (width - contentWidth) / 2; y = (height - contentHeight) / 2; break;
        case 'right-center': x = width - contentWidth - 20; y = (height - contentHeight) / 2; break;
        case 'bottom-left': x = 20; y = 20; break;
        case 'bottom-center': x = (width - contentWidth) / 2; y = 20; break;
        case 'bottom-right': x = width - contentWidth - 20; y = 20; break;
    }

    if (options.type === 'text' && options.text) {
        page.drawText(options.text, {
            x, y,
            size: options.size,
            font: font,
            color: hexToRgb(options.color || '#000000'),
            opacity: options.opacity,
            rotate: degrees(options.rotation),
        });
    } else if (options.type === 'image' && embeddedImage) {
        page.drawImage(embeddedImage, {
            x, y,
            width: contentWidth,
            height: contentHeight,
            opacity: options.opacity,
            rotate: degrees(options.rotation),
        });
    }
  });

  return await pdfDoc.save();
};

export const deletePages = async (file: File, pagesToDelete: number[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  pagesToDelete.sort((a, b) => b - a);
  pagesToDelete.forEach(pageIndex => {
    if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
      pdfDoc.removePage(pageIndex);
    }
  });
  return await pdfDoc.save();
};

export const cropPDF = async (file: File, margins: {top: number, bottom: number, left: number, right: number}): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();
    const newLeft = Math.max(0, margins.left);
    const newBottom = Math.max(0, margins.bottom);
    const newWidth = Math.max(0, width - margins.left - margins.right);
    const newHeight = Math.max(0, height - margins.top - margins.bottom);

    page.setCropBox(newLeft, newBottom, newWidth, newHeight);
    page.setMediaBox(newLeft, newBottom, newWidth, newHeight);
  });

  return await pdfDoc.save();
};

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ) : rgb(0,0,0);
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }
  return fullText;
};

export const editMetadata = async (file: File, metadata: { title?: string, author?: string, subject?: string, keywords?: string[] }): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  if (metadata.title) pdfDoc.setTitle(metadata.title);
  if (metadata.author) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords);
  return await pdfDoc.save();
};

export const flattenPDF = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  try { form.flatten(); } catch (e) {}
  return await pdfDoc.save();
};

export const repairPDF = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return await pdfDoc.save();
};

export const compressPDF = async (file: File, quality = 0.6): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const newPdf = await PDFDocument.create();
  const numPages = pdf.numPages;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
    const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
    const embeddedImage = await newPdf.embedJpg(imgBytes);
    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(embeddedImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }
  return await newPdf.save();
};

export const protectPDF = async (file: File, password: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  pdfDoc.encrypt({ userPassword: password, ownerPassword: password, permissions: {} });
  return await pdfDoc.save();
};

export const unlockPDF = async (file: File, password: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  copiedPages.forEach(page => newPdf.addPage(page));
  return await newPdf.save();
};

export const addPageNumbers = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  pages.forEach((page, idx) => {
    const { width } = page.getSize();
    const text = `Page ${idx + 1}`;
    page.drawText(text, { x: width / 2 - 20, y: 20, size: 12, font: font, color: rgb(0, 0, 0) });
  });
  return await pdfDoc.save();
};

export interface PDFModification {
  pageIndex: number;
  type: 'text' | 'image' | 'rectangle' | 'drawing';
  x: number;
  y: number; // PDF Coordinate system
  text?: string;
  size?: number;
  color?: string; // hex
  fontFamily?: string; 
  isBold?: boolean;
  isItalic?: boolean;
  width?: number;
  height?: number;
  imageData?: string; 
  path?: {x:number, y:number}[]; 
  strokeWidth?: number;
}

export const modifyPDF = async (
    file: File, 
    mods: PDFModification[], 
    referenceWidth?: number,
): Promise<Uint8Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Fonts cache
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Handle Additions (Overlays)
    for (const mod of mods) {
      if (mod.pageIndex < 0 || mod.pageIndex >= pages.length) continue;
      const page = pages[mod.pageIndex];
      const { width, height } = page.getSize();

      const scaleFactor = referenceWidth ? width / referenceWidth : 1;
      
      const x = mod.x * scaleFactor;
      const y = height - (mod.y * scaleFactor); 

      const modWidth = (mod.width || 0) * scaleFactor;
      const modHeight = (mod.height || 0) * scaleFactor;

      if (mod.type === 'rectangle') {
          page.drawRectangle({
              x: x,
              y: y - modHeight, 
              width: modWidth,
              height: modHeight,
              color: hexToRgb(mod.color || '#000000'),
          });

      } else if (mod.type === 'image' && mod.imageData) {
          try {
             const imgBuffer = await fetch(mod.imageData).then(r => r.arrayBuffer());
             const isPng = mod.imageData.startsWith('data:image/png');
             const embeddedImage = isPng ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
             
             page.drawImage(embeddedImage, {
                 x: x,
                 y: y - modHeight,
                 width: modWidth,
                 height: modHeight
             });
          } catch(e) { console.error("Failed to embed image", e); }
      } else if (mod.type === 'drawing' && mod.path) {
          const path = mod.path;
          if (path.length > 1) {
              for (let i = 0; i < path.length - 1; i++) {
                 const p1 = path[i];
                 const p2 = path[i+1];
                 
                 page.drawLine({
                     start: { x: p1.x * scaleFactor, y: height - (p1.y * scaleFactor) },
                     end: { x: p2.x * scaleFactor, y: height - (p2.y * scaleFactor) },
                     thickness: (mod.strokeWidth || 3) * scaleFactor,
                     color: hexToRgb(mod.color || '#000000')
                 });
              }
          }
      }
    }

    return await pdfDoc.save();
};
