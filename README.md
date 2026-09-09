# 🎓 CARI KELAS — KPTM Ipoh
> **Sistem Pengurusan Jadual, Carian Kelas Ganti & Semakan Bilik Kosong Pintar**

Aplikasi web moden berprestasi tinggi untuk pensyarah dan pentadbir Kolej Poly-Tech MARA (KPTM) Ipoh bagi menyemak jadual waktu, mencari slot kelas ganti tanpa pertembungan waktu, memeriksa ketersediaan makmal komputer/bilik kuliah fizikal, dan menjana memo kelas ganti secara automatik.

---

## ⚡ Ciri-Ciri Utama

1. **📅 Cari Kelas Ganti (Jadual Matriks Mingguan 5 Hari × 10 Waktu)**:
   - Pilih nama pensyarah dan kelas yang diajar.
   - Sistem memadankan jadual pensyarah dan kelas pelajar serentak.
   - Paparan jadual matriks melengkung (*curved pill matrix*) yang interaktif.
   - Pengesanan slot lapang (*✓ LAPANG*) dengan bilangan bilik fizikal sedia ada.
   - **1-Klik Salin Memo**: Format mesej siap dijana untuk dihantar terus ke WhatsApp atau memo rasmi pelajar.

2. **🏫 Cari Bilik Kosong (Waktu 1 hingga Waktu 10)**:
   - Semak ketersediaan makmal komputer dan bilik kuliah fizikal.
   - Penapis khas untuk menapis bilik online dan bilik yang sudah ditempah.
   - Pilihan tempoh masa (1 Jam, 2 Jam, 3 Jam, Sesi Pagi, Sesi Petang, Sepanjang Hari).

3. **👨‍🏫 Jadual Pensyarah**:
   - Carian pantas jadual mengajar bagi 140+ pensyarah KPTM Ipoh mengikut hari dan waktu pembelajaran.

4. **👥 Jadual Kumpulan Kelas**:
   - Semakan jadual waktu penuh merentasi Waktu 1 hingga Waktu 10 bagi program DIA, DDM, DIM, DIT, DCW, dan lain-lain.

---

## 🛠️ Teknologi & Seni Bina

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Python [FastAPI](https://fastapi.tiangolo.com/), BeautifulSoup4, Uvicorn
- **Integrasi Data**: Scraping masa nyata dari portal EduPage KPTM Ipoh

---

## 🚀 Panduan Menjalankan Sistem

### 1. Prasyarat
- Node.js (v18+) & npm
- Python (v3.10+) & pip

### 2. Pemasangan Pakej
```bash
# Pasang kebergantungan Frontend
npm install

# Pasang kebergantungan Backend (Python)
pip install -r backend/requirements.txt
```

### 3. Menjalankan Pelayan Pembangunan
```bash
# Terminal 1: Jalankan Backend FastAPI
python backend/main.py

# Terminal 2: Jalankan Frontend Next.js
npm run dev
```

Buka pelayar pada [http://localhost:3001](http://localhost:3001) untuk memulakan aplikasi.

---

## 📄 Lesen & Hak Cipta
Dibangunkan khas untuk warga **Kolej Poly-Tech MARA (KPTM) Ipoh**.

