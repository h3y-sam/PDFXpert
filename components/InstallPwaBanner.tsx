import React, { useState, useEffect } from 'react';
import { Download, X, Laptop, Smartphone, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      return false;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return { isInstallable, isInstalled, triggerInstall };
};

const InstallPwaBanner: React.FC = () => {
  const { isInstallable, isInstalled, triggerInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('pdfxpert_pwa_dismissed') === 'true';
  });

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pdfxpert_pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    const installed = await triggerInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  return (
    <aside 
      aria-label="App Installation" 
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-3xl border border-slate-700/80 shadow-2xl shadow-rose-950/40 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Download className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Install Desktop App</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Get PDFXpert for Offline Use</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Install PDFXpert onto your PC, Mac, or phone to edit and convert PDFs without an internet connection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Install App (Free)
          </button>
          
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Not Now
          </button>
        </div>
      </div>
    </aside>
  );
};

export default InstallPwaBanner;
