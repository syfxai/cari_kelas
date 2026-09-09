'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TestStylesPage() {
  const [activeTab, setActiveTab] = useState<'apple' | 'hybrid' | 'a' | 'b' | 'c' | 'compare' | 'guidelines'>('apple');
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [themeColor, setThemeColor] = useState<string>('#3f8ceb'); // Default color requested: #3f8ceb

  const colorPresets = [
    { name: 'Azure Blue (Ujian Semasa)', hex: '#3f8ceb' },
    { name: 'Electric Sky (Asal)', hex: '#00A3FF' },
    { name: 'Emerald Forest', hex: '#10B981' },
    { name: 'Royal Indigo', hex: '#6366F1' },
    { name: 'Crimson Rose', hex: '#F43F5E' },
    { name: 'Slate Dark', hex: '#0F172A' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Test Page Top Banner */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
            <span>Makmal Ujian Gaya UI Tempatan (Local Only)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ujian Semua Gaya Reka Bentuk UI
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Warna tema semasa diuji: <span className="font-bold text-white font-mono px-2 py-0.5 rounded bg-white/10">{themeColor}</span> (Nota: Warna tema hanyalah pemboleh ubah <em>variable</em>).
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/10 rounded-2xl">
          {[
            { id: 'apple', label: '🍎 Gaya Apple Minimal' },
            { id: 'hybrid', label: '✨ Hybrid A+B' },
            { id: 'a', label: 'Gaya A (Borderless)' },
            { id: 'b', label: 'Gaya B (Subtle Border)' },
            { id: 'c', label: 'Gaya C (Flat Tone)' },
            { id: 'compare', label: 'Banding Semua' },
            { id: 'guidelines', label: '📋 Nota Blueprint Guidelines' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-950 shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Theme Color Switcher Bar */}
      <div className="p-5 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Uji Tukar Warna Tema (Single-Accent Variable):</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              Nota: AI boleh guna sebarang kod HEX
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Klik palet pratetap atau masukkan kod HEX tersuai untuk melihat bagaimana keseluruhan UI menyesuaikan diri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {colorPresets.map(preset => (
            <button
              key={preset.hex}
              onClick={() => setThemeColor(preset.hex)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                themeColor.toLowerCase() === preset.hex.toLowerCase()
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs scale-[1.03]'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
              <span>{preset.name}</span>
            </button>
          ))}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <input
              type="color"
              value={themeColor}
              onChange={e => setThemeColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
              title="Pilih warna bebas"
            />
            <span className="text-xs font-mono font-bold text-slate-700 uppercase">{themeColor}</span>
          </div>
        </div>
      </div>

      {/* ================= 1. GAYA APPLE MINIMAL ================= */}
      {activeTab === 'apple' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header Concept */}
          <div className="p-6 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide">
                🍎 GAYA APPLE MINIMAL (PILIHAN UTAMA)
              </span>
              <span className="text-xs font-bold text-slate-900">
                1 Warna Tema ({themeColor}) • Hover Enlarge • Outline 1px Halus Bertukar Fill
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ciri khas Apple: Kad putih bersih tanpa garisan kelabu. Ketebalan outline ialah <strong>1px (1 mata)</strong> yang amat halus. Sel lapang menggunakan <strong>outline 1px warna tema</strong> tanpa fill, bila dihover/dipilih bertukar menjadi <strong>fill padat</strong> dengan animasi membesar lembut.
            </p>
          </div>

          {/* 1. Hero & Typography */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.008] transition-all duration-300 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <span>Sistem Cari Kelas Pintar • KPTM Ipoh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Cari Kelas Ganti & Bilik Kosong{' '}
              <span style={{ color: themeColor }}>Pantas & Tepat</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
              Semak slot waktu lapang pensyarah dan pelajar secara serentak mengikut jadual 10 waktu tanpa sebarang pertembungan masa.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                style={{ backgroundColor: themeColor }}
                className="h-10 px-5 text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer"
              >
                1. Jadual Pensyarah →
              </button>
              <button className="h-10 px-4 bg-transparent border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-semibold hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                2. Cari Kelas Ganti
              </button>
              <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:scale-[1.02] transition-all cursor-pointer">
                Semak Bilik Kosong
              </button>
            </div>
          </div>

          {/* 2. Form Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-950">Pilih Slot Kelas Asal</h3>
              <span className="text-xs font-medium text-slate-400">Langkah 1 daripada 2</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">1. Nama Pensyarah</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2" style={{ outlineColor: themeColor }}>
                  <option>TS. DR. AZMI BIN AHMAD</option>
                  <option>NOR AZLINA BINTI MOHD</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">2. Kelas yang Diajar</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2">
                  <option>DDM0601 (SEC 19)</option>
                  <option>DIA0301 (SEC 40)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">3. Sesi Asal Diganti</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2">
                  <option>Isnin, 8:00 AM – 10:00 AM (2 Jam)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Matrix Cells Apple Style (1px Outline to Fill) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-base font-bold text-slate-950">Pratonton Sel Jadual Matriks (Gaya Apple 1px Outline)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
              {[1, 2].map(slotNum => {
                const isSelected = selectedSlot === slotNum;
                return (
                  <button
                    key={slotNum}
                    onClick={() => setSelectedSlot(slotNum)}
                    style={
                      isSelected
                        ? { backgroundColor: themeColor, borderColor: themeColor }
                        : { borderColor: themeColor, color: themeColor }
                    }
                    className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer text-center space-y-1.5 border ${
                      isSelected
                        ? 'text-white shadow-lg scale-[1.02]'
                        : 'bg-white hover:scale-[1.01] shadow-2xs group'
                    }`}
                  >
                    <div className="text-xs font-extrabold tracking-wide flex items-center justify-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : ''}`}
                        style={!isSelected ? { backgroundColor: themeColor } : {}}
                      />
                      <span className={isSelected ? 'text-white' : ''} style={!isSelected ? { color: themeColor } : {}}>
                        {isSelected ? 'DIPILIH' : `LAPANG (Slot ${slotNum})`}
                      </span>
                    </div>
                    <div
                      className={`text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-50'
                      }`}
                      style={!isSelected ? { color: themeColor } : {}}
                    >
                      38 bilik fizikal
                    </div>
                  </button>
                );
              })}

              <div className="rounded-2xl p-4 bg-slate-950 text-white shadow-xs space-y-1 text-center flex flex-col justify-center">
                <div className="text-xs font-bold text-white">Slot Asal</div>
                <div className="text-[11px] font-medium text-slate-400">Diganti</div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-50 text-slate-400 space-y-1 text-center flex flex-col justify-center opacity-70">
                <div className="text-xs font-semibold text-slate-600 truncate">Kelas Pelajar</div>
                <div className="text-[11px] text-slate-400 truncate">Bertembung</div>
              </div>
            </div>
          </div>

          {/* 4. Room Availability Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-base font-bold text-slate-950">Pratonton Senarai Bilik Kosong</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-950">MAKMAL KOMPUTER 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 40 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-950">MAKMAL KOMPUTER 2-03</h4>
                <p className="text-xs text-slate-500">Aras 3 • Muatan 35 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Bilik Kuliah</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-950">BILIK KULIAH 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 50 Pelajar</p>
              </div>
            </div>
          </div>

          {/* 5. Notes / Alert Section */}
          <div className="p-5 bg-slate-50 rounded-2xl shadow-2xs flex items-start gap-3">
            <span className="text-base">💡</span>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="font-semibold text-slate-900">Petua Apple Minimal:</strong> Latar belakang kelabu lembut (`bg-slate-50`) tanpa border menyerlahkan teks secara semula jadi tanpa mengganggu pandangan mata pengguna.
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. GAYA HYBRID A+B ================= */}
      {activeTab === 'hybrid' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header Concept */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wide border border-slate-200">
                ✨ GAYA HYBRID A+B (MICRO-BORDER + SOFT SHADOW)
              </span>
              <span className="text-xs font-bold text-slate-900">
                Keseimbangan Struktur Halus & Estetika Moden
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Menggabungkan kebersihan kad tanpa garisan tebal dengan garisan sempadan mikro (`border-slate-100`) untuk panduan mata yang jelas dan kemas.
            </p>
          </div>

          {/* 1. Hero & Typography */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-200 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <span>Sistem Cari Kelas Pintar • KPTM Ipoh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Cari Kelas Ganti & Bilik Kosong{' '}
              <span style={{ color: themeColor }}>Pantas & Tepat</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Semak slot waktu lapang pensyarah dan pelajar secara serentak mengikut jadual 10 waktu tanpa sebarang pertembungan masa.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                style={{ backgroundColor: themeColor }}
                className="h-10 px-5 text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
              >
                1. Jadual Pensyarah →
              </button>
              <button className="h-10 px-4 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                2. Cari Kelas Ganti
              </button>
              <button className="h-10 px-4 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                Semak Bilik Kosong
              </button>
            </div>
          </div>

          {/* 2. Form Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Pilih Slot Kelas Asal</h3>
              <span className="text-xs font-medium text-slate-400">Langkah 1 daripada 2</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">1. Nama Pensyarah</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>TS. DR. AZMI BIN AHMAD</option>
                  <option>NOR AZLINA BINTI MOHD</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">2. Kelas yang Diajar</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>DDM0601 (SEC 19)</option>
                  <option>DIA0301 (SEC 40)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">3. Sesi Asal Diganti</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>Isnin, 8:00 AM – 10:00 AM (2 Jam)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Matrix Cells Hybrid Style */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pratonton Sel Jadual Matriks (Gaya Hybrid)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
              {[1, 2].map(slotNum => {
                const isSelected = selectedSlot === slotNum;
                return (
                  <button
                    key={slotNum}
                    onClick={() => setSelectedSlot(slotNum)}
                    style={isSelected ? { backgroundColor: themeColor } : {}}
                    className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer text-center space-y-1.5 ${
                      isSelected
                        ? 'text-white shadow-md scale-[1.02]'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold tracking-wide flex items-center justify-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : themeColor }}
                      />
                      <span>{isSelected ? 'DIPILIH' : `LAPANG (Slot ${slotNum})`}</span>
                    </div>
                    <div
                      className={`text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      38 bilik fizikal
                    </div>
                  </button>
                );
              })}

              <div className="rounded-2xl p-4 bg-slate-900 text-white border border-slate-800 shadow-xs space-y-1 text-center flex flex-col justify-center">
                <div className="text-xs font-bold text-white">Slot Asal</div>
                <div className="text-[11px] font-medium text-slate-300">Diganti</div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/60 text-slate-400 space-y-1 text-center flex flex-col justify-center opacity-80">
                <div className="text-xs font-semibold text-slate-600 truncate">Kelas Pelajar</div>
                <div className="text-[11px] text-slate-400 truncate">Bertembung</div>
              </div>
            </div>
          </div>

          {/* 4. Room Availability Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pratonton Senarai Bilik Kosong</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">MAKMAL KOMPUTER 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 40 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">MAKMAL KOMPUTER 2-03</h4>
                <p className="text-xs text-slate-500">Aras 3 • Muatan 35 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Bilik Kuliah</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">BILIK KULIAH 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 50 Pelajar</p>
              </div>
            </div>
          </div>

          {/* 5. Notes / Alert Section */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <span className="text-base">💡</span>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="font-semibold text-slate-900">Petua Gaya Hybrid:</strong> Menggunakan garisan border amat nipis (`border-slate-100`) memberikan kepastian visual tanpa rasa tebal atau 'cluttered'.
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. GAYA A (BORDERLESS + SOFT SHADOW) ================= */}
      {activeTab === 'a' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header Concept */}
          <div className="p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wide">
                GAYA A (BORDERLESS + SOFT SHADOW)
              </span>
              <span className="text-xs font-bold text-slate-900">
                100% Bebas Garisan Border • Elegan & Moden
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tiada sebarang garisan border digunakan. Pemisahan elemen bergantung sepenuhnya kepada bayang-bayang lembut (`box-shadow`).
            </p>
          </div>

          {/* 1. Hero & Typography */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-200 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <span>Sistem Cari Kelas Pintar • KPTM Ipoh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Cari Kelas Ganti & Bilik Kosong{' '}
              <span style={{ color: themeColor }}>Pantas & Tepat</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
              Semak slot waktu lapang pensyarah dan pelajar secara serentak mengikut jadual 10 waktu tanpa sebarang pertembungan masa.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                style={{ backgroundColor: themeColor }}
                className="h-10 px-5 text-white rounded-xl text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                1. Jadual Pensyarah →
              </button>
              <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                2. Cari Kelas Ganti
              </button>
              <button className="h-10 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                Semak Bilik Kosong
              </button>
            </div>
          </div>

          {/* 2. Form Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Pilih Slot Kelas Asal</h3>
              <span className="text-xs font-medium text-slate-400">Langkah 1 daripada 2</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">1. Nama Pensyarah</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>TS. DR. AZMI BIN AHMAD</option>
                  <option>NOR AZLINA BINTI MOHD</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">2. Kelas yang Diajar</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>DDM0601 (SEC 19)</option>
                  <option>DIA0301 (SEC 40)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">3. Sesi Asal Diganti</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>Isnin, 8:00 AM – 10:00 AM (2 Jam)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Matrix Cells Gaya A */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pratonton Sel Jadual Matriks (Gaya A Borderless)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
              {[1, 2].map(slotNum => {
                const isSelected = selectedSlot === slotNum;
                return (
                  <button
                    key={slotNum}
                    onClick={() => setSelectedSlot(slotNum)}
                    style={isSelected ? { backgroundColor: themeColor } : {}}
                    className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer text-center space-y-1.5 ${
                      isSelected
                        ? 'text-white shadow-lg scale-[1.02]'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="text-xs font-extrabold tracking-wide flex items-center justify-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : themeColor }}
                      />
                      <span>{isSelected ? 'DIPILIH' : `LAPANG (Slot ${slotNum})`}</span>
                    </div>
                    <div
                      className={`text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/80 text-slate-700'
                      }`}
                    >
                      38 bilik fizikal
                    </div>
                  </button>
                );
              })}

              <div className="rounded-2xl p-4 bg-slate-900 text-white shadow-xs space-y-1 text-center flex flex-col justify-center">
                <div className="text-xs font-bold text-white">Slot Asal</div>
                <div className="text-[11px] font-medium text-slate-300">Diganti</div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-50 text-slate-400 space-y-1 text-center flex flex-col justify-center opacity-70">
                <div className="text-xs font-semibold text-slate-600 truncate">Kelas Pelajar</div>
                <div className="text-[11px] text-slate-400 truncate">Bertembung</div>
              </div>
            </div>
          </div>

          {/* 4. Room Availability Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pratonton Senarai Bilik Kosong</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">MAKMAL KOMPUTER 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 40 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">MAKMAL KOMPUTER 2-03</h4>
                <p className="text-xs text-slate-500">Aras 3 • Muatan 35 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Bilik Kuliah</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">BILIK KULIAH 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 50 Pelajar</p>
              </div>
            </div>
          </div>

          {/* 5. Notes / Alert Section */}
          <div className="p-5 bg-slate-50 rounded-2xl shadow-2xs flex items-start gap-3">
            <span className="text-base">💡</span>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="font-semibold text-slate-900">Petua Gaya A:</strong> Menghapuskan semua border menjadikan susunan tampak sangat moden dan lapang, tetapi memerlukan bayang lembut yang berkualiti tinggi agar elemen tidak tenggelam.
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. GAYA B (SUBTLE BORDER) ================= */}
      {activeTab === 'b' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header Concept */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wide border border-slate-300">
                GAYA B (SUBTLE BORDER CLASSIC)
              </span>
              <span className="text-xs font-bold text-slate-900">
                Struktur Grid Klasik dengan Garisan Kelabu Slate-200
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Gaya konvensional di mana setiap kad, butang, dan sel dibatasi oleh garisan sempadan kelabu `slate-200`. Memberi definisi kotak yang sangat tegas.
            </p>
          </div>

          {/* 1. Hero & Typography */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <span>Sistem Cari Kelas Pintar • KPTM Ipoh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Cari Kelas Ganti & Bilik Kosong{' '}
              <span style={{ color: themeColor }}>Pantas & Tepat</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Semak slot waktu lapang pensyarah dan pelajar secara serentak mengikut jadual 10 waktu tanpa sebarang pertembungan masa.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                style={{ backgroundColor: themeColor }}
                className="h-10 px-5 text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
              >
                1. Jadual Pensyarah →
              </button>
              <button className="h-10 px-4 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                2. Cari Kelas Ganti
              </button>
              <button className="h-10 px-4 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                Semak Bilik Kosong
              </button>
            </div>
          </div>

          {/* 2. Form Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Pilih Slot Kelas Asal</h3>
              <span className="text-xs font-medium text-slate-500">Langkah 1 daripada 2</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">1. Nama Pensyarah</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>TS. DR. AZMI BIN AHMAD</option>
                  <option>NOR AZLINA BINTI MOHD</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">2. Kelas yang Diajar</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>DDM0601 (SEC 19)</option>
                  <option>DIA0301 (SEC 40)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">3. Sesi Asal Diganti</label>
                <select className="w-full h-10 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none">
                  <option>Isnin, 8:00 AM – 10:00 AM (2 Jam)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Matrix Cells Gaya B */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pratonton Sel Jadual Matriks (Gaya B Classic)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
              {[1, 2].map(slotNum => {
                const isSelected = selectedSlot === slotNum;
                return (
                  <button
                    key={slotNum}
                    onClick={() => setSelectedSlot(slotNum)}
                    style={isSelected ? { backgroundColor: themeColor } : {}}
                    className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer text-center space-y-1.5 ${
                      isSelected
                        ? 'text-white shadow-sm scale-[1.02]'
                        : 'bg-slate-50 border border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold tracking-wide flex items-center justify-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : themeColor }}
                      />
                      <span>{isSelected ? 'DIPILIH' : `LAPANG (Slot ${slotNum})`}</span>
                    </div>
                    <div
                      className={`text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      38 bilik fizikal
                    </div>
                  </button>
                );
              })}

              <div className="rounded-2xl p-4 bg-slate-900 text-white border border-slate-700 shadow-xs space-y-1 text-center flex flex-col justify-center">
                <div className="text-xs font-bold text-white">Slot Asal</div>
                <div className="text-[11px] font-medium text-slate-300">Diganti</div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-100 border border-slate-200 text-slate-400 space-y-1 text-center flex flex-col justify-center opacity-80">
                <div className="text-xs font-semibold text-slate-600 truncate">Kelas Pelajar</div>
                <div className="text-[11px] text-slate-400 truncate">Bertembung</div>
              </div>
            </div>
          </div>

          {/* 4. Room Availability Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pratonton Senarai Bilik Kosong</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">MAKMAL KOMPUTER 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 40 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">MAKMAL KOMPUTER 2-03</h4>
                <p className="text-xs text-slate-500">Aras 3 • Muatan 35 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Bilik Kuliah</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">BILIK KULIAH 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 50 Pelajar</p>
              </div>
            </div>
          </div>

          {/* 5. Notes / Alert Section */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <span className="text-base">💡</span>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="font-semibold text-slate-900">Petua Gaya B:</strong> Garisan sempadan kelabu `slate-200` memberikan struktur jadual yang kukuh, tetapi jika terlalu banyak kotak serentak, ia boleh kelihatan sedikit padat.
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. GAYA C (FLAT TONE MINIMALIST) ================= */}
      {activeTab === 'c' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header Concept */}
          <div className="p-6 bg-slate-100/90 rounded-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide">
                GAYA C (FLAT TONE MINIMALIST / SWISS)
              </span>
              <span className="text-xs font-bold text-slate-900">
                0% Shadow • 0% Border • Perbezaan Tona Permukaan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Gaya rata (flat) berorientasikan rekaan tipografi Swiss. Tiada bayang dan tiada garisan border kaku; kedalaman dihasilkan sepenuhnya melalui lapisan tona kelabu (`surface grey`).
            </p>
          </div>

          {/* 1. Hero & Typography */}
          <div className="bg-slate-100/80 rounded-3xl p-7 sm:p-9 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white text-slate-900 text-xs font-bold">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <span>Sistem Cari Kelas Pintar • KPTM Ipoh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Cari Kelas Ganti & Bilik Kosong{' '}
              <span style={{ color: themeColor }}>Pantas & Tepat</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Semak slot waktu lapang pensyarah dan pelajar secara serentak mengikut jadual 10 waktu tanpa sebarang pertembungan masa.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button className="h-10 px-5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                1. Jadual Pensyarah →
              </button>
              <button
                style={{ backgroundColor: themeColor }}
                className="h-10 px-4 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                2. Cari Kelas Ganti
              </button>
              <button className="h-10 px-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer">
                Semak Bilik Kosong
              </button>
            </div>
          </div>

          {/* 2. Form Section */}
          <div className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-950">Pilih Slot Kelas Asal</h3>
              <span className="text-xs font-bold text-slate-500">Langkah 1 daripada 2</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">1. Nama Pensyarah</label>
                <select className="w-full h-10 px-3.5 bg-white rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>TS. DR. AZMI BIN AHMAD</option>
                  <option>NOR AZLINA BINTI MOHD</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">2. Kelas yang Diajar</label>
                <select className="w-full h-10 px-3.5 bg-white rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>DDM0601 (SEC 19)</option>
                  <option>DIA0301 (SEC 40)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">3. Sesi Asal Diganti</label>
                <select className="w-full h-10 px-3.5 bg-white rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>Isnin, 8:00 AM – 10:00 AM (2 Jam)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Matrix Cells Gaya C */}
          <div className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-950">Pratonton Sel Jadual Matriks (Gaya Flat)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
              {[1, 2].map(slotNum => {
                const isSelected = selectedSlot === slotNum;
                return (
                  <button
                    key={slotNum}
                    onClick={() => setSelectedSlot(slotNum)}
                    style={isSelected ? { backgroundColor: themeColor } : {}}
                    className={`rounded-2xl p-4 transition-all duration-150 cursor-pointer text-center space-y-1.5 ${
                      isSelected
                        ? 'text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <div className="text-xs font-extrabold tracking-wide flex items-center justify-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : themeColor }}
                      />
                      <span>{isSelected ? 'DIPILIH' : `LAPANG (Slot ${slotNum})`}</span>
                    </div>
                    <div
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      38 bilik fizikal
                    </div>
                  </button>
                );
              })}

              <div className="rounded-2xl p-4 bg-slate-900 text-white space-y-1 text-center flex flex-col justify-center">
                <div className="text-xs font-bold text-white">Slot Asal</div>
                <div className="text-[11px] font-medium text-slate-400">Diganti</div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-200/80 text-slate-500 space-y-1 text-center flex flex-col justify-center">
                <div className="text-xs font-semibold text-slate-700 truncate">Kelas Pelajar</div>
                <div className="text-[11px] text-slate-400 truncate">Bertembung</div>
              </div>
            </div>
          </div>

          {/* 4. Room Availability Cards */}
          <div className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-950">Pratonton Senarai Bilik Kosong</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-950">MAKMAL KOMPUTER 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 40 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Makmal Komputer</span>
                  <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-950">MAKMAL KOMPUTER 2-03</h4>
                <p className="text-xs text-slate-500">Aras 3 • Muatan 35 Pelajar</p>
              </div>

              <div className="p-5 bg-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Bilik Kuliah</span>
                  <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    ✓
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-950">BILIK KULIAH 1-01</h4>
                <p className="text-xs text-slate-500">Aras 2 • Muatan 50 Pelajar</p>
              </div>
            </div>
          </div>

          {/* 5. Notes / Alert Section */}
          <div className="p-5 bg-slate-200/90 rounded-2xl flex items-start gap-3">
            <span className="text-base">💡</span>
            <div className="text-xs text-slate-800 leading-relaxed">
              <strong className="font-semibold text-slate-950">Petua Gaya C (Swiss Flat):</strong> Sangat bersih dan ringkas tanpa bayang atau garisan hiasan. Sangat sesuai untuk pengguna yang gemarkan rekaan 'brutalist-clean'.
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. BANDING SEMUA GAYA (SIDE-BY-SIDE) ================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-950">Perbandingan Ringkas Semua 5 Gaya UI</h3>
            <p className="text-xs text-slate-500">Lihat perbezaan gaya kad dan butang tindakan lapang dengan warna tema {themeColor}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Apple Minimal */}
            <div className="space-y-3 bg-white p-5 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-full">
                  🍎 Apple Minimal
                </span>
                <h4 className="text-sm font-bold text-slate-950">1px Outline → Fill</h4>
                <p className="text-xs text-slate-500 leading-relaxed">1 warna tema, hover membesar lembut, outline 1px ultra halus.</p>
              </div>
              <div
                style={{ borderColor: themeColor, color: themeColor }}
                className="p-3 bg-white border rounded-xl text-xs font-bold text-center hover:text-white transition-all cursor-pointer group"
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = themeColor;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = themeColor;
                }}
              >
                LAPANG • 38 Bilik
              </div>
            </div>

            {/* Card 2: Hybrid A+B */}
            <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  ✨ Hybrid A+B
                </span>
                <h4 className="text-sm font-bold text-slate-950">Micro-Border Structure</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Garisan mikro halus `border-slate-100` dengan bayang mikro.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center cursor-pointer">
                LAPANG • 38 Bilik
              </div>
            </div>

            {/* Card 3: Gaya A */}
            <div className="space-y-3 bg-white p-5 rounded-3xl shadow-md flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Gaya A Borderless
                </span>
                <h4 className="text-sm font-bold text-slate-950">Pure Soft Shadow</h4>
                <p className="text-xs text-slate-500 leading-relaxed">100% borderless, hanya bayang lembut sebagai pemisah.</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-800 text-center cursor-pointer">
                LAPANG • 38 Bilik
              </div>
            </div>

            {/* Card 4: Gaya B */}
            <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Gaya B Klasik
                </span>
                <h4 className="text-sm font-bold text-slate-950">Standard Border</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Kotak bergaris sempadan `slate-200` yang kukuh & jelas.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 text-center cursor-pointer">
                LAPANG • 38 Bilik
              </div>
            </div>

            {/* Card 5: Gaya C Flat */}
            <div className="space-y-3 bg-slate-100/90 p-5 rounded-3xl flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-900 bg-white px-2.5 py-0.5 rounded-md">
                  Gaya C Flat Tone
                </span>
                <h4 className="text-sm font-bold text-slate-950">Swiss Surface Grey</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Rata sepenuhnya, tiada shadow mahupun border hiasan.</p>
              </div>
              <div className="p-3 bg-white rounded-xl text-xs font-bold text-slate-900 text-center cursor-pointer">
                LAPANG • 38 Bilik
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. DESIGN GUIDELINES & BLUEPRINT TAB ================= */}
      {activeTab === 'guidelines' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Note Banner for AI */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl space-y-3 border border-slate-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold" style={{ color: themeColor }}>
              <span>⚠️ NOTA PENTING UNTUK AI & PEMBANGUN WEB</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Warna Biru / Tema Hanyalah Pemboleh Ubah (Variable)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Warna tema seperti <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{themeColor}</span> atau mana-mana warna aksen hanyalah <strong>contoh pemboleh ubah</strong>. Anda bebas menukar warna tema kepada mana-mana kod HEX lain (cth: Emerald, Indigo, Rose, dsb.) mengikut keperluan sesuatu projek. Perkara yang WAJIB dikekalkan ialah <strong>prinsip estetika neutral, hierarki tipografi, dan ketiadaan garisan kaku (Anti-AI Tropes)</strong>.
            </p>
          </div>

          {/* Section 1: Anti-AI Tropes */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">1. PANTANG LARANG</span>
              <h3 className="text-lg font-bold text-slate-950">🚫 Anti-AI Tropes (Elakkan Rekaan Kaku AI)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="text-xs font-bold text-rose-600">❌ Border Merata-rata</div>
                <p className="text-xs text-slate-600">Jangan letak `border border-slate-200` pada setiap kad. Gunakan bayang lembut dan ruang lapang.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="text-xs font-bold text-rose-600">❌ Rainbow UI</div>
                <p className="text-xs text-slate-600">Jangan campur aduk warna pelangi (butang biru neon, kotak hijau, lencana kuning, teks ungu).</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="text-xs font-bold text-rose-600">❌ Font Monospace untuk UI</div>
                <p className="text-xs text-slate-600">Jangan guna `font-mono` untuk teks biasa/badge. Gunakan sans-serif moden (Inter, Geist).</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="text-xs font-bold text-rose-600">❌ Neon Glow Keterlaluan</div>
                <p className="text-xs text-slate-600">Gunakan bayang neutral (`shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]`) dan animasi pembesaran halus.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Color Configuration */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold">2. SISTEM WARNA</span>
              <h3 className="text-lg font-bold text-slate-950">🎨 Single-Accent Coherence</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Struktur warna dibina dengan 1 pemboleh ubah tema utama yang dipadankan dengan palet neutral universal (Putih, Slate-50, Slate-100, Slate-950).
            </p>
            <div className="bg-slate-950 text-slate-200 p-4 sm:p-5 rounded-2xl font-mono text-xs overflow-x-auto space-y-1">
              <div className="text-slate-500">// 1. Pembolehubah Tema Utama (Tukar ikut projek)</div>
              <div>--theme-primary: <span style={{ color: themeColor }}>{themeColor}</span>;</div>
              <div className="text-slate-500 pt-2">// 2. Palet Neutral Universal (Kekal sama)</div>
              <div>--bg-page: #F8FAFC;      <span className="text-slate-500">// Slate-50</span></div>
              <div>--bg-surface: #FFFFFF;   <span className="text-slate-500">// Putih tulen</span></div>
              <div>--text-primary: #020617; <span className="text-slate-500">// Slate-950</span></div>
              <div>--text-body: #475569;    <span className="text-slate-500">// Slate-600</span></div>
            </div>
          </div>

          {/* Section 3: Apple Style Golden Rules */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">3. GAYA APPLE</span>
              <h3 className="text-lg font-bold text-slate-950">🍎 Peraturan Emas Gaya Apple & Komponen</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <div><strong>Kad Borderless:</strong> Latar putih bersih (`bg-white`), tiada border kelabu, bayang terangkat lembut bila dihover (`hover:scale-[1.01]`).</div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <div><strong>Kotak Dropdown & Input:</strong> Guna border neutral halus `bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400`. <strong>JANGAN</strong> guna focus ring biru tebal (`focus:ring-2 focus:ring-[#3f8ceb]`).</div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <div><strong>Sub Nav / Header Bar:</strong> Kekalkan gaya asal yang bersih dan minimal. <strong>JANGAN</strong> letak kotak kontena kelabu tambahan di luar pautan navigasi.</div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                <div><strong>Sel Jadual 1px Outline:</strong> Sel lapang bergaris 1px warna tema tanpa fill, bertukar fill tema penuh bila dipilih atau dihover.</div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">5</span>
                <div><strong>Lencana Status (Badge):</strong> Hanya gunakan simbol tick <strong>`✓`</strong> sahaja (buang perkataan "Tersedia").</div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">6</span>
                <div><strong>Kotak Notis Elegan:</strong> Latar `bg-slate-50` dengan teks gelap, elakkan kotak kuning/oren yang menyilaukan mata.</div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Return to Home */}
      <div className="text-center pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 px-5 py-2.5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>← Kembali ke Menu Utama</span>
        </Link>
      </div>
    </div>
  );
}
