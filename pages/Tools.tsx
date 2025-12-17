
import React from 'react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import { ToolCategory } from '../types';

const Tools: React.FC = () => {
  const categories = Object.values(ToolCategory);

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Every PDF Tool You Need</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          We have organized our collection of PDF tools to make processing your digital documents easier than ever.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category) => {
          const categoryTools = TOOLS.filter(t => t.category === category);
          if (categoryTools.length === 0) return null;

          return (
            <div key={category} className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tools;
