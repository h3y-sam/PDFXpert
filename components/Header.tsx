
// Add missing React import
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Download
} from "lucide-react";
import Logo from "./Logo";
import { usePremium } from '../context/PremiumContext';
import { usePwaInstall } from './InstallPwaBanner';

export default function Header({
  darkMode,
  toggleDarkMode,
}: {
  darkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const { isPro, tier, openUpgradeModal } = usePremium();
  const { isInstallable, triggerInstall } = usePwaInstall();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileOpen(false);
    setExpandedSection(null);
  };

  const toggleSection = (label: string) => {
    setExpandedSection(prev => (prev === label ? null : label));
  };

  const navSections = [
    {
      label: 'Convert to PDF',
      links: [
        { to: '/tools/img-to-pdf', text: 'JPG to PDF' },
        { to: '/tools/word-to-pdf', text: 'Word to PDF' },
        { to: '/tools/ppt-to-pdf', text: 'PowerPoint to PDF' },
        { to: '/tools/excel-to-pdf', text: 'Excel to PDF' },
        { to: '/tools/html-to-pdf', text: 'HTML to PDF' },
      ],
    },
    {
      label: 'Convert from PDF',
      links: [
        { to: '/tools/pdf-to-img', text: 'PDF to JPG' },
        { to: '/tools/pdf-to-word', text: 'PDF to Word' },
        { to: '/tools/pdf-to-ppt', text: 'PDF to PowerPoint' },
        { to: '/tools/pdf-to-excel', text: 'PDF to Excel' },
        { to: '/tools/pdf-to-text', text: 'PDF to Text' },
      ],
    },
    {
      label: 'Edit & Organize',
      links: [
        { to: '/tools/merge', text: 'Merge PDF' },
        { to: '/tools/split', text: 'Split PDF' },
        { to: '/tools/compress', text: 'Compress PDF' },
        { to: '/tools/edit-pdf', text: 'Edit PDF' },
        { to: '/tools/rotate', text: 'Rotate PDF' },
        { to: '/tools/reorder-pages', text: 'Organize PDF' },
        { to: '/tools/delete-pages', text: 'Delete Pages' },
        { to: '/tools/protect', text: 'Protect PDF' },
        { to: '/tools/unlock', text: 'Unlock PDF' },
      ],
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-20 gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" onClick={closeMobile}>
            <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Logo className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-baseline">
              PDF<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Xpert</span>
            </span>
          </Link>

          {/* Desktop Horizontal Nav */}
          <nav className="hidden lg:flex items-center gap-2 whitespace-nowrap flex-1 ml-4">
            <NavLink to="/" label="Home" />
            {navSections.map(s => (
              <Dropdown key={s.label} label={s.label}>
                {s.links.map(l => <DropLink key={l.to} to={l.to} text={l.text} />)}
              </Dropdown>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
            {isInstallable && (
              <button
                onClick={triggerInstall}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
                title="Install PDFXpert to Desktop / Home Screen"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Pro / Upgrade Trigger */}
            <button
              onClick={openUpgradeModal}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-sm ${
                isPro
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-rose-500/20 active:scale-95 sm:hover:scale-105'
              }`}
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{isPro ? `${tier.toUpperCase()}` : <span><span className="hidden sm:inline">UPGRADE </span>PRO</span>}</span>
            </button>

            <Link
              to="/tools"
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-rose-600 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 dark:hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all"
              onClick={closeMobile}
            >
              All Tools
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 sm:p-2.5 rounded-xl text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 overflow-y-auto max-h-[calc(100vh-5rem)] animate-fade-in shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">

            {isInstallable && (
              <button
                onClick={() => {
                  triggerInstall();
                  closeMobile();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold text-sm border border-rose-200 dark:border-rose-900/60 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Install PDFXpert PWA App</span>
                </div>
                <span className="text-[11px] uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full">Offline</span>
              </button>
            )}

            <Link
              to="/"
              onClick={closeMobile}
              className="flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Home
            </Link>

            {navSections.map(section => (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {section.label}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${expandedSection === section.label ? 'rotate-90' : ''}`}
                  />
                </button>
                {expandedSection === section.label && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-rose-100 dark:border-rose-900/40 pl-4 animate-fade-in">
                    {section.links.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={closeMobile}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                      >
                        {link.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <Link
                to="/tools"
                onClick={closeMobile}
                className="flex items-center justify-center px-5 py-3 rounded-xl bg-slate-900 dark:bg-rose-600 text-white font-semibold hover:bg-slate-800 dark:hover:bg-rose-700 transition-all w-full mt-2"
              >
                All Tools
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Desktop Components ---------- */

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300
                 hover:text-rose-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
    >
      {label}
    </Link>
  );
}

function Dropdown({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold
                   text-gray-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-white
                   hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
      >
        {label}
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </button>

      {/* Dropdown Menu */}
      <div
        className="absolute top-full left-0 pt-3 z-50
                   opacity-0 invisible group-hover:opacity-100
                   group-hover:visible transition-all duration-200 transform origin-top-left"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl
                        border border-gray-200 dark:border-slate-700
                        w-60 p-2 ring-1 ring-black/5">
          {children}
        </div>
      </div>
    </div>
  );
}

function DropLink({ to, text }: { to: string; text: string }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 rounded-lg text-sm
                 text-gray-700 dark:text-gray-200
                 hover:bg-rose-50 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
    >
      {text}
    </Link>
  );
}
