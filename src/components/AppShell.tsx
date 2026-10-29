'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import SurveyToast from './SurveyToast';
import LegalModal, { type LegalTab } from './LegalModal';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalActiveTab, setLegalActiveTab] = useState<LegalTab>('disclaimer');

  const openLegalModal = (tab: LegalTab) => {
    setLegalActiveTab(tab);
    setLegalModalOpen(true);
  };

  const navigation = [
    {
      name: 'Menu Utama',
      href: '/',
    },
    {
      name: 'Jadual Pensyarah',
      href: '/teachers',
      badge: 'Langkah 1',
    },
    {
      name: 'Cari Kelas Ganti',
      href: '/replacement',
      badge: 'Langkah 2',
    },
    {
      name: 'Cari Bilik Kosong',
      href: '/rooms',
    },
    {
      name: 'Jadual Kelas',
      href: '/classes',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Minimal Top Header - Gaya Apple Minimal */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 print:hidden">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/icon.png"
                alt="Logo Cari Kelas"
                width={34}
                height={34}
                className="w-8 h-8 rounded-xl shadow-xs object-cover hover:scale-105 transition-transform duration-200"
                priority
              />
              <div className="flex flex-col justify-center">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-950 leading-none">
                  CARI KELAS
                </span>
                <span className="hidden sm:inline text-[10px] text-slate-400 font-medium tracking-tight mt-1 leading-none">
                  Cari kelas ganti dengan mudah
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-normal ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Pinned Navigation (Fixed on viewport right below header) */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[57px] bg-slate-900/40 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-[57px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3.5 space-y-2 shadow-2xl md:hidden animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-65px)] overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Greyish Structured Footer with Legal Disclaimer & Terms */}
      <footer className="border-t border-slate-200/80 bg-slate-100/70 py-8 px-4 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/icon.png"
                  alt="Logo Cari Kelas"
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-lg object-cover shadow-2xs"
                />
                <span className="font-bold text-slate-900">CARI KELAS</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>Kolej Poly-Tech MARA Ipoh</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-slate-600 font-medium">oleh Muhammad Syafiq Haron</span>
            </div>

            {/* Quick Links: Changelog, Disclaimer, Terms */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link
                href="/changelog"
                className="text-slate-600 hover:text-slate-950 font-semibold underline underline-offset-4 transition-colors"
              >
                Changelog
              </Link>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => openLegalModal('disclaimer')}
                className="text-slate-600 hover:text-slate-950 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
              >
                Penafian (Disclaimer)
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => openLegalModal('terms')}
                className="text-slate-600 hover:text-slate-950 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
              >
                Terma & Syarat
              </button>
            </div>
          </div>

          {/* Legal Protection Statement Note */}
          <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 leading-relaxed text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="max-w-3xl">
              <strong>Penafian Undang-Undang:</strong> Sistem ini merupakan inisiatif utiliti pembantu bebas. Segala carian slot bilik dan waktu adalah berpandukan data EduPage semasa. Pembangun tidak bertanggungjawab atas sebarang pertembungan jadual, ketidaktepatan data sumber, atau salah faham. Pengguna diwajibkan mematuhi SOP dan pengesahan rasmi pihak KPTM Ipoh.
            </p>
            <span className="shrink-0 text-slate-400">
              © {new Date().getFullYear()} CARI KELAS
            </span>
          </div>
        </div>
      </footer>

      {/* Legal Modal Dialog */}
      <LegalModal
        isOpen={legalModalOpen}
        activeTab={legalActiveTab}
        onClose={() => setLegalModalOpen(false)}
        onTabChange={setLegalActiveTab}
      />

      {/* Feedback Survey Floating Toast */}
      <SurveyToast />
    </div>
  );
}
