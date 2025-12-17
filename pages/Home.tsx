
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Layers, CheckCircle2, Lock, Cpu } from 'lucide-react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';

const Home: React.FC = () => {
  const popularTools = TOOLS.filter(t => t.popular);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-sm font-medium mb-8 animate-fade-in">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
             </span>
             v2.0 is now live: 100% Offline Processing
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
            Manage your PDFs <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
              without limits
            </span>
          </h1>
          
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Every tool you need to work with PDFs in one place. 
            <span className="font-semibold text-slate-900 dark:text-slate-200"> Merge, split, compress, convert, rotate, unlock and watermark PDFs</span> 
            with just a few clicks. 
            <br className="hidden md:block" />
            Secure, privacy-focused, and completely free.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/tools" 
              className="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white font-bold text-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center group"
            >
              Start using PDFXpert <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/tools/merge" 
              className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-1 flex items-center"
            >
              Merge PDF
            </Link>
          </div>

          {/* Quick Stats / Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-500 dark:text-slate-400">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No file size limits</span>
             </div>
             <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Files stay on your device</span>
             </div>
             <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Instant processing</span>
             </div>
          </div>
        </div>
      </section>

      {/* Popular Tools Grid */}
      <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Most Popular Tools</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Essential tools for your daily document workflow</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
             <Link to="/tools" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                View all PDF tools <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* Value Props / Why Choose Us */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why choose PDFXpert?</h2>
           <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">We prioritize your privacy and productivity with our advanced client-side technology.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Lock className="w-8 h-8 text-blue-600" />}
            title="100% Privacy Guaranteed"
            description="Unlike other online tools, we don't upload your files to any server. All processing happens locally in your browser using WebAssembly. Your data never leaves your device."
          />
          <FeatureCard 
            icon={<Cpu className="w-8 h-8 text-purple-600" />}
            title="Blazing Fast Performance"
            description="By leveraging your device's processing power, we eliminate upload and download times. Experience instant conversions and modifications, even with large files."
          />
          <FeatureCard 
            icon={<Layers className="w-8 h-8 text-pink-600" />}
            title="Professional Quality"
            description="Our advanced PDF engine ensures high-fidelity conversions and preservation of formatting. Edit, merge, and convert documents without losing quality."
          />
        </div>
      </section>

      {/* Mini CTA */}
      <section className="py-20 px-4">
         <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-blue-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to get started?</h2>
              <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of users who trust PDFXpert for their document needs. No registration required.
              </p>
              <Link 
                to="/tools" 
                className="inline-block px-10 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Go to Tools
              </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
      {description}
    </p>
  </div>
);

export default Home;
