
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getIcon } from '../constants';
import { ToolConfig } from '../types';

interface ToolCardProps {
  tool: ToolConfig;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <Link 
      to={tool.path}
      className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className={`w-12 h-12 rounded-lg bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${tool.color}`}>
        {getIcon(tool.icon)}
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
        {tool.description}
      </p>
      
      <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
        Try now <ArrowRight className="w-4 h-4 ml-1" />
      </div>

      {tool.popular && (
        <div className="absolute top-4 right-4">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}
    </Link>
  );
};

export default ToolCard;
