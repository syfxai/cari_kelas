'use client';

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
        </div>
      </div>
    </nav>
  );
}
