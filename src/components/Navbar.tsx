'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Utama' },
  { href: '/teachers', label: 'Pensyarah' },
  { href: '/classes', label: 'Kelas' },
  { href: '/rooms', label: 'Bilik Kosong' },
  { href: '/replacement', label: 'Kelas Ganti' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncToast('Jadual EduPage berjaya dikemas kini!');
        window.dispatchEvent(new CustomEvent('timetable-updated', { detail: data }));
      } else {
        setSyncToast(data.message || 'Gagal mengemas kini jadual.');
      }
    } catch {
      setSyncToast('Ralat semasa berhubung ke EduPage.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncToast(null), 3500);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="Logo Cari Kelas"
              width={28}
              height={28}
              className="w-7 h-7 rounded-xl object-cover shadow-2xs"
            />
            <span className="text-sm font-extrabold text-slate-950 tracking-tight">
              CARI KELAS
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              title="Kemas kini jadual waktu terus daripada EduPage KPTM Ipoh"
              className="h-9 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-[#3f8ceb] hover:text-[#2575dc] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <svg
                className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">
                {syncing ? 'Menyegerak...' : 'Kemaskini EduPage'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}
    </nav>
  );
}
