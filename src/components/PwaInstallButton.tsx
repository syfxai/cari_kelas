'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function PwaInstallButton(): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  const checkInstallStatus = useCallback(() => {
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
      window.__deferredPwaPrompt = null;
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

    // C. If already installed or browser handled it
    if (isInstalled) {
      alert('Aplikasi CARI KELAS sedia terpasang pada peranti anda!');
    }
  };

  if (isInstalled) {
    return (
      <div className="h-10 px-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Aplikasi Terpasang ✓</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="h-10 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer group border border-slate-800 hover:border-slate-700"
      >
        <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#3f8ceb]/20 transition-colors">
          <svg className="w-3.5 h-3.5 text-[#3f8ceb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </span>
        <span>Pasang ke Telefon & PC</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* iOS Safari Install Guide Modal */}
      {showIosModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowIosModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                  <span>Apple iOS Safari</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-950">
                  Pasang Pada iPhone & iPad
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sistem Apple iOS memerlukan langkah mudah di bawah untuk menambah ikon terus ke skrin utama telefon anda:
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
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Ketik Butang Kongsi (Share)</span>
                  <p className="text-slate-600 leading-relaxed">
                    Di bar navigasi bahagian bawah pelayar Safari anda, tekan ikon <strong>Kongsi (petak dengan anak panah ke atas)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Pilih &ldquo;Add to Home Screen&rdquo;</span>
                  <p className="text-slate-600 leading-relaxed">
                    Skrol ke bawah pada menu tindakan dan ketik <strong>&ldquo;Tambah ke Skrin Utama&rdquo; (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 block">Tekan &ldquo;Tambah&rdquo; (Add)</span>
                  <p className="text-slate-600 leading-relaxed">
                    Tekan <strong>&ldquo;Add&rdquo;</strong> di sudut kanan atas. Selesai! CARI KELAS kini terpasang sebagai aplikasi di skrin telefon anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Saya Fahami & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
