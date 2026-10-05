import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Cpu,
  Search,
  Sparkles,
  Layers,
  FileText,
  Camera,
  Bot,
  Scissors,
  Minimize2,
  PenTool,
} from 'lucide-react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import { ToolCategory } from '../types';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'popular', label: 'Popular' },
    { id: ToolCategory.ORGANIZE, label: 'Organize' },
    { id: ToolCategory.OPTIMIZE, label: 'Optimize' },
    { id: ToolCategory.EDIT, label: 'Edit & Sign' },
    { id: ToolCategory.CONVERT_TO, label: 'Convert to PDF' },
    { id: ToolCategory.CONVERT_FROM, label: 'Convert from PDF' },
    { id: ToolCategory.SECURITY, label: 'Security' },
  ];

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'popular') return tool.popular;
      return tool.category === selectedCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        {/* Soft Background Glowing Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-rose-500/10 dark:bg-rose-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-orange-500/10 dark:bg-orange-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-bold mb-6 animate-fade-in shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span>100% Client-Side Private • Zero Files Uploaded to Cloud</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            All-In-One Document & PDF Suite <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500">
              Without Limits
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Merge, split, compress, edit, convert, and chat with your documents using browser-native AI & cryptographic tools.
          </p>

          {/* Live Search & Quick Launch Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., merge, compress, AI chat, scanner, sign, word)..."
                className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-900 dark:text-white text-sm sm:text-base outline-none font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-3 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-slate-400">Popular:</span>
              <Link
                to="/tools/merge"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
              >
                ⚡ Merge PDF
              </Link>
              <Link
                to="/tools/compress"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
              >
                ⚡ Compress
              </Link>
              <Link
                to="/tools/chat-pdf"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
              >
                ⚡ AI Chat
              </Link>
              <Link
                to="/tools/scan"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
              >
                ⚡ Camera Scan
              </Link>
              <Link
                to="/tools/edit-pdf"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
              >
                ⚡ Sign & Edit
              </Link>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% In-Browser Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Zero Files Sent to Servers</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Instant Client-Side Speed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tools Grid Section */}
      <section className="py-12 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Category Filter Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Explore All PDF Tools
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Showing {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
              <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">No tools found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for another keyword or reset the category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How it Works / Privacy Pillar Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Airplane-Mode Safe
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              How PDFXpert Keeps You Safe
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Unlike other PDF websites that upload your confidential documents to unknown remote servers, PDFXpert runs entirely on your computer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Zero Cloud Uploads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your files never travel across the internet. All byte streams stay in local RAM sandbox memory.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">2. Multi-Core WebWorkers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Processes complex PDF rendering, merging, and AI extraction at native CPU speed without lag.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">3. Instant Downloads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                No waiting in server queues. Download generated files immediately as memory blobs with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
