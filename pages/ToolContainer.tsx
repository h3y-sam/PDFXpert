import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Home } from 'lucide-react';

interface ToolContainerProps {
  title: string;
  description: string;
  category?: string;
  children: React.ReactNode;
  actionArea?: React.ReactNode;
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const ToolContainer: React.FC<ToolContainerProps> = ({
  title,
  description,
  children,
  actionArea,
  maxWidth = '5xl',
}) => {
  const maxWidthClass = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  }[maxWidth] || 'max-w-5xl';

  return (
    <div className="min-h-[85vh] py-6 sm:py-10 md:py-12 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 animate-fade-in">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-rose-500 transition-colors shrink-0"
          >
            <Home className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Home</span>
          </Link>
          <span className="shrink-0">/</span>
          <Link
            to="/tools"
            className="hover:text-rose-500 transition-colors shrink-0"
          >
            Tools
          </Link>
          <span className="shrink-0">/</span>
          <span className="text-slate-800 dark:text-white font-bold truncate max-w-[120px] sm:max-w-xs md:max-w-md">{title}</span>
        </div>

        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">All </span>Tools
        </Link>
      </div>

      {/* Tool Header */}
      <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8 animate-slide-up px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> 100% Client-Side Privacy Guaranteed
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 sm:mb-3">
          {title}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
          {description}
        </p>
      </div>

      {/* Main Action Area Container */}
      <div className={`${maxWidthClass} mx-auto animate-slide-up`} style={{ animationDelay: '0.05s' }}>
        <div className="bg-white dark:bg-slate-850 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-6 md:p-8 lg:p-10 transition-colors">
          {children}
        </div>

        {actionArea && (
          <div className="mt-6 sm:mt-8 flex justify-center">{actionArea}</div>
        )}
      </div>
    </div>
  );
};

export default ToolContainer;

