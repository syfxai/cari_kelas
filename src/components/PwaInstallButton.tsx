'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallButton(): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showGenericModal, setShowGenericModal] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    // 3. Listen for Android / Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // A. If iOS, show iOS Safari step-by-step instructions
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    // B. If Android / Chromium with prompt ready
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch {
        setShowGenericModal(true);
      }
      return;
    }

    // C. Fallback for Desktop Chrome/Edge or other browsers
    setShowGenericModal(true);
  };

  return (
    <>
      <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all max-w-sm w-full space-y-3.5 group">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 p-1 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/icon.png"
              alt="Logo Cari Kelas"
              width={36}
              height={36}
              className="rounded-xl object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-950 tracking-tight">
                Pasang ke Skrin Utama
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug truncate">
              {isInstalled
                ? 'Aplikasi siap digunakan pada peranti anda'
                : 'Akses 1-ketukan tanpa perlu buka pelayar'}
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="w-full py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Aplikasi Sedia Terpasang ✓</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full h-10 px-4 bg-gradient-to-r from-[#3f8ceb] to-[#2575dc] hover:from-[#3280e2] hover:to-[#1e66c6] active:scale-[0.98] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Pasang Aplikasi Sekarang</span>
            </span>
            <span className="font-extrabold text-sm leading-none">→</span>
          </button>
        )}
      </div>

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
                  Sistem Apple iOS memerlukan langkah mudah di bawah untuk menambah ikon terus ke skrin utama:
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

      {/* Desktop / Generic Browser Install Guide Modal */}
      {showGenericModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowGenericModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-950">
                  Pemasangan Aplikasi Desktop / Android
                </h3>
                <p className="text-xs text-slate-500">
                  Panduan pemasangan aplikasi pada pelayar Chrome & Edge
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGenericModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
              <p>
                Untuk pelayar komputer (Chrome / Edge), anda boleh terus klik ikon <strong>Pasang Aplikasi (🖥️)</strong> yang terletak di bahagian kanan bar alamat URL pelayar anda.
              </p>
              <p className="text-slate-500 text-[11px]">
                Di telefon pintar Android, anda juga boleh menekan menu <strong>Tiga Titik (⋮)</strong> di sudut atas pelayar dan memilih <strong>&ldquo;Install App&rdquo; / &ldquo;Add to Home Screen&rdquo;</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGenericModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Faham
            </button>
          </div>
        </div>
      )}
    </>
  );
}
