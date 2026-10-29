'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';

const GOOGLE_FORM_EMBED_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf2JHwFv-NR4HhlZ3fswma5XLrUmq99ue_QEKde43mQe_IJVQ/viewform?embedded=true';

const STORAGE_KEYS = {
  COMPLETED: 'kptm_survey_completed_v1',
  SNOOZE_UNTIL: 'kptm_survey_snooze_until_v1',
  INTERACTION_COUNT: 'kptm_survey_interaction_count',
} as const;

// 7 hari cooldown jika pengguna klik "Nanti Dulu"
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface SurveyMessage {
  tag: string;
  tagColor: string;
  headline: string;
  body: string;
}

export default function SurveyToast(): React.ReactElement | null {
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number>(0);

  // Mesej bergilir yang mesra dan menyentuh emosi ikhlas
  const messages: SurveyMessage[] = useMemo(
    () => [
      {
        tag: 'Kongsi Kebaikan ❤️',
        tagColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
        headline: 'Sistem ini membantu memudahkan urusan anda hari ini?',
        body: 'Jika sistem ini menyenangkan urusan anda, kami ingin minta bantuan kecil anda pula untuk menjawab survey ringkas ini. Maklum balas anda sangat bermakna agar kami dapat sediakan sistem ini dengan jauh lebih baik buat seluruh warga KPTM.',
      },
      {
        tag: 'Alhamdulillah ✨',
        tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        headline: 'Alhamdulillah, satu urusan kelas anda selesai!',
        body: 'Jika Cari Kelas berjaya jimatkan masa anda, sudi luangkan 1 minit untuk bantu kami kembali? Pendapat jujur anda adalah nadi utama untuk kami perbaiki dan tambah baik ciri-ciri akan datang.',
      },
      {
        tag: 'Demi Warga KPTM 🎓',
        tagColor: 'bg-sky-50 text-sky-800 border-sky-200/80',
        headline: 'Satu minit anda, seribu makna buat pembangunan sistem ini.',
        body: 'Sistem ini dibina khas untuk memudahkan pensyarah dan pelajar KPTM. Bantu kami menilai kualiti sistem ini melalui survey 1 minit supaya pengalaman anda pada masa hadapan sentiasa lancar!',
      },
    ],
    []
  );

  const checkEligibility = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    // 1. Jika pengguna dah sahkan selesai, abaikan selamanya
    const isDone = localStorage.getItem(STORAGE_KEYS.COMPLETED) === 'true';
    if (isDone) return false;

    // 2. Jika dalam tempoh snooze (7 hari), abaikan
    const snoozeUntil = localStorage.getItem(STORAGE_KEYS.SNOOZE_UNTIL);
    if (snoozeUntil && Date.now() < parseInt(snoozeUntil, 10)) {
      return false;
    }

    return true;
  }, []);

  const triggerToast = useCallback(
    (reason: string) => {
      if (!checkEligibility() || isModalOpen) return;

      const randomIndex = Math.floor(Math.random() * messages.length);
      setActiveMessageIndex(randomIndex);

      setTimeout(() => {
        setIsToastVisible(true);
      }, reason === 'immediate' ? 400 : 1800);
    },
    [checkEligibility, isModalOpen, messages.length]
  );

  useEffect(() => {
    if (!checkEligibility()) return;

    // A. Dengar peristiwa kejayaan penggunaan (cth: Salin format memo kelas ganti)
    const handleUsageSuccess = () => {
      triggerToast('usage_success');
    };

    window.addEventListener('kptm-usage-success', handleUsageSuccess);

    // B. Kira interaksi pengguna (cth: Carian pensyarah, carian kelas)
    const handleUserInteraction = () => {
      try {
        const count = parseInt(localStorage.getItem(STORAGE_KEYS.INTERACTION_COUNT) || '0', 10) + 1;
        localStorage.setItem(STORAGE_KEYS.INTERACTION_COUNT, count.toString());

        if (count >= 2) {
          triggerToast('interaction_threshold');
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('kptm-user-interacted', handleUserInteraction);

    // C. Pemasa lembut selepas 35 saat
    const gentleTimer = setTimeout(() => {
      triggerToast('time_elapsed');
    }, 35000);

    return () => {
      window.removeEventListener('kptm-usage-success', handleUsageSuccess);
      window.removeEventListener('kptm-user-interacted', handleUserInteraction);
      clearTimeout(gentleTimer);
    };
  }, [checkEligibility, triggerToast]);

  // Buka Modal Embed Survey Dalam Aplikasi
  const handleOpenModal = () => {
    setIsToastVisible(false);
    setIframeLoading(true);
    setIsModalOpen(true);
  };

  // Pengguna klik "Nanti Dulu" atau Pangkah di Toast (Snooze 7 hari)
  const handleSnooze = () => {
    try {
      const snoozeExpiry = Date.now() + SNOOZE_DURATION_MS;
      localStorage.setItem(STORAGE_KEYS.SNOOZE_UNTIL, snoozeExpiry.toString());
    } catch {
      // Ignore
    }
    setIsToastVisible(false);
  };

  // Pengguna tutup Modal tanpa submit (Snooze 3 hari)
  const handleCloseModal = () => {
    try {
      const snoozeExpiry = Date.now() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEYS.SNOOZE_UNTIL, snoozeExpiry.toString());
    } catch {
      // Ignore
    }
    setIsModalOpen(false);
  };

  // Pengguna sahkan sudah hantar borang di dalam modal
  const handleConfirmSubmitted = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED, 'true');
    } catch {
      // Ignore
    }
    setHasCompleted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setHasCompleted(false);
    }, 2500);
  };

  const currentMsg = messages[activeMessageIndex];

  return (
    <>
      {/* 1. KAD MELAYANG (FLOATING TOAST) - Sudut Bawah Skrin */}
      {isToastVisible && !isModalOpen && (
        <aside
          aria-label="Survey maklum balas sistem"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden"
        >
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xl p-5 sm:p-6 text-slate-800 ring-1 ring-slate-900/5">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3f8ceb] via-indigo-500 to-rose-400" />

            {/* Close Button (X) */}
            <button
              type="button"
              onClick={handleSnooze}
              className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup survey"
              title="Tutup (Nanti Dulu)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Tag Badge */}
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide uppercase ${currentMsg.tagColor}`}
              >
                {currentMsg.tag}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Borang Maklum Balas</span>
            </div>

            {/* Headline */}
            <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug tracking-tight">
              {currentMsg.headline}
            </h3>

            {/* Heartfelt Body Text */}
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {currentMsg.body}
            </p>

            {/* Action Buttons: TEKNIK 1 (Hanya Buka Survey & Nanti Dulu) */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenModal}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3f8ceb] hover:bg-[#3280e2] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Bantu Jawab Survey (1 Minit)</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleSnooze}
                className="px-3.5 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors text-center cursor-pointer"
              >
                Nanti Dulu
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. TEKNIK 3: MODAL EMBED GOOGLE FORM TERUS DALAM APLIKASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/icon.png"
                  alt="Logo Cari Kelas"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">
                    Maklum Balas CARI KELAS KPTM
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hanya beberapa soalan ringkas (kurang 1 minit).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup modal"
                title="Tutup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Embedded Google Form Iframe */}
            <div className="relative flex-1 overflow-y-auto bg-slate-50 min-h-[480px]">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 z-10">
                  <svg className="animate-spin h-6 w-6 text-[#3f8ceb]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-xs text-slate-500 font-medium">Memuatkan borang survey...</span>
                </div>
              )}

              <iframe
                src={GOOGLE_FORM_EMBED_URL}
                onLoad={() => setIframeLoading(false)}
                title="Borang Survey KPTM"
                className="w-full h-[60vh] sm:h-[65vh] border-0"
              />
            </div>

            {/* Modal Bottom Bar: Sahkan Hantar */}
            <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
              <div className="text-[11px] text-slate-500 text-center sm:text-left">
                💡 Setelah menekan butang <strong>Submit</strong> di dalam borang di atas, klik butang sahkan ini:
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleConfirmSubmitted}
                  disabled={hasCompleted}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {hasCompleted ? (
                    <>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Terima Kasih Banyak! ❤️</span>
                    </>
                  ) : (
                    <>
                      <span>Saya Dah Selesai Hantar Borang</span>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
