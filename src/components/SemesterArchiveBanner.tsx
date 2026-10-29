'use client';

import React, { useState, useEffect } from 'react';
import type { SemesterInfo } from '@/lib/types';

export default function SemesterArchiveBanner(): React.ReactElement | null {
  const [activeSemesterId, setActiveSemesterId] = useState<string>('current');
  const [semesterMeta, setSemesterMeta] = useState<SemesterInfo | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkSemester = async () => {
      try {
        const res = await fetch('/api/semesters');
        const data = await res.json();
        if (data.success && isMounted) {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('kptm_semester') : null;
          const currentId = saved || data.activeSemester || 'current';
          setActiveSemesterId(currentId);
          setDismissed(false);

          const found = (data.semesters as SemesterInfo[])?.find(s => s.id === currentId);
          setSemesterMeta(found || null);
        }
      } catch {
        // Ignore
      }
    };

    checkSemester();

    const handleSemesterChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ semester?: string }>;
      const id = customEvt.detail?.semester || 'current';
      setActiveSemesterId(id);
      setDismissed(false);
      checkSemester();
    };

    window.addEventListener('semester-changed', handleSemesterChange);

    return () => {
      isMounted = false;
      window.removeEventListener('semester-changed', handleSemesterChange);
    };
  }, []);

  const handleSwitchToCurrent = () => {
    try {
      localStorage.setItem('kptm_semester', 'current');
      document.cookie = 'kptm_semester=current; path=/; max-age=31536000; SameSite=Lax';
    } catch {
      // Ignore
    }
    setActiveSemesterId('current');
    window.dispatchEvent(new CustomEvent('semester-changed', { detail: { semester: 'current' } }));
    window.dispatchEvent(new CustomEvent('timetable-updated', { detail: { semester: 'current' } }));
  };

  if (activeSemesterId === 'current' || dismissed) {
    return null;
  }

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-slate-800 px-4 py-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 print:hidden shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white bg-white/15 px-2 py-0.5 rounded-md text-[10px] tracking-wider uppercase">
              Arkib
            </span>
            <span>
              Anda sedang melihat jadual rujukan <strong className="text-white">{semesterMeta?.name || 'Semester Lepas'}</strong>.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleSwitchToCurrent}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Kembali ke Semester Semasa
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Makluman"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
