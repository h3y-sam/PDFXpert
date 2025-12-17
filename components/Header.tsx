
// Add missing React import
import React from 'react';
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import Logo from "./Logo";

export default function Header({
  darkMode,
  toggleDarkMode,
}: {
  darkMode: boolean;
  toggleDarkMode: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-20 gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Logo className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-baseline">
              PDF<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Xpert</span>
            </span>
          </Link>

          {/* Horizontal Nav */}
          <nav className="hidden lg:flex items-center gap-2 whitespace-nowrap flex-1 ml-4">

            <NavLink to="/" label="Home" />

            <Dropdown label="Convert to PDF">
              <DropLink to="/tools/img-to-pdf" text="JPG to PDF" />
              <DropLink to="/tools/word-to-pdf" text="Word to PDF" />
              <DropLink to="/tools/ppt-to-pdf" text="PowerPoint to PDF" />
              <DropLink to="/tools/excel-to-pdf" text="Excel to PDF" />
              <DropLink to="/tools/html-to-pdf" text="HTML to PDF" />
            </Dropdown>

            <Dropdown label="Convert from PDF">
              <DropLink to="/tools/pdf-to-img" text="PDF to JPG" />
              <DropLink to="/tools/pdf-to-word" text="PDF to Word" />
              <DropLink to="/tools/pdf-to-ppt" text="PDF to PowerPoint" />
              <DropLink to="/tools/pdf-to-excel" text="PDF to Excel" />
              <DropLink to="/tools/pdf-to-text" text="PDF to Text" />
            </Dropdown>

            <Dropdown label="Edit & Organize">
              <DropLink to="/tools/merge" text="Merge PDF" />
              <DropLink to="/tools/split" text="Split PDF" />
              <DropLink to="/tools/compress" text="Compress PDF" />
              <DropLink to="/tools/edit-pdf" text="Edit PDF" />
              <DropLink to="/tools/rotate" text="Rotate PDF" />
              <DropLink to="/tools/reorder-pages" text="Organize PDF" />
              <DropLink to="/tools/delete-pages" text="Delete Pages" />
              <DropLink to="/tools/protect" text="Protect PDF" />
              <DropLink to="/tools/unlock" text="Unlock PDF" />
            </Dropdown>

          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to="/tools"
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-rose-600 text-white font-semibold hover:bg-slate-800 dark:hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all"
            >
              All Tools
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

/* ---------- Components ---------- */

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
