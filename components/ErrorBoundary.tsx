
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
    // If it's a dynamic import failure (new version deployed), auto refresh once
    if (error.message?.includes('dynamically imported module') || error.message?.includes('Failed to fetch')) {
      const lastReload = sessionStorage.getItem('pdfxpert_chunk_reload');
      if (!lastReload || Date.now() - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('pdfxpert_chunk_reload', Date.now().toString());
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    // Force cache busting reload on manual retry
    if (this.state.error?.message?.includes('dynamically imported module')) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Something went wrong
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              This tool encountered an unexpected error. Your other tools are unaffected.
            </p>
            {this.state.error && (
              <p className="text-xs text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 mb-8 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <Link
                to="/tools"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Home className="w-4 h-4" /> All Tools
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
