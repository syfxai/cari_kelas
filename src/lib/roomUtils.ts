export interface RoomBadgeInfo {
  code: string;
  fullName: string;
  category: 'lab' | 'lecture' | 'online' | 'tutorial' | 'studio' | 'auditorium' | 'other';
  categoryLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotColor: string;
  icon: string;
}

export function parseRoomBadge(roomName?: string): RoomBadgeInfo {
  const name = (roomName || '').trim();
  if (!name) {
    return {
      code: 'Tiada Bilik',
      fullName: 'Tiada Bilik Ditetapkan',
      category: 'other',
      categoryLabel: 'Tiada Bilik',
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-600',
      borderClass: 'border-slate-200/60',
      dotColor: 'bg-slate-400',
      icon: '👥',
    };
  }

  const upper = name.toUpperCase();

  // 1. Makmal Komputer (MK)
  if (upper.includes('MAKMAL KOMPUTER') || upper.startsWith('MK')) {
    const num = name.replace(/MAKMAL KOMPUTER/i, '').replace(/MK/i, '').trim();
    return {
      code: num ? `MK ${num}` : 'MK',
      fullName: name,
      category: 'lab',
      categoryLabel: 'Makmal Komputer',
      bgClass: 'bg-emerald-50',
      textClass: 'text-emerald-700',
      borderClass: 'border-emerald-200/80',
      dotColor: 'bg-emerald-500',
      icon: '🧪',
    };
  }

  // 2. Bilik Kuliah (BK)
  if (upper.includes('BILIK KULIAH') || upper.startsWith('BK')) {
    const num = name.replace(/BILIK KULIAH/i, '').replace(/BK/i, '').trim();
    return {
      code: num ? `BK ${num}` : 'BK',
      fullName: name,
      category: 'lecture',
      categoryLabel: 'Bilik Kuliah',
      bgClass: 'bg-indigo-50',
      textClass: 'text-indigo-700',
      borderClass: 'border-indigo-200/80',
      dotColor: 'bg-indigo-500',
      icon: '🏛️',
    };
  }

  // 3. Bilik Tutorial (BT)
  if (upper.includes('BILIK TUTORIAL') || upper.startsWith('BT')) {
    const num = name.replace(/BILIK TUTORIAL/i, '').replace(/BT/i, '').trim();
    return {
      code: num ? `BT ${num}` : 'BT',
      fullName: name,
      category: 'tutorial',
      categoryLabel: 'Bilik Tutorial',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-700',
      borderClass: 'border-amber-200/80',
      dotColor: 'bg-amber-500',
      icon: '📝',
    };
  }

  // 4. Online
  if (upper.includes('ONLINE')) {
    return {
      code: name,
      fullName: `Atas Talian (${name})`,
      category: 'online',
      categoryLabel: 'Atas Talian',
      bgClass: 'bg-sky-50',
      textClass: 'text-sky-700',
      borderClass: 'border-sky-200/80',
      dotColor: 'bg-sky-500',
      icon: '🌐',
    };
  }

  // 5. Studio Rekabentuk
  if (upper.includes('STUDIO')) {
    const num = name.replace(/STUDIO REKABENTUK/i, '').replace(/STUDIO/i, '').trim();
    return {
      code: num ? `STUDIO ${num}` : 'STUDIO',
      fullName: name,
      category: 'studio',
      categoryLabel: 'Studio Rekabentuk',
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-700',
      borderClass: 'border-purple-200/80',
      dotColor: 'bg-purple-500',
      icon: '🎨',
    };
  }

  // 6. Auditorium
  if (upper.includes('AUDITORIUM')) {
    return {
      code: 'AUDITORIUM',
      fullName: 'Auditorium KPTM',
      category: 'auditorium',
      categoryLabel: 'Auditorium',
      bgClass: 'bg-violet-50',
      textClass: 'text-violet-700',
      borderClass: 'border-violet-200/80',
      dotColor: 'bg-violet-500',
      icon: '🎭',
    };
  }

  // 7. Bilik Bincang (BB)
  if (upper.includes('BILIK BINCANG') || upper.startsWith('BB')) {
    const num = name.replace(/BILIK BINCANG/i, '').replace(/BB/i, '').trim();
    return {
      code: num ? `BB ${num}` : 'BB',
      fullName: name,
      category: 'other',
      categoryLabel: 'Bilik Bincang',
      bgClass: 'bg-rose-50',
      textClass: 'text-rose-700',
      borderClass: 'border-rose-200/80',
      dotColor: 'bg-rose-500',
      icon: '💬',
    };
  }

  return {
    code: name,
    fullName: name,
    category: 'other',
    categoryLabel: 'Bilik Khas',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-200/80',
    dotColor: 'bg-slate-500',
    icon: '📍',
  };
}
