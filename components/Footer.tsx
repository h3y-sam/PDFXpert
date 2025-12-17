
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 mt-auto border-t border-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Section: Brand & Nav Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column (Left - 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative group-hover:scale-105 transition-transform duration-300">
                <Logo className="w-10 h-10" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                PDF<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Xpert</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed pr-6">
              The ultimate all-in-one PDF solution for your daily document needs. 
              Secure, fast, and <strong>100% offline</strong> processing directly in your browser using WebAssembly.
            </p>
          </div>

          {/* Links Grid (Right - 8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-white mb-6">Core Tools</h4>
              <ul className="space-y-3 text-sm">
                <FooterLink to="/tools/merge" text="Merge PDF" />
                <FooterLink to="/tools/split" text="Split PDF" />
                <FooterLink to="/tools/compress" text="Compress PDF" />
                <FooterLink to="/tools/edit-pdf" text="Edit PDF" />
                <FooterLink to="/tools/sign-pdf" text="Sign PDF" />
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Convert To PDF</h4>
              <ul className="space-y-3 text-sm">
                <FooterLink to="/tools/img-to-pdf" text="JPG to PDF" />
                <FooterLink to="/tools/word-to-pdf" text="Word to PDF" />
                <FooterLink to="/tools/ppt-to-pdf" text="PowerPoint to PDF" />
                <FooterLink to="/tools/excel-to-pdf" text="Excel to PDF" />
                <FooterLink to="/tools/html-to-pdf" text="HTML to PDF" />
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Convert From PDF</h4>
              <ul className="space-y-3 text-sm">
                <FooterLink to="/tools/pdf-to-img" text="PDF to JPG" />
                <FooterLink to="/tools/pdf-to-word" text="PDF to Word" />
                <FooterLink to="/tools/pdf-to-ppt" text="PDF to PowerPoint" />
                <FooterLink to="/tools/pdf-to-excel" text="PDF to Excel" />
                <FooterLink to="/tools/pdf-to-text" text="PDF to Text" />
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-3 text-sm">
                <FooterLink to="/" text="Home" />
                <FooterLink to="/tools" text="All Tools" />
                <FooterLink to="#" text="Privacy Policy" />
              </ul>
            </div>
          </div>
        </div>

        {/* SEO & Popular Searches Section */}
        <div className="border-t border-slate-900 pt-12 pb-8">
           <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-blue-500" />
              <h5 className="font-semibold text-white">Popular Tools & Searches</h5>
           </div>
           
           <div className="flex flex-wrap gap-x-3 gap-y-3 text-xs mb-8">
              {[
                'Merge PDF', 'Split PDF', 'Compress PDF', 'Office to PDF', 'PDF to Word', 
                'PDF to Excel', 'PDF to PPT', 'PDF to Image', 'Image to PDF', 'Unlock PDF', 
                'Protect PDF', 'Rotate PDF', 'Crop PDF', 'Redact PDF', 'Sign PDF', 
                'Watermark PDF', 'PDF OCR', 'PDF Repair', 'Flatten PDF', 'Resize PDF', 
                'Extract Pages', 'Delete Pages', 'Reorder Pages', 'Free PDF Tools', 
                'Offline PDF Converter', 'PDF Editor Online', 'Secure PDF Tools', 'PDF Metadata Editor',
                'PDF to JSON', 'Scan to PDF', 'JPG to PDF Converter', 'PNG to PDF', 'PDF to DOCX'
              ].map((tag, i) => (
                <Link 
                  key={i} 
                  to="/tools" 
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 border border-slate-800 hover:border-slate-700 hover:-translate-y-0.5"
                >
                  {tag}
                </Link>
              ))}
           </div>

           <p className="text-xs text-slate-500 leading-relaxed max-w-5xl">
             PDFXpert provides a comprehensive suite of PDF tools for all your document management needs. 
             Whether you're looking to <strong>combine multiple PDFs</strong> into a single file, <strong>reduce file size</strong> for easy sharing, 
             or <strong>convert documents</strong> between formats like Word, Excel, and JPG, our platform offers a fast, free, and secure solution.
             Unlike other online PDF editors that upload your files to a server, we process files locally on your device using advanced WebAssembly technology, ensuring your sensitive data never leaves your computer.
             Enjoy unlimited access to premium PDF features like OCR, redaction, and digital signing without registration or software installation.
           </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>
            &copy; {currentYear} PDFXpert. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2">
             <span>Made with</span>
             <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
             <span>by</span>
             <span className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer" title="The developer">h3y.sam</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, text }: { to: string; text: string }) => (
  <li>
    <Link to={to} className="hover:text-blue-400 transition-colors duration-200 block hover:translate-x-1">
      {text}
    </Link>
  </li>
);

export default Footer;
