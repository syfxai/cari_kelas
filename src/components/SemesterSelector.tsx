'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { SemesterInfo } from '@/lib/types';

interface SemesterSelectorProps {
  className?: string;
  onSemesterChange?: (semesterId: string) => void;
}

export default function SemesterSelector({
  className = '',
  onSemesterChange,
}: SemesterSelectorProps): React.ReactElement {
  const [semesters, setSemesters] = useState<SemesterInfo[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('current');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load of semesters and read saved preference
  useEffect(() => {
    let isMounted = true;

    const loadSemesters = async () => {
      try {
        const res = await fetch('/api/semesters');
        const data = await res.json();
        if (data.success && isMounted) {
          setSemesters(data.semesters || []);

          // Check cookie or localStorage preference
          const savedLocal = typeof window !== 'undefined' ? localStorage.getItem('kptm_semester') : null;
          const initial = savedLocal || data.activeSemester || 'current';
          setActiveSemesterId(initial);

          // Ensure cookie is in sync
          document.cookie = `kptm_semester=${encodeURIComponent(initial)}; path=/; max-age=31536000; SameSite=Lax`;
        }
      } catch (error) {
        console.error('Gagal memuat senarai semester:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSemesters();

    // Listen for custom external changes
    const handleSemesterEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ semester?: string }>;
      if (customEvt.detail?.semester) {
        setActiveSemesterId(customEvt.detail.semester);
      }
    };

    window.addEventListener('semester-changed', handleSemesterEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('semester-changed', handleSemesterEvent);
    };
  }, []);

  // 2. Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 3. Switch semester handler
  const handleSelectSemester = (id: string) => {
    if (id === activeSemesterId) {
      setIsOpen(false);
      return;
    }

    setActiveSemesterId(id);
    setIsOpen(false);

    // Save to localStorage & Cookie
    try {
      localStorage.setItem('kptm_semester', id);
      document.cookie = `kptm_semester=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }

    // Trigger global events so all components refresh
    window.dispatchEvent(new CustomEvent('semester-changed', { detail: { semester: id } }));
    window.dispatchEvent(new CustomEvent('timetable-updated', { detail: { semester: id } }));

    if (onSemesterChange) {
      onSemesterChange(id);
    }
  };

  const activeSemester = semesters.find(s => s.id === activeSemesterId) || semesters[0];
  const isCurrentActive = activeSemester?.id === 'current';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 transition-all duration-150 cursor-pointer shadow-2xs select-none"
        title="Pilih Semester / Sesi Pengajian"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Status Indicator Dot */}
        <span className="relative flex h-2 w-2">
          {isCurrentActive ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400" />
          )}
        </span>

        {/* Calendar Icon */}
        <svg
          className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {/* Semester Text */}
        <span className="max-w-[130px] sm:max-w-[180px] truncate text-slate-800">
          {activeSemester?.shortName || (isCurrentActive ? 'Sem Semasa' : 'Sem Lepas')}
        </span>

        {/* Archive tag if previous */}
        {!isCurrentActive && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
            Arkib
          </span>
        )}

        {/* Chevron Icon */}
        <svg
          className={`w-3 h-3 transition-transform duration-200 text-slate-400 group-hover:text-slate-600 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pilihan Semester KPTM
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
              2 Semester Tersimpan
            </span>
          </div>

          <div className="p-1.5 space-y-1">
            {semesters.map((sem) => {
              const isSelected = sem.id === activeSemesterId;
              const isCurrent = sem.id === 'current';

              return (
                <button
                  key={sem.id}
                  type="button"
                  onClick={() => handleSelectSemester(sem.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100/80 text-slate-950 border border-slate-200'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  {/* Indicator Icon */}
                  <div className="mt-0.5">
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-900 text-white">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>

                  {/* Semester Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {sem.session} ({sem.academicYear})
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                          Arkib
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {sem.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>Versi: {sem.version}</span>
                      <span>•</span>
                      <span>
                        {new Date(sem.updatedAt).toLocaleDateString('ms-MY', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info Notice */}
          <div className="px-3 py-2 bg-slate-50/80 border-t border-slate-100 text-[10px] text-slate-500 rounded-b-2xl">
            💡 Pertukaran semester akan memaparkan jadual pensyarah, bilik dan kelas bagi sesi yang dipilih secara automatik.
          </div>
        </div>
      )}
    </div>
  );
}
