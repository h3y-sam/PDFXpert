import React, { useState, useMemo } from 'react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import { ToolCategory } from '../types';
import { Search, Sparkles, ShieldCheck } from 'lucide-react';

const Tools: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const categories = Object.values(ToolCategory);

  const filteredTools = useMemo(() => {
    return TOOLS.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeCategory === 'all') return true;
      return t.category === activeCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Full Document Power Suite
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Every PDF & Document Tool You Need
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          100% offline, privacy-guaranteed tools to merge, split, compress, edit, convert, and scan documents.
        </p>

        {/* Live Search Bar */}
        <div className="relative max-w-xl mx-auto mt-6">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all tools..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'all'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300'
          }`}
        >
          All Tools ({TOOLS.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grouped or Filtered View */}
      {activeCategory === 'all' && !searchQuery ? (
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryTools = TOOLS.filter((t) => t.category === category);
            if (categoryTools.length === 0) return null;

            return (
              <div key={category} className="animate-fade-in">
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {category}
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">
                    {categoryTools.length} tool{categoryTools.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tools;
