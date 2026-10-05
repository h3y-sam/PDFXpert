import React, { useState } from 'react';
import { usePremium } from '../context/PremiumContext';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  Tag,
  Lock,
  Layers,
  FileCheck,
  X,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

export default function UpgradeModal() {
  const {
    isPro,
    tier,
    license,
    isUpgradeModalOpen,
    closeUpgradeModal,
    redeemCoupon,
    resetLicense,
    availableCoupons,
  } = usePremium();

  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'coupon'>('plans');

  if (!isUpgradeModalOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setLoading(true);
    await redeemCoupon(couponInput);
    setLoading(false);
    setCouponInput('');
  };

  const handleQuickApply = async (code: string) => {
    setLoading(true);
    await redeemCoupon(code);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Header Banner */}
        <div className="relative px-6 py-6 sm:px-8 sm:py-8 bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 text-white">
          <button
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> PDFXpert Pro Suite
            </span>
            {isPro && (
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {tier.toUpperCase()} Active
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Unlock Unlimited Power & Bulk Processing
          </h2>
          <p className="mt-2 text-sm sm:text-base text-rose-100 max-w-xl">
            100% Client-Side privacy with enterprise speed. No file upload limits, multi-threaded WebWorkers, and neural OCR.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 pt-4">
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Features & Plans
          </button>
          <button
            onClick={() => setActiveTab('coupon')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'coupon'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" /> Redeem Coupon / Promo Code
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === 'plans' && (
            <>
              {/* Feature Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Tier */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white">Community Edition</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                      Forever Free
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">$0</p>
                  <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> 100% Offline Processing
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Up to 10 files per batch
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Standard 150-300 DPI Export
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Basic OCR Text Extraction
                    </li>
                  </ul>
                </div>

                {/* Pro Tier */}
                <div className="p-5 rounded-2xl border-2 border-rose-500 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 relative shadow-sm">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Recommended
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-500" /> Pro Lifetime
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded">
                      Coupon Eligible
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {isPro ? 'ACTIVATED' : '$49'}
                    </span>
                    {!isPro && (
                      <span className="text-xs text-slate-400 line-through font-medium">
                        $99 (Free with Coupon)
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-2 font-medium">
                      <Zap className="w-4 h-4 text-rose-500 shrink-0" /> <b>Unlimited Bulk Batch (100+ files)</b>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Ultra 600 DPI & Lossless Vector
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Multi-Language Neural OCR
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Turbo Multi-Core WebWorkers
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Offline Audit & Zero-Retention Log
                    </li>
                  </ul>
                </div>
              </div>

              {/* Status or Activate CTA */}
              {isPro ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                        You have Lifetime Pro Access
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Code: {license?.couponCode || 'PRO_ACTIVATED'} • Activated: {license?.activatedAt ? new Date(license.activatedAt).toLocaleDateString() : 'Active'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetLicense}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset License
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setActiveTab('coupon')}
                    className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Tag className="w-4 h-4" /> Have a Coupon Code? Redeem Now
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'coupon' && (
            <div className="space-y-6">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Enter Coupon or Promo Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. PDFXPERT_PRO"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase tracking-wider text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !couponInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2 shrink-0"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Apply Code
                  </button>
                </div>
              </form>

              {/* Quick test coupons list for easy verification */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" /> Available Test & Launch Coupons:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(availableCoupons).map(([code, def]) => (
                    <div
                      key={code}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 flex items-center justify-between gap-2 shadow-sm hover:border-rose-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                            {code}
                          </code>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                            {def.discount}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {def.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickApply(code)}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-rose-900/40 text-slate-700 hover:text-rose-600 dark:text-slate-200 dark:hover:text-rose-300 font-semibold rounded-lg transition-colors shrink-0"
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Protection Badge */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex items-start gap-3">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <b>Production Offline Security:</b> Coupons and license keys are verified via Web Crypto SHA-256 signatures with client-side anti-tamper checksums and brute-force rate limiting. No telemetry or file transmission occurs.
                </p>
              </div>
            </div>
          )}

          {/* Footer Security Badges */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Client-Side Private
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" /> High-Performance WebWorkers
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-orange-500" /> Zero File Size Limits in Pro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
