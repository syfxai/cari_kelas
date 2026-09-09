'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import TimetableGrid from '@/components/TimetableGrid';
import ScrapeButton from '@/components/ScrapeButton';
import type { ClassData } from '@/lib/types';

const SAMPLE_POPULAR_CLASSES = [
  'DIA0301 (SEC 40)',
  'DDM0601 (SEC 19)',
  'DDM0602 (SEC 20)',
  'DIM0301 (SEC 34)',
  'DCW0401 (SEC 3)',
  'DIT0401 (SEC 46)',
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrapeNeeded, setScrapeNeeded] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (data.success) {
        setClasses(data.data);
        setScrapeNeeded(false);
      } else {
        setScrapeNeeded(true);
      }
    } catch {
      setScrapeNeeded(true);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleSearch = async (name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classes?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success) {
        setSelected(data.data);
      } else {
        setSelected(null);
        alert(data.message || 'Kelas tidak dijumpai');
      }
    } catch {
      alert('Ralat semasa mencari jadual kelas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#3f8ceb] animate-pulse" />
            <span>{classes.length} Kumpulan Kelas Diploma</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Jadual Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Pilih atau taip kod kelas untuk melihat jadual penuh Waktu 1 hingga Waktu 10 (Isnin – Jumaat).
          </p>
        </div>

        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="self-start sm:self-auto text-xs font-semibold text-slate-700 hover:text-slate-950 px-4 py-2 rounded-xl border border-slate-900 bg-transparent hover:bg-slate-900 hover:text-white hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            Padam Pilihan
          </button>
        )}
      </div>

      {scrapeNeeded ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto space-y-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
          <div className="text-slate-400 mb-2">
            <svg className="w-12 h-12 mx-auto stroke-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-950">Tiada Data Kelas</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data jadual belum dimuatkan. Sila lakukan scraping dari portal EduPage KPTM.
          </p>
          <div className="pt-2">
            <ScrapeButton onComplete={fetchClasses} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search & Quick Suggestions - Gaya Apple Minimal */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Cari Kod Kelas</label>
              <SearchBar
                placeholder="Taip kod kelas (cth: DIA0301, DDM0601, DIT0401)..."
                suggestions={classes.map(c => c.name)}
                onSearch={handleSearch}
                loading={loading}
              />
            </div>

            {/* Quick Sample Class Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 mr-1 text-xs font-medium">Contoh Kelas Aktif:</span>
              {SAMPLE_POPULAR_CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleSearch(cls)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selected?.name === cls
                      ? 'bg-slate-900 text-white shadow-sm scale-[1.02]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:scale-[1.02]'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Timetable Grid View */}
          {selected && (
            <div className="space-y-3">
              <TimetableGrid
                slots={selected.slots}
                title={`Jadual Kelas: ${selected.name}`}
                subtitle="Kolej Poly-Tech MARA Ipoh"
                viewType="class"
              />
              {selected.slots.length === 1 && selected.slots[0].subject.includes('Mentor Mentee') && (
                <div className="p-4 sm:p-5 bg-slate-50 text-slate-700 text-xs rounded-2xl flex items-start gap-3 shadow-2xs">
                  <span className="font-bold text-slate-900 shrink-0">Nota Kelas Semester 1:</span>
                  <span className="leading-relaxed">Kod kelas ini hanya mempunyai sesi Mentor Mentee dalam pangkalan data EduPage KPTM buat masa ini. Kelas senior (seperti DIA0301, DDM0601) mempunyai jadual subjek penuh.</span>
                </div>
              )}
            </div>
          )}

          {!selected && !loading && (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 space-y-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-bold text-slate-900">Pilih atau Taip Nama Kelas</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Pilih mana-mana kod kelas di atas atau gunakan kotak carian untuk melihat jadual mingguan mengikut Waktu 1 hingga Waktu 10.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
