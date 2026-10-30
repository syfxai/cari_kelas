'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function PwaBanner(): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  const checkInstallStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }
  }, []);

  useEffect(() => {
    checkInstallStatus();

    // 1. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    // 2. Pick up early captured prompt if available
    if (typeof window !== 'undefined' && window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    // 3. Listen for future prompts
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const pEvent = e as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = pEvent;
      setDeferredPrompt(pEvent);
    };

    const handlePromptReady = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        window.__deferredPwaPrompt = null;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkInstallStatus]);

  const handleInstallClick = async () => {
    // A. iOS Safari: open dedicated step-by-step Apple guide
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    // B. Android / Desktop Chrome / Edge: trigger native install dialog
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__deferredPwaPrompt = null;
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
      return;
    }

    // C. Fallback for iOS / Safari if not auto-detected or Desktop without prompt
    if (isInstalled) {
      alert('Aplikasi CARI KELAS sedia terpasang pada peranti anda!');
    } else {
      setShowIosModal(true);
    }
  };

  return (
    <>
      <div className="relative rounded-[32px] bg-white border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden group">
        {/* Decorative Ambient Background Glows */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#3f8ceb]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Information & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs">
                {/* Apple Logo SVG */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170" aria-hidden="true">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.5-7.79-11.44-14.14-5.85-9.39-10.4-20.2-13.65-32.44-3.25-12.24-4.88-23.77-4.88-34.59 0-14.24 3.42-25.7 10.27-34.39 6.84-8.69 15.34-13.12 25.49-13.3 4.9.11 10.05 1.34 15.45 3.69 5.4 2.36 9.4 3.59 11.98 3.69 2.22 0 6.42-1.29 12.6-3.86 6.18-2.58 11.59-3.76 16.24-3.56 10.74.55 19.34 4.34 25.8 11.37-9.44 5.74-14.07 13.88-13.88 24.42.2 8.35 3.42 15.22 9.68 20.61 6.25 5.39 13.79 8.44 22.61 9.15-2.22 6.84-4.84 13.43-7.86 19.78zm-30.83-108.62c0-6.19 2.27-12.01 6.81-17.46 4.54-5.46 10.27-9.17 17.2-11.14.71 5.74-.75 11.52-4.38 17.34-3.63 5.82-9.28 9.53-16.95 11.14-.81.08-1.7.12-2.68.12z" />
                </svg>
                <span>Apple iOS & Android PWA</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-[#3f8ceb] text-[11px] font-bold border border-sky-100/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3f8ceb] animate-pulse" />
                <span>Tanpa Perlu Muat Turun di App Store</span>
              </span>

              {isInstalled && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Aplikasi Sedia Terpasang ✓</span>
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Pasang CARI KELAS Terus di Skrin Telefon Anda
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Akses pantas dengan 1-klik dari skrin utama telefon (Home Screen) seperti aplikasi asli iPhone dan Android. Pantas, ringan, dan paparan skrin penuh tanpa bar carian pelayar.
              </p>
            </div>

            {/* Apple-grade Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <span className="font-medium">1-Klik Pantas dari Home Screen</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-5 h-5 rounded-lg bg-[#3f8ceb]/10 text-[#3f8ceb] flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <span className="font-medium">Paparan Skrin Penuh (Tiada Bar URL)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <span className="font-medium">Ringan & Tidak Penuhkan Storan</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <span className="font-medium">Kemas kini automatik bila dalam talian</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isInstalled ? (
                <div className="h-12 px-6 bg-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Aplikasi Sedia Terpasang pada Peranti Ini ✓</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="h-12 sm:h-13 px-7 bg-slate-950 hover:bg-slate-900 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-slate-950/20 hover:shadow-xl flex items-center justify-center gap-3 cursor-pointer group/btn border border-slate-800 hover:border-slate-700 hover:scale-[1.01]"
                >
                  <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover/btn:bg-[#3f8ceb]/20 transition-colors">
                    {/* Apple Logo or Device Install Icon */}
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170" aria-hidden="true">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.5-7.79-11.44-14.14-5.85-9.39-10.4-20.2-13.65-32.44-3.25-12.24-4.88-23.77-4.88-34.59 0-14.24 3.42-25.7 10.27-34.39 6.84-8.69 15.34-13.12 25.49-13.3 4.9.11 10.05 1.34 15.45 3.69 5.4 2.36 9.4 3.59 11.98 3.69 2.22 0 6.42-1.29 12.6-3.86 6.18-2.58 11.59-3.76 16.24-3.56 10.74.55 19.34 4.34 25.8 11.37-9.44 5.74-14.07 13.88-13.88 24.42.2 8.35 3.42 15.22 9.68 20.61 6.25 5.39 13.79 8.44 22.61 9.15-2.22 6.84-4.84 13.43-7.86 19.78zm-30.83-108.62c0-6.19 2.27-12.01 6.81-17.46 4.54-5.46 10.27-9.17 17.2-11.14.71 5.74-.75 11.52-4.38 17.34-3.63 5.82-9.28 9.53-16.95 11.14-.81.08-1.7.12-2.68.12z" />
                    </svg>
                  </span>
                  <span>{isIos ? 'Tambah ke Skrin Utama iPhone' : 'Pasang Aplikasi Sekarang'}</span>
                  <span className="font-extrabold text-sm group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
              )}

              {/* Step Guide Link for iPhone */}
              <button
                type="button"
                onClick={() => setShowIosModal(true)}
                className="h-11 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Cara Pasang di iPhone / iPad</span>
                <span>ⓘ</span>
              </button>
            </div>
          </div>

          {/* Right Column: Apple iPhone Mockup Showcase (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center items-center py-2 lg:py-0">
            <div className="relative group/phone">
              {/* Floating Highlight Badge Beside Phone */}
              <div className="absolute -top-3 -right-2 sm:-right-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-lg flex items-center gap-2 transform group-hover/phone:-translate-y-1 transition-transform duration-300">
                <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="text-[10px] leading-tight">
                  <span className="font-bold text-slate-900 block">Sedia di Home Screen</span>
                  <span className="text-slate-500 text-[9px]">1-Klik Terus Buka</span>
                </div>
              </div>

              {/* iPhone 16 Pro Style Frame */}
              <div className="relative w-[215px] sm:w-[230px] rounded-[44px] p-2.5 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.35)] ring-1 ring-white/10 select-none">
                {/* Hardware Side Buttons */}
                <span className="absolute -left-[3px] top-20 w-[3px] h-7 bg-slate-700 rounded-l-sm" />
                <span className="absolute -left-[3px] top-32 w-[3px] h-11 bg-slate-700 rounded-l-sm" />
                <span className="absolute -left-[3px] top-48 w-[3px] h-11 bg-slate-700 rounded-l-sm" />
                <span className="absolute -right-[3px] top-28 w-[3px] h-14 bg-slate-700 rounded-r-sm" />

                {/* Inner Bezel Screen */}
                <div className="relative rounded-[36px] bg-[#F8FAFC] overflow-hidden border border-slate-900 h-[420px] flex flex-col justify-between shadow-inner">
                  {/* Subtle Screen Reflection Sheen */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent z-20" />

                  {/* Top Status Bar & Dynamic Island */}
                  <div className="relative pt-2 px-4 z-10 flex flex-col items-center">
                    {/* Apple Dynamic Island */}
                    <div className="w-20 h-4.5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
                      <span className="w-1 h-1 rounded-full bg-[#0d131f]" />
                    </div>

                    {/* Status Bar Indicators */}
                    <div className="w-full flex items-center justify-between text-[9px] font-bold text-slate-800 mt-1 px-1">
                      <span>9:41</span>
                      <div className="flex items-center gap-1 text-[8px]">
                        {/* Signal Bars */}
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <rect x="2" y="16" width="3" height="6" rx="1" />
                          <rect x="7" y="12" width="3" height="10" rx="1" />
                          <rect x="12" y="8" width="3" height="14" rx="1" />
                          <rect x="17" y="4" width="3" height="18" rx="1" />
                        </svg>
                        {/* Wi-Fi */}
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z" />
                        </svg>
                        {/* Battery */}
                        <div className="w-4 h-2 border border-slate-700 rounded-[2px] p-[0.5px] flex items-center">
                          <div className="w-full h-full bg-emerald-500 rounded-[1px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inside Screen: Live CARI KELAS Mini UI */}
                  <div className="px-3 py-2 space-y-2.5 overflow-hidden z-10 flex-1 flex flex-col justify-center">
                    {/* Mini App Header */}
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-2xs border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 p-0.5 flex items-center justify-center shrink-0">
                          <Image
                            src="/icons/icon-192.png"
                            alt="Logo CARI KELAS"
                            width={20}
                            height={20}
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-[10px] font-extrabold text-slate-900 leading-none">CARI KELAS</div>
                          <div className="text-[7.5px] text-slate-400 font-medium">KPTM Ipoh</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full bg-sky-50 text-[#3f8ceb] text-[7.5px] font-bold">
                        PWA
                      </span>
                    </div>

                    {/* Mini Hero Card */}
                    <div className="bg-gradient-to-br from-white to-sky-50/50 p-2.5 rounded-xl border border-sky-100/60 shadow-2xs space-y-1">
                      <div className="text-[9px] font-extrabold text-slate-900 leading-tight">
                        Jadual & Bilik Kosong
                      </div>
                      <p className="text-[7.5px] text-slate-500 leading-tight">
                        Waktu 1 hingga 10 (Isnin – Jumaat)
                      </p>
                      <div className="pt-1 flex gap-1">
                        <span className="px-2 py-0.5 rounded-lg bg-[#3f8ceb] text-white text-[7.5px] font-bold shadow-2xs">
                          Pensyarah
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[7.5px] font-semibold">
                          Bilik
                        </span>
                      </div>
                    </div>

                    {/* Mini Sample Timetable Slots */}
                    <div className="space-y-1.5">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                        <div className="flex items-center justify-between text-[7.5px]">
                          <span className="font-bold text-slate-800">Waktu 3 (10:00 AM)</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">Kosong</span>
                        </div>
                        <div className="text-[8px] font-bold text-slate-900">BK 04 • Bilik Kuliah</div>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                        <div className="flex items-center justify-between text-[7.5px]">
                          <span className="font-bold text-slate-800">Waktu 4 (11:00 AM)</span>
                          <span className="px-1.5 py-0.2 rounded bg-sky-50 text-[#3f8ceb] font-bold">MK 02</span>
                        </div>
                        <div className="text-[8px] font-bold text-slate-900">Makmal Komputer (DTE)</div>
                      </div>
                    </div>
                  </div>

                  {/* iOS Home Indicator Bar */}
                  <div className="pb-2 pt-1 flex justify-center z-10">
                    <div className="w-24 h-1 bg-slate-900/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Safari Install Guide Modal */}
      {showIosModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowIosModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                  {/* Apple Logo SVG */}
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 170 170" aria-hidden="true">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.5-7.79-11.44-14.14-5.85-9.39-10.4-20.2-13.65-32.44-3.25-12.24-4.88-23.77-4.88-34.59 0-14.24 3.42-25.7 10.27-34.39 6.84-8.69 15.34-13.12 25.49-13.3 4.9.11 10.05 1.34 15.45 3.69 5.4 2.36 9.4 3.59 11.98 3.69 2.22 0 6.42-1.29 12.6-3.86 6.18-2.58 11.59-3.76 16.24-3.56 10.74.55 19.34 4.34 25.8 11.37-9.44 5.74-14.07 13.88-13.88 24.42.2 8.35 3.42 15.22 9.68 20.61 6.25 5.39 13.79 8.44 22.61 9.15-2.22 6.84-4.84 13.43-7.86 19.78zm-30.83-108.62c0-6.19 2.27-12.01 6.81-17.46 4.54-5.46 10.27-9.17 17.2-11.14.71 5.74-.75 11.52-4.38 17.34-3.63 5.82-9.28 9.53-16.95 11.14-.81.08-1.7.12-2.68.12z" />
                  </svg>
                  <span>Apple iOS Safari</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-950">
                  Pasang Pada iPhone & iPad
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sistem Apple iOS membolehkan anda menambah ikon aplikasi CARI KELAS terus ke skrin utama melalui 3 langkah mudah:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step-by-Step Guide */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Ketik Butang Kongsi (Share)</span>
                  <p className="text-slate-600 leading-relaxed">
                    Di bar menu bahagian bawah Safari, tekan ikon <strong>Kongsi (petak dengan anak panah ke atas)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Pilih &ldquo;Add to Home Screen&rdquo;</span>
                  <p className="text-slate-600 leading-relaxed">
                    Skrol ke bawah pada pilihan menu dan ketik <strong>&ldquo;Tambah ke Skrin Utama&rdquo; (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Tekan &ldquo;Tambah&rdquo; (Add)</span>
                  <p className="text-slate-600 leading-relaxed">
                    Tekan <strong>&ldquo;Add&rdquo;</strong> di sudut kanan atas skrin. Selesai! CARI KELAS kini terpasang sebagai aplikasi di skrin telefon anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Saya Fahami & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
