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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Jadual Pensyarah</span>
            <span className="text-xs font-mono font-semibold text-[#00A3FF] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
              {teachers.length} Pensyarah
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pilih nama pensyarah untuk melihat jadual mengajar penuh Waktu 1 hingga Waktu 10 (Isnin – Jumaat).
          </p>
        </div>
      </div>

      {/* Scraping Status Banner */}
      {scrapeMsg && (
        <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs flex items-center gap-2">
          {scraping ? (
            <svg className="animate-spin h-3.5 w-3.5 text-[#00A3FF] shrink-0" viewBox="0 0 24 24">
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
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama pensyarah..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] focus:border-[#00A3FF] transition-all"
          />
          {searchQuery && filteredTeachers.length > 0 && !selected && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto p-1">
              {filteredTeachers.map((name, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectTeacher(name)}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-[#00A3FF] rounded transition-colors cursor-pointer"
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
          className="h-9 px-4 bg-[#00A3FF] hover:bg-[#008fe0] text-white rounded-lg font-medium text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
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
              <span>Cari</span>
            </>
          )}
        </button>
      </div>

      {/* Teacher List Grid */}
      {teachers.length > 0 && !selected && !scrapingTeacher && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Senarai Semua Pensyarah
            </h2>
            <span className="text-xs font-mono font-medium text-[#00A3FF] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
              {filteredTeachers.length} rekod
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredTeachers.map((name, i) => (
              <button
                key={i}
                onClick={() => handleSelectTeacher(name)}
                disabled={loading}
                className="group text-left p-3 bg-slate-50 hover:bg-white hover:border-[#00A3FF] hover:shadow-xs border border-slate-200 rounded-lg transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-md bg-[#00A3FF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {getInitials(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-[#00A3FF] truncate transition-colors">
                    {name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
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
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-2xs space-y-2">
          <svg className="animate-spin h-6 w-6 mx-auto text-[#00A3FF]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-semibold text-slate-900">Sedang memuat jadual untuk {scrapingTeacher}...</p>
          <p className="text-xs text-slate-400">Sila tunggu sebentar.</p>
        </div>
      )}

      {/* Selected Teacher Timetable */}
      {selected && !scrapingTeacher && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSelected(null)}
              className="h-8 px-3 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Kembali ke Senarai Pensyarah</span>
            </button>

            <Link
              href={`/replacement?teacher=${encodeURIComponent(selected.name)}`}
              className="h-8 px-4 bg-gradient-to-r from-[#00A3FF] to-[#0084FF] hover:from-[#0092e6] hover:to-[#0074e6] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
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
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500 shadow-2xs">
          <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-[#00A3FF]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memuatkan data pensyarah...
        </div>
      )}
    </div>
  );
}

