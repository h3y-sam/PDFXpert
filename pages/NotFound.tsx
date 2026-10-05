
import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <FileQuestion className="w-16 h-16 text-blue-400 dark:text-blue-500" />
          </div>
          <span className="absolute -top-3 -right-3 text-5xl font-black text-slate-200 dark:text-slate-700 select-none">404</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed">
          This tool or page doesn't exist yet. It may be coming soon, or the link may be wrong.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/tools"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" /> All Tools
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
