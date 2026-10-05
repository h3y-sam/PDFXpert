import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Home } from 'lucide-react';

interface ToolContainerProps {
  title: string;
  description: string;
  category?: string;
  children: React.ReactNode;
  actionArea?: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({
  title,
  description,
  category,
  children,
  actionArea,
}) => {
  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-rose-500 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <Link
            to="/tools"
            className="hover:text-rose-500 transition-colors"
          >
            Tools
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-white font-bold">{title}</span>
        </div>

        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Tools</span>
        </Link>
      </div>

      {/* Tool Header */}
      <div className="max-w-3xl mx-auto text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Privacy Guaranteed
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
          {description}
        </p>
      </div>

      {/* Main Action Area Container */}
      <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="bg-white dark:bg-slate-850 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200/80 dark:border-slate-700/80 p-5 sm:p-8 md:p-10 transition-colors">
          {children}
        </div>

        {actionArea && (
          <div className="mt-8 flex justify-center">{actionArea}</div>
        )}
      </div>
    </div>
  );
};

export default ToolContainer;
