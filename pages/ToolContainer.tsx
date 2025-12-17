
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ToolContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actionArea?: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ title, description, children, actionArea }) => {
  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-8 animate-fade-in">
        <Link 
          to="/tools" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium group"
        >
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-all">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span>Back to Tools</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto text-center mb-10 animate-slide-up">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="text-lg text-gray-600 dark:text-slate-300">{description}</p>
      </div>

      <div className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-slate-700 p-6 md:p-12 transition-colors">
          {children}
        </div>

        {actionArea && (
          <div className="mt-8 flex justify-center">
            {actionArea}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolContainer;
