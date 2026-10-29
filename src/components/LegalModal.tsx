'use client';

import React, { useEffect } from 'react';

export type LegalTab = 'disclaimer' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  activeTab: LegalTab;
  onClose: () => void;
  onTabChange: (tab: LegalTab) => void;
}

export default function LegalModal({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
}: LegalModalProps): React.ReactElement | null {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-slate-950">
              Ketetapan Undang-Undang & Penafian
            </h2>
            <p className="text-xs text-slate-500">
              Sistem CARI KELAS • Kolej Poly-Tech MARA Ipoh
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Tutup tetingkap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            type="button"
            onClick={() => onTabChange('disclaimer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Penafian (Disclaimer)
          </button>
          <button
            type="button"
            onClick={() => onTabChange('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Terma & Syarat Penggunaan
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'disclaimer' ? (
            <>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-700 space-y-1">
                <span className="font-bold block text-xs text-slate-950">Peringatan Penting Untuk Semua Pengguna:</span>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Sistem ini adalah inisiatif utiliti pembantu bebas untuk memudahkan carian. Sebarang keputusan rasmi penggantian kelas tetap tertakluk kepada kelulusan dan prosedur pentadbiran Kolej Poly-Tech MARA (KPTM) Ipoh.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">1. Sifat Sistem & Sumber Data</h3>
                  <p>
                    Sistem <strong>CARI KELAS</strong> dibangunkan sebagai alat bantuan carian pintar ad-hoc. Data jadual waktu diselaraskan secara terus daripada portal awam EduPage KPTM Ipoh. Pembangun sistem tidak mengawal, mengubah suai secara unilateral, atau memiliki jadual waktu asal yang dikeluarkan oleh pihak kolej.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">2. Ketiadaan Jaminan Ketepatan Mutlak</h3>
                  <p>
                    Walaupun usaha berterusan diambil bagi memastikan algoritma carian dan data beroperasi dengan tepat, pembangun tidak memberi sebarang jaminan nyata atau tersirat bahawa data sentiasa terkini, tepat 100%, atau bebas daripada sebarang ralat sumber pihak ketiga (seperti pertukaran saat akhir oleh pihak kolej yang belum dikemas kini dalam EduPage).
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">3. Pelepasan Liabiliti Penuh Pembangun</h3>
                  <p>
                    Setakat yang dibenarkan oleh undang-undang, <strong>pembangun sistem (Muhammad Syafiq Haron) tidak akan bertanggungjawab, sama ada secara langsung, tidak langsung, khas, berbangkit, atau berbentuk teladan</strong>, terhadap sebarang:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 pt-1 text-slate-600">
                    <li>Pertembungan jadual sebenar (*class clash*) semasa sesi kelas ganti dijalankan.</li>
                    <li>Ketidakhadiran pensyarah atau pelajar akibat salah faham waktu atau lokasi bilik.</li>
                    <li>Sebarang tindakan tatatertib, aduan jabatan, atau kerugian akademik.</li>
                    <li>Sebarang pertikaian antara pensyarah, pelajar, mahupun pentadbiran kolej.</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">4. Kewajipan Pengesahan Pengguna</h3>
                  <p>
                    Pengguna (pensyarah dan pelajar) bertanggungjawab sepenuhnya untuk menyemak silang (*cross-check*) jadual dan mematuhi saluran serta SOP rasmi kolej, termasuk pengisian borang gantian kelas dan mendapatkan kelulusan Ketua Jabatan/Program yang sah.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">1. Penerimaan Terma</h3>
                  <p>
                    Dengan mengakses, melayari, atau menggunakan sistem ini, anda bersetuju bahawa anda telah membaca, memahami, dan terikat dengan Terma & Syarat ini. Sekiranya anda tidak bersetuju dengan mana-mana bahagian terma ini, anda dinasihatkan untuk tidak menggunakan sistem ini.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">2. Penggunaan Yang Dibenarkan</h3>
                  <p>
                    Sistem ini disediakan secara percuma semata-mata untuk kegunaan warga akademik Kolej Poly-Tech MARA Ipoh bagi tujuan semakan peribadi waktu mengajar dan pencarian slot bilik lapang. Pengguna dilarang sama sekali menyalahgunakan, membebankan pelayan sistem secara berniat jahat (*abuse/DDoS*), atau mengeksploitasi data untuk tujuan komersial pihak ketiga tanpa kebenaran bertulis.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">3. Penyediaan Perkhidmatan "Sebagaimana Adanya" (As-Is)</h3>
                  <p>
                    Aplikasi ini disediakan atas dasar <em>"AS-IS"</em> dan <em>"AS-AVAILABLE"</em>. Pembangun berhak untuk mengubah suai, menghentikan sementara, atau menamatkan sebarang ciri aplikasi pada bila-bila masa tanpa notis terdahulu sekiranya berlaku kekangan teknikal atau perubahan pada pelayan sumber EduPage.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">4. Hak Cipta & Tanda Dagangan</h3>
                  <p>
                    Nama, lambang dan data rasmi Kolej Poly-Tech MARA Ipoh dan EduPage adalah hak milik eksklusif pemilik masing-masing. Sistem ini tidak menuntut sebarang pemilikan rasmi ke atas jenama institusi berkenaan.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">5. Perubahan Syarat</h3>
                  <p>
                    Pembangun berhak meminda Terma Penggunaan dan Penafian ini dari semasa ke semasa mengikut keperluan operasi dan undang-undang. Sebarang perubahan akan berkuat kuasa serta-merta sebaik sahaja dikemas kini pada laman ini.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Kemas kini: Oktober 2026
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Saya Fahami & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
