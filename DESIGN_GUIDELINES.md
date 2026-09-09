# 🎨 MASTER DESIGN GUIDELINES & BLUEPRINT (HUMAN TOUCH UI)
> **Dokumen Panduan Reka Bentuk Standard untuk AI & Pembangun Web**
> *Created for Muhammad Syafiq Haron*

Dokumen ini adalah **Blueprint Rasmi** untuk membina antaramuka laman web (UI/UX) bertaraf komersial moden dengan estetika **Apple-Grade / Human-Crafted**. Setiap kali AI membina laman web baharu, AI **WAJIB** merujuk dan mematuhi prinsip dalam dokumen ini. 

> [!IMPORTANT]
> **NOTA PENTING KEPADA AI & PEMBANGUN:**
> Warna biru (`#3f8ceb` atau `#00A3FF`) yang digunakan di dalam dokumen ini hanyalah **CONTOH pemboleh ubah warna tema (variable)**. AI atau pembangun hanya perlu menukar kod HEX warna tema utama ini mengikut kehendak projek tanpa mengubah struktur susun atur, bayang, dan hierarki neutral yang telah ditetapkan.

---

## 1. 🚫 ANTI-AI TROPES (Pantang Larang Reka Bentuk AI)

AI biasa sering menghasilkan reka bentuk yang kaku, berkotak-kotak, dan nampak seperti *template* generik. Elakkan perkara berikut:

1. ❌ **JANGAN letak border/garisan tebal pada setiap kotak (`border border-slate-200` merata-rata)**. Ini punca utama laman web nampak seperti sistem lama dan kaku.
2. ❌ **JANGAN campur aduk warna pelangi (Rainbow UI)**. Jangan campur kotak hijau, butang biru gradient dengan glow, lencana kuning, dan teks ungu dalam satu paparan.
3. ❌ **JANGAN guna font Monospace (`font-mono`) untuk UI umum**, lencana (*badges*), waktu, atau penerangan. Monospace hanya untuk blok kod mentah.
4. ❌ **JANGAN guna neon glow atau shadow berwarna keterlaluan**. Gunakan bayang neutral lembut (*soft ambient shadow*).

---

## 2. 🎨 SISTEM WARNA & KONFIGURASI TEMA (Single-Accent Coherence)

Laman web mesti berpegang kepada **1 Warna Aksen Utama Sahaja** yang dipadankan dengan palet neutral mewah (Putih, Kelabu Slate Lembut, dan Hitam Arang).

### 🔧 Konfigurasi Warna Tema (Ubah Di Sini Sahaja Mengikut Projek):
```css
:root {
  /* 1. WARNA TEMA UTAMA (Tukar kod warna ini mengikut projek) */
  --theme-primary: #00A3FF;       /* Cth: Biru Elektrik (Cari Kelas), atau Emerald (#10B981), atau Indigo (#6366F1) */
  --theme-primary-hover: #008FE0; /* Versi sedikit gelap untuk hover */
  --theme-primary-light: rgba(0, 163, 255, 0.08); /* 8% tint untuk badge/background */

  /* 2. PALET NEUTRAL UNIVERSAL (Kekal sama untuk semua projek) */
  --bg-page: #F8FAFC;            /* Latar belakang halaman (Slate-50 sejuk & bersih) */
  --bg-surface: #FFFFFF;         /* Latar belakang kad (Putih tulen) */
  --bg-subtle: #F1F5F9;          /* Latar belakang input & lencana sekunder (Slate-100) */
  
  --text-primary: #020617;       /* Teks tajuk & penegasan (Slate-950 / Hampir Hitam) */
  --text-body: #475569;          /* Teks penerangan (Slate-600 / Mudah dibaca) */
  --text-muted: #94A3B8;         /* Teks label kecil & timestamp (Slate-400) */
  
  --border-subtle: #F1F5F9;      /* Garisan bisikan ultra-halus (Slate-100) */
  --border-default: #E2E8F0;     /* Garisan pemisah sekunder (Slate-200) */
}
```

---

## 3. 🔤 TIPOGRAFI & SKALA FON (Human-Centric Typography)

Gunakan fon **Sans-Serif komersial moden** (Inter, Geist, SF Pro, Plus Jakarta Sans). Pastikan susunan hierarki saiz fon mempunyai ruang pernafasan yang lapang:

| Elemen | Kelas Tailwind | Saiz / Weight | Catatan |
| :--- | :--- | :--- | :--- |
| **Hero Title** | `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950` | 36px–48px / 800 | Tajuk utama yang yakin & kemas. |
| **Section Title** | `text-xl sm:text-2xl font-bold tracking-tight text-slate-950` | 20px–24px / 700 | Pemisah seksyen yang jelas. |
| **Card / Item Title** | `text-base font-bold text-slate-900` | 15px–16px / 700 | Nama makmal, tajuk borang, nama subjek. |
| **Body / Description** | `text-xs sm:text-sm text-slate-500 leading-relaxed` | 13px–14px / 400 | Teks penerangan dengan jarak baris lapang (*leading-relaxed*). |
| **Badges & Labels** | `text-[11px] font-semibold tracking-normal` | 11px / 600 | Lencana status, waktu, tag kategori. |
| **Micro Text** | `text-[10px] font-medium text-slate-400` | 10px / 500 | Kod bilik, metadata kecil. |

---

## 4. 🍎 GAYA APPLE: CIRI & KOMPONEN STANDARD

### A. Kad & Kontena Utama (*Borderless + Ambient Lift*)
- **Rupa Asal**: Latar belakang putih tulen (`bg-white`), **tiada garisan outline** (`border-0` atau `border border-slate-100`), bucu melengkung elegan (`rounded-3xl`), bayang mikro lembut `shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]`.
- **Kesan Hover**: Tidak menambah garisan! Sebaliknya membesar sedikit secara halus (`hover:scale-[1.01]`) dan bayang terangkat lembut (`hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)]`).

```tsx
<div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-300">
  {/* Kandungan Kad */}
</div>
```

---

### B. Butang Tindakan (*Primary & Apple Outline*)

1. **Butang Utama (Primary Action)**:
   - Warna tema padu dengan bayang mikro:
   ```tsx
   <button className="h-10 px-5 bg-[#00A3FF] hover:bg-[#008fe0] text-white rounded-xl text-xs font-semibold shadow-sm hover:scale-[1.02] transition-all duration-200 cursor-pointer">
     Tindakan Utama →
   </button>
   ```

2. **Butang Sekunder Gaya Apple (Outline Hitam → Bertukar Fill Hitam Pekat)**:
   - Tanpa background fill, bergaris hitam 1px (`border border-slate-900`), bertukar hitam pekat bila dihover:
   ```tsx
   <button className="h-10 px-4 bg-transparent border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-semibold hover:scale-[1.02] transition-all duration-200 cursor-pointer">
     Tindakan Sekunder
   </button>
   ```

3. **Butang Pilihan Ringkas (Ghost/Subtle)**:
   ```tsx
   <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:scale-[1.02] transition-all cursor-pointer">
     Pilihan Ringkas
   </button>
   ```

---

### C. Sel Jadual & Status Pemilihan (Konsep Outline Biru → Fill Biru)

Apabila membuat jadual matriks, grid waktu, atau kad pemilihan:
- **Keadaan Lapang / Sedia (Idle Available)**: 
  - Latar belakang putih bersih dengan **garisan outline warna tema 1px halus** (`border border-[#00A3FF] text-[#00A3FF] bg-white`).
  - Tiada background hijau/kuning yang berserabut.
- **Keadaan Hover / Dipilih (Selected / Active)**:
  - Bertukar menjadi **fill warna tema penuh** (`bg-[#00A3FF] text-white`) dengan bayang lembut. Tiada kesan neon glow pelik.
- **Keadaan Bertembung / Sibuk (Occupied / Disabled)**:
  - Latar kelabu lembut (`bg-slate-50 text-slate-400 opacity-60`).

```tsx
<button className="rounded-2xl p-4 transition-all duration-200 cursor-pointer text-center space-y-1.5 bg-white border border-[#00A3FF] text-[#00A3FF] hover:bg-[#00A3FF] hover:text-white hover:scale-[1.02] shadow-2xs group">
  <div className="text-xs font-extrabold tracking-wide flex items-center justify-center gap-1.5">
    <span className="w-2 h-2 rounded-full bg-[#00A3FF] group-hover:bg-white" />
    <span>LAPANG</span>
  </div>
  <div className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-50 text-[#00A3FF] group-hover:bg-white/20 group-hover:text-white transition-colors">
    38 bilik fizikal
  </div>
</button>
```

---

### D. Lencana Status (*Badges*)
- Gunakan ikon semak (*checkmark tick `✓`*) yang bersih dengan latar warna lembut:
```tsx
<span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00A3FF] bg-[#00A3FF]/10 px-2.5 py-0.5 rounded-full shadow-2xs">
  <svg className="w-3 h-3 text-[#00A3FF] stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
  <span>✓ Tersedia</span>
</span>
```

---

### E. Kotak Nota & Amaran (*Minimalist Light Grey*)
- Elakkan kotak amaran berwarna kuning atau oren menyala. Gunakan **Light Grey & Hitam** yang elegan:
```tsx
<div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-700 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
  <div className="w-6 h-6 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
    i
  </div>
  <div className="space-y-0.5">
    <span className="font-bold text-slate-950">Nota Penting:</span>
    <p className="text-xs text-slate-600 leading-relaxed">
      Keterangan maklumat yang ringkas, tepat, dan mudah dibaca.
    </p>
  </div>
</div>
```

---

## 5. 📐 SUSUN ATUR & STRUKTUR HALAMAN (*Layout & Spacing*)

1. **Lebar Maksimum Kandungan**: `max-w-6xl` (untuk teks/halaman fokus) atau `max-w-7xl` (untuk jadual matriks).
2. **Jarak Antara Seksyen**: Gunakan `space-y-8` atau `space-y-10` untuk memberi ruang bernafas yang mencukupi (*white space*).
3. **Responsif Mudah Alih**: Semua grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) mesti menyusun secara menegak pada peranti mudah alih tanpa teks melimpah keluar (*overflow*).

---

## 6. 📋 SENARAI SEMAK SEBELUM SELESAI (AI Quality Checklist)

Sebelum menyiapkan kod antaramuka mana-mana laman web, pastikan:
- [ ] Tiada `font-mono` digunakan untuk teks umum atau lencana.
- [ ] Tiada garisan sempadan tebal `border-slate-200` pada kad utama.
- [ ] Warna konsisten mengikut 1 pemboleh ubah warna tema sahaja.
- [ ] Butang sekunder menggunakan gaya *Outline Hitam → Hover Fill Hitam*.
- [ ] Sel pemilihan menggunakan *Outline Biru → Hover/Select Fill Biru*.
- [ ] Kotak nota menggunakan palet *Light Grey & Dark Slate*.
- [ ] Binaan projek (`npm run build`) lulus 100% tanpa sebarang ralat TypeScript.

---
*Dokumen ini dicipta khas untuk Muhammad Syafiq Haron sebagai panduan reka bentuk standard universal.*
