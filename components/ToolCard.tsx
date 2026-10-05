import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getIcon } from '../constants';
import { ToolConfig } from '../types';

interface ToolCardProps {
  tool: ToolConfig;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <Link 
      to={tool.path}
      className="group relative bg-white dark:bg-slate-800/90 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-rose-500/10 border border-slate-200/80 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Top row: Icon & Badges */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/40 transition-all duration-300 ${tool.color}`}>
          {getIcon(tool.icon)}
        </div>

        {tool.popular && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
            <Sparkles className="w-3 h-3 text-rose-500" /> Popular
          </span>
        )}
      </div>
      
      {/* Category tag */}
      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
        {tool.category}
      </span>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
        {tool.title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 flex-grow line-clamp-2">
        {tool.description}
      </p>
      
      {/* Bottom CTA */}
      <div className="flex items-center text-xs font-bold text-rose-600 dark:text-rose-400 pt-3 border-t border-slate-100 dark:border-slate-700/60 group-hover:translate-x-1 transition-transform">
        <span>Open Tool</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default ToolCard;
