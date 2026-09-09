'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Cari Kelas Ganti',
      href: '/replacement',
      description: 'Pilih nama pensyarah dan kod kelas untuk menyemak jadual matriks mingguan 5 Hari × 10 Waktu secara automatik.',
      tag: 'Ciri Utama',
      tagColor: 'bg-[#00A3FF]/10 text-[#00A3FF] border-[#00A3FF]/20',
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
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      highlights: [
        'Pilih tempoh masa (1 Jam, 2 Jam, Sesi Pagi/Petang)',
        'Tapis bilik fizikal & abaikan pautan online',
        'Salin nama bilik untuk tempahan segera',
      ],
      cta: 'Semak Bilik Kosong',
      featured: false,
    },
    {
      title: 'Jadual Pensyarah',
      href: '/teachers',
      description: 'Lihat jadual mengajar penuh bagi 140+ pensyarah KPTM Ipoh mengikut hari dan waktu pembelajaran.',
      tag: '140+ Pensyarah',
      tagColor: 'bg-sky-50 text-sky-700 border-sky-100',
      highlights: [
        'Carian pantas nama pensyarah',
        'Paparan jadual mingguan Waktu 1–10',
        'Kemas kini terus dari EduPage KPTM',
      ],
      cta: 'Lihat Jadual Pensyarah',
      featured: false,
    },
    {
      title: 'Jadual Kelas',
      href: '/classes',
      description: 'Semak jadual waktu subjek, kod pensyarah, dan lokasi bilik untuk setiap kumpulan kelas diploma.',
      tag: '80+ Kumpulan Kelas',
      tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
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
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-b from-white via-white to-sky-50/40 border border-slate-200/80 p-6 sm:p-10 shadow-sm overflow-hidden">
        {/* Subtle Background Glow Accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#00A3FF] animate-pulse" />
            <span>Sistem Cari Kelas Pintar • KPTM Ipoh</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Cari Kelas Ganti & Bilik Kosong{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A3FF] via-sky-500 to-blue-600">
              Pantas & Tepat
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
            Semak slot waktu lapang pensyarah dan pelajar secara serentak dalam jadual matriks mingguan 5 Hari × 10 Waktu, lengkap dengan ketersediaan bilik fizikal.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/replacement"
              className="h-10 px-5 bg-gradient-to-r from-[#00A3FF] to-[#0084FF] hover:from-[#0092e6] hover:to-[#0074e6] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <span>Mula Cari Kelas Ganti</span>
              <span>→</span>
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

      {/* Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`group rounded-2xl border p-6 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              item.featured
                ? 'bg-white border-[#00A3FF]/40 shadow-md shadow-sky-500/5 hover:border-[#00A3FF] hover:shadow-lg hover:shadow-sky-500/10'
                : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.tagColor}`}>
                  {item.tag}
                </span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-[#00A3FF] group-hover:translate-x-1 transition-all">
                  Buka →
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#00A3FF] transition-colors">
                {item.title}
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>

              <ul className="space-y-1.5 pt-1 text-xs text-slate-600">
                {item.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF] shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#00A3FF] transition-colors">
              <span>{item.cta}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* System Status Footnote */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong className="text-slate-800">EduPage KPTM Ipoh:</strong> Data jadual waktu semester semasa diselaraskan secara langsung.
          </span>
        </div>
        <Link
          href="/replacement"
          className="text-xs font-bold text-[#00A3FF] hover:underline shrink-0"
        >
          Terus ke Carian Kelas Ganti →
        </Link>
      </div>
    </div>
  );
}

