'use client';

import Link from 'next/link';
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

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs font-semibold">
              KPTM
            </span>
            <span className="text-sm font-semibold text-slate-900 tracking-tight">
              Jadual Waktu
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

