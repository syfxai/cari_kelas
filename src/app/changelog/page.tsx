'use client';

import React from 'react';
import Link from 'next/link';

interface ChangelogEntry {
  version: string;
  badge?: string;
  badgeColor?: string;
  date: string;
  title: string;
  summary: string;
  categories: {
    name: string;
    items: string[];
  }[];
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: 'v1.4.0',
    badge: 'Versi Terkini',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    date: 'Oktober 2026',
    title: 'Seni Bina Dwi-Semester, Penyelarasan Reka Letak PC & Borang Maklum Balas',
    summary:
      'Peningkatan menyeluruh pangkalan data dengan sokongan 2 semester berasingan (Semester Semasa & Semester Lepas), penjajaran grid PC yang seimbang, pemilih semester pantas, dan sistem tinjauan mesra pengguna.',
    categories: [
      {
        name: 'Pangkalan Data & Dwi-Semester',
        items: [
          'Pengenalan struktur arkib dwi-semester: data Semester Semasa (Aktif) dan Semester Lepas (Arkib Rujukan) disimpan berasingan tanpa risiko tertindih.',
          'Logik pintar kemas kini EduPage: pindaan jadual 2–3 kali dalam semester yang sama hanya menyegerak semester semasa tanpa memadamkan backup semester terdahulu.',
          'Butang Pemilih Semester & status kolej dipindahkan setempat ke halaman Jadual Pensyarah bersebelahan butang Kemaskini EduPage.',
          'Palang amaran moden (Dark Slate) apabila pengguna melihat data arkib semester lepas dengan butang 1-klik untuk kembali ke semester semasa.',
        ],
      },
      {
        name: 'Reka Letak & Antaramuka PC',
        items: [
          'Penyelarasan lebar bar navigasi atas (max-w-7xl) agar sejajar rapi dengan grid kad kandungan utama pada paparan komputer/PC.',
          'Susunan logo kompak baharu: Kapsyen "Cari kelas ganti dengan mudah" disusun rapi di bawah teks CARI KELAS tanpa mengganggu ketinggian header.',
          'Kemas kini kod kursus rasmi KPTM Ipoh: Penyeragaman 115 kumpulan kelas mengikut kod sebenar kolej (DTE, DIM, DDB, DDM, DIA, DGD).',
        ],
      },
      {
        name: 'Maklum Balas & UX Mesra Pengguna',
        items: [
          'Kad jemputan survey Google Form melayang (Floating Toast) di sudut bawah skrin bersama modal tinjauan interaktif terbina dalam aplikasi.',
          'Pencetus penggunaan sebenar (Post-Usage Trigger): hanya muncul selepas pengguna berjaya menyalin memo kelas ganti atau membuat 2 carian aktif.',
          'Variasi ayat bergilir yang mesra, catchy, dan menyentuh emosi penghargaan komuniti KPTM.',
          'Aturan penyejukan pintar (Snooze Cooldown 7 hari) dan pengesahan borang dihantar untuk mengelakkan gangguan.',
        ],
      },
      {
        name: 'Sokongan PWA (Progressive Web App)',
        items: [
          'Sokongan penuh PWA dengan Service Worker (sw.js) dan Web Manifest untuk pemasangan terus ke telefon pintar dan desktop.',
          'Butang "Pasang Aplikasi (PWA)" di Halaman Utama dengan pengesanan pintar sistem operasi.',
          'Panduan khas iOS Safari: Penyelesaian interaktif langkah demi langkah menambah ke Skrin Utama bagi pengguna iPhone & iPad.',
          'Pengesanan status pasang automatik (Standalone Mode) yang memaparkan lencana sedia terpasang.',
        ],
      },
      {
        name: 'Penambahbaikan Mudah Alih (Mobile Fixes)',
        items: [
          'Kotak semakan Mod Lanjutan dioptimumkan dengan maklum balas segera (0ms Instant Tick) pada telefon pintar tanpa perlu menunggu server.',
          'Seluruh baris kelas kini boleh disentuh (Full-row touch target) bagi mengelakkan ralat sentuhan pada pelayar mudah alih.',
          'Menu laci mudah alih (Burger Menu) kini berlabuh kekal di skrin (Fixed Viewport Overlay) supaya sentiasa kelihatan apabila ditekan semasa skrol.',
        ],
      },
    ],
  },
  {
    version: 'v1.3.0',
    badge: 'Penyegerakan Live',
    badgeColor: 'bg-sky-50 text-[#3f8ceb] border-sky-200/80',
    date: 'Oktober 2026',
    title: 'Penyegerakan Langsung EduPage & Sokongan Kelas Gabungan',
    summary:
      'Integrasi enjin penyegerak langsung dengan pelayan rasmi EduPage KPTM Ipoh dan penstrukturan semula paparan kod kelas gabungan.',
    categories: [
      {
        name: 'Penyegerak EduPage Rasmi',
        items: [
          'Enjin Live Scraper terbina dalam Next.js serverless API (/api/scrape) yang berhubung terus ke endpoint EduPage ttviewer.js & regulartt.js.',
          'Butang kemas kini data jadual langsung pada bila-bila masa dengan laporan jumlah slot yang berjaya dikesan.',
          'Sistem sandaran automatik (In-memory Fallback): menggunakan pangkalan data sedia ada secara automatik sekiranya sambungan ke EduPage terputus.',
        ],
      },
      {
        name: 'Paparan Kod Kelas & Lokasi',
        items: [
          'Susunan kod kelas bertitik menegak bagi kelas-kelas yang digabungkan dalam satu sesi mengajar yang sama.',
          'Lencana status lokasi diselaraskan ke baris tengah dengan ikon visual makmal, kuliah, dan sesi online.',
        ],
      },
    ],
  },
  {
    version: 'v1.2.0',
    badge: 'Penjana Pintar',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    date: 'September 2026',
    title: 'Mod Lanjutan Multi-Kelas & Enjin Bebas Konflik',
    summary:
      'Pengenalan perancang kelas ganti berbilang kelas secara serentak, algoritma pengesanan pertembungan jadual pintar, dan kawalan visual jadual.',
    categories: [
      {
        name: 'Perancang Multi-Kelas (Mod Lanjutan)',
        items: [
          'Keupayaan memilih 2, 3, atau lebih sesi kelas asal serentak untuk diselaraskan jadual gantinya dalam satu paparan.',
          'Algoritma pengagihan automatik pintar (Smart Auto-Distribution) yang memastikan tiada pertembungan waktu mengajar pensyarah mahupun kelas pelajar.',
          'Cadangan cip alternatif merentas hari (Isnin–Jumaat) dengan pemadanan automatik kategori bilik (makmal komputer vs bilik kuliah).',
          'Penjanaan memo rasmi gabungan 1-klik untuk disalin terus ke WhatsApp atau memo bercetak pelajar.',
        ],
      },
      {
        name: 'Interaktiviti & Visual Matriks',
        items: [
          'Butang kawalan paparan skrin jadual: Muat Skrin (Fit-to-Screen), skala 100%, dan 125%.',
          'Teks marquee bergerak secara automatik apabila kursor melayang (hover) pada nama subjek atau kod kelas yang panjang.',
          'Kesan bayang lembut 3D dan lencana durasi waktu pembelajaran (1 Jam, 2 Jam, Sesi Pagi/Petang).',
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    badge: 'Minimalis Moden',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200/80',
    date: 'Pertengahan September 2026',
    title: 'Transformasi Reka Bentuk Minimalis & Matriks Baharu',
    summary:
      'Penyusunan semula keseluruhan estetika antaramuka berpandukan Master Design Guidelines, sistem fon sans-serif moden, dan penamaan bilik rasmi KPTM Ipoh.',
    categories: [
      {
        name: 'Reka Bentuk Human-Crafted UI',
        items: [
          'Penyingkiran garisan sempadan tebal (anti-AI tropes) dan penggunaan bayang mikro halus berserta bucu melengkung 24px/32px.',
          'Palet warna tema tunggal yang koheren berlandaskan neutral slate mewah dan putih tulen.',
          'Penstrukturan semula susun atur jadual: Hari sebagai baris mendatar (Isnin–Jumaat) dan Waktu 1 hingga 10 sebagai lajur masa.',
        ],
      },
      {
        name: 'Piawaian Nama Bilik KPTM Ipoh',
        items: [
          'Penggantian nama placeholder dummy kepada kod rasmi KPTM Ipoh: Makmal Komputer (MK 1-01 hingga MK 3-12) dan Bilik Kuliah (BK 1-01 hingga BK 4-23).',
          'Penapis ketersediaan bilik kosong mengikut slot waktu 1 jam, 2 jam, atau sesi penuh pagi dan petang.',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    badge: 'Pelancaran Awal',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200/80',
    date: 'Awal September 2026',
    title: 'Pelancaran Awal Sistem CARI KELAS KPTM Ipoh',
    summary:
      'Kelahiran sistem carian kelas ganti dan semakan bilik kosong pintar untuk warga Kolej Poly-Tech MARA Ipoh oleh Muhammad Syafiq Haron.',
    categories: [
      {
        name: 'Ciri-Ciri Teras Asas',
        items: [
          'Pengurusan pangkalan data 140+ pensyarah, 80+ kumpulan kelas diploma (DIA, DDM, DIM, DIT, DCW), dan 178 bilik kuliah fizikal & makmal.',
          'Carian pantas jadual mingguan pensyarah mengikut nama.',
          'Enjin penyemak slot lapang automatik untuk kelas ganti.',
          'Peralihan seni bina kepada Native TypeScript Engine untuk kelajuan rendering ultra-pantas dan sedia dihoskan di Netlify & Vercel.',
        ],
      },
    ],
  },
];

export default function ChangelogPage(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 sm:space-y-10 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-b from-white via-white to-sky-50/40 border border-slate-200/80 p-6 sm:p-10 shadow-sm overflow-hidden">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[11px] font-bold text-[#3f8ceb]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3f8ceb]" />
            <span>Log Perubahan Rasmi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Changelog & Sejarah Pembangunan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Rekod lengkap setiap evolusi ciri baharu, penalaan antaramuka, pembaikan pepijat, dan penambahbaikan prestasi sistem <strong>CARI KELAS</strong> dari versi awal sehingga kini.
          </p>
        </div>

        {/* Quick Stats Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 text-left">
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Versi Terkini</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">v1.4.0</span>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Seni Bina</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">Dwi-Semester</span>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Reka Bentuk</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">Minimalis Moden</span>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Pembangun</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">Syafiq Haron</span>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-6 sm:space-y-8">
        {CHANGELOG_DATA.map((entry, index) => (
          <article
            key={entry.version}
            className="relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200"
          >
            {/* Version & Date Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight">
                  {entry.version}
                </span>
                {entry.badge && (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      entry.badgeColor || 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {entry.badge}
                  </span>
                )}
                {index === 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {entry.date}
              </span>
            </div>

            {/* Title & Summary */}
            <div className="pt-4 space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {entry.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {entry.summary}
              </p>
            </div>

            {/* Categorized Bullet Points */}
            <div className="mt-5 space-y-4">
              {entry.categories.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {cat.name}
                  </h3>
                  <ul className="space-y-1.5 pl-1">
                    {cat.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3f8ceb] shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Back to Home CTA Card */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold">Ada cadangan ciri baharu untuk sistem ini?</h3>
          <p className="text-xs text-slate-400">
            Kami sentiasa mengemas kini Cari Kelas demi kemudahan warga KPTM Ipoh.
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          Kembali ke Menu Utama →
        </Link>
      </div>
    </div>
  );
}
