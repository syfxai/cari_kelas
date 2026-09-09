'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Jadual Pensyarah',
      href: '/teachers',
      description: 'Cari nama pensyarah untuk melihat jadual mengajar penuh Waktu 1 hingga Waktu 10 (Isnin – Jumaat).',
      tag: 'Langkah 1 • Semak Jadual',
      tagColor: 'bg-sky-50 text-[#3f8ceb]',
      highlights: [
        'Carian pantas 140+ pensyarah KPTM',
        'Paparan jadual mingguan Waktu 1–10',
        'Pautan terus ke Langkah 2 (Cari Kelas Ganti)',
      ],
      cta: 'Buka Jadual Pensyarah',
      featured: true,
    },
    {
      title: 'Cari Kelas Ganti',
      href: '/replacement',
      description: 'Pilih nama pensyarah dan kod kelas untuk menyemak jadual matriks mingguan 5 Hari × 10 Waktu & bilik kosong serentak.',
      tag: 'Langkah 2 • Penjana Pintar',
      tagColor: 'bg-sky-50 text-[#3f8ceb]',
      highlights: [
        'Kesan slot lapang tanpa pertembungan waktu',
        'Tapis makmal komputer & bilik fizikal serentak',
        '1-klik salin mesej lengkap untuk WhatsApp / Memo Pelajar',
      ],
      cta: 'Buka Carian Kelas Ganti',
      featured: true,
    },
    {
      title: 'Cari Bilik Kosong',
      href: '/rooms',
      description: 'Semak ketersediaan makmal komputer dan bilik kuliah fizikal mengikut Waktu 1 hingga Waktu 10 (Isnin – Jumaat).',
      tag: 'Waktu 1–10',
      tagColor: 'bg-emerald-50 text-emerald-700',
      highlights: [
        'Pilih tempoh masa (1 Jam, 2 Jam, Sesi Pagi/Petang)',
        'Tapis bilik fizikal & abaikan pautan online',
        'Salin nama bilik untuk tempahan segera',
      ],
      cta: 'Semak Bilik Kosong',
      featured: false,
    },
    {
      title: 'Jadual Kelas',
      href: '/classes',
      description: 'Semak jadual waktu subjek, kod pensyarah, dan lokasi bilik untuk setiap kumpulan kelas diploma.',
      tag: '80+ Kumpulan Kelas',
      tagColor: 'bg-slate-100 text-slate-800',
      highlights: [
        'Sokongan kelas DIA, DDM, DIM, DIT, DCW',
        'Paparan grid 10 waktu yang seragam',
        'Pintasan pantas kod kelas aktif',
      ],
      cta: 'Lihat Jadual Kelas',
      featured: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-8 sm:space-y-10">
      {/* Hero Header - Kekal 100% Seperti Pilihan Pengguna */}
      <div className="relative rounded-3xl bg-gradient-to-b from-white via-white to-sky-50/40 border border-slate-200/80 p-6 sm:p-10 shadow-sm overflow-hidden">
        {/* Subtle Background Glow Accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#3f8ceb]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#3f8ceb] animate-pulse" />
            <span>Sistem Cari Kelas Pintar • KPTM Ipoh</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Cari Kelas Ganti & Bilik Kosong{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f8ceb] via-sky-500 to-blue-600">
              Pantas & Tepat
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
            Semak slot waktu lapang pensyarah dan pelajar secara serentak dalam jadual matriks mingguan 5 Hari × 10 Waktu, lengkap dengan ketersediaan bilik fizikal.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/teachers"
              className="h-10 px-5 bg-gradient-to-r from-[#3f8ceb] to-[#2575dc] hover:from-[#3280e2] hover:to-[#1e66c6] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <span>1. Jadual Pensyarah</span>
              <span>→</span>
            </Link>
            <Link
              href="/replacement"
              className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>2. Cari Kelas Ganti</span>
            </Link>
            <Link
              href="/rooms"
              className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Semak Bilik Kosong</span>
            </Link>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 text-sm sm:text-base">10 Waktu</div>
            <div className="text-slate-500">08:00 AM – 06:00 PM</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 text-sm sm:text-base">5 Hari</div>
            <div className="text-slate-500">Isnin hingga Jumaat</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 text-sm sm:text-base">140+ Pensyarah</div>
            <div className="text-slate-500">KPTM Ipoh Aktif</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 text-sm sm:text-base">1-Klik Salin</div>
            <div className="text-slate-500">Format WhatsApp / Memo</div>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards Grid - Gaya Apple Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-white rounded-3xl p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${item.tagColor}`}>
                  {item.tag}
                </span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-[#3f8ceb] group-hover:translate-x-1 transition-all">
                  Buka →
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#3f8ceb] transition-colors">
                {item.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {item.description}
              </p>

              <ul className="space-y-2 pt-1 text-xs text-slate-600">
                {item.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3f8ceb] shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#3f8ceb] transition-colors">
              <span>{item.cta}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* System Status Footnote - Gaya Apple Minimal */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong className="text-slate-900 font-semibold">EduPage KPTM Ipoh:</strong> Data jadual waktu semester semasa diselaraskan secara langsung.
          </span>
        </div>
        <Link
          href="/replacement"
          className="text-xs font-bold text-[#3f8ceb] hover:underline shrink-0"
        >
          Terus ke Carian Kelas Ganti →
        </Link>
      </div>
    </div>
  );
}
