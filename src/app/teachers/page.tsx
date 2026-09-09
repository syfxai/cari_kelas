'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TimetableGrid from '@/components/TimetableGrid';
import type { TeacherData } from '@/lib/types';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<string[]>([]);
  const [selected, setSelected] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrapingTeacher, setScrapingTeacher] = useState('');

  // Auto-fetch teacher list on load
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scrape/teachers');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setTeachers(data.data);
        setScrapeMsg('');
      } else {
        await doScrape();
      }
    } catch {
      setScrapeMsg('Gagal mengambil data. Sila klik butang Cari untuk cuba semula.');
    } finally {
      setLoading(false);
    }
  };

  const doScrape = async () => {
    setScraping(true);
    setScrapeMsg('Sedang mencari dan mengemas kini senarai pensyarah...');
    try {
      const res = await fetch('/api/scrape/teachers', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTeachers(data.data);
        setScrapeMsg(`${data.data.length} pensyarah berjaya dimuatkan.`);
      } else {
        setScrapeMsg(data.message || 'Carian gagal.');
      }
    } catch {
      setScrapeMsg('Ralat semasa mencari senarai pensyarah.');
    } finally {
      setScraping(false);
    }
  };

  const handleSelectTeacher = async (name: string) => {
    setSearchQuery('');
    setScrapingTeacher(name);
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/teachers?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
      } else {
        alert(data.message || 'Jadual tidak dijumpai');
      }
    } catch {
      alert('Ralat semasa mengambil jadual');
    } finally {
      setLoading(false);
      setScrapingTeacher('');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#3f8ceb] animate-pulse" />
            <span>{teachers.length} Pensyarah KPTM Ipoh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Jadual Pensyarah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Pilih nama pensyarah untuk melihat jadual mengajar penuh Waktu 1 hingga Waktu 10 (Isnin – Jumaat).
          </p>
        </div>
      </div>

      {/* Scraping Status Banner */}
      {scrapeMsg && (
        <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] text-xs font-medium text-slate-700 flex items-center gap-2.5">
          {scraping ? (
            <svg className="animate-spin h-4 w-4 text-[#3f8ceb] shrink-0" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          )}
          <span>{scrapeMsg}</span>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama pensyarah..."
            className="w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm bg-white rounded-xl text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3f8ceb] transition-all"
          />
          {searchQuery && filteredTeachers.length > 0 && !selected && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 border border-slate-100">
              {filteredTeachers.map((name, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectTeacher(name)}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#3f8ceb] rounded-xl transition-colors cursor-pointer"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={doScrape}
          disabled={scraping}
          className="h-10 px-5 bg-[#3f8ceb] hover:bg-[#3280e2] text-white rounded-xl font-semibold text-xs disabled:opacity-50 transition-all flex items-center gap-2 shrink-0 shadow-sm hover:scale-[1.02] cursor-pointer"
        >
          {scraping ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Mencari...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Cari Pensyarah</span>
            </>
          )}
        </button>
      </div>

      {/* Teacher List Grid - Gaya Apple Minimal */}
      {teachers.length > 0 && !selected && !scrapingTeacher && (
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-950">
              Senarai Semua Pensyarah
            </h2>
            <span className="text-xs font-semibold text-[#3f8ceb] bg-sky-50 px-3 py-1 rounded-full">
              {filteredTeachers.length} rekod
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTeachers.map((name, i) => (
              <button
                key={i}
                onClick={() => handleSelectTeacher(name)}
                disabled={loading}
                className="group text-left p-4 bg-white hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.01] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] rounded-2xl transition-all duration-200 flex items-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#3f8ceb] transition-colors">
                  {getInitials(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#3f8ceb] truncate transition-colors">
                    {name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    KPTM Ipoh
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scraping Individual Teacher Schedule State */}
      {scrapingTeacher && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-3">
          <svg className="animate-spin h-7 w-7 mx-auto text-[#3f8ceb]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-base font-bold text-slate-950">Sedang memuat jadual untuk {scrapingTeacher}...</p>
          <p className="text-xs text-slate-400">Sila tunggu sebentar.</p>
        </div>
      )}

      {/* Selected Teacher Timetable */}
      {selected && !scrapingTeacher && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSelected(null)}
              className="h-10 px-4 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>← Kembali ke Senarai Pensyarah</span>
            </button>

            <Link
              href={`/replacement?teacher=${encodeURIComponent(selected.name)}`}
              className="h-10 px-5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Langkah 2: Cari Kelas Ganti untuk {selected.name}</span>
              <span>→</span>
            </Link>
          </div>
          <TimetableGrid slots={selected.slots} title={`Jadual Mengajar: ${selected.name}`} />
        </div>
      )}

      {/* Initial Loading */}
      {loading && !scraping && !scrapingTeacher && (
        <div className="bg-white rounded-3xl p-10 text-center text-xs text-slate-500 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
          <svg className="animate-spin h-7 w-7 mx-auto mb-3 text-[#3f8ceb]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memuatkan data pensyarah...
        </div>
      )}
    </div>
  );
}
