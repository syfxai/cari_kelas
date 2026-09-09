'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ScrapeButton from '@/components/ScrapeButton';
import {
  DAYS,
  DAY_LABELS,
  type RoomAvailabilityResponse,
} from '@/lib/types';

const STORAGE_KEYS = {
  DAY: 'kptm_rooms_day',
  TIME_START: 'kptm_rooms_time_start',
  TIME_END: 'kptm_rooms_time_end',
  EXCLUDE_ONLINE: 'kptm_rooms_exclude_online',
  STATUS_TAB: 'kptm_rooms_status_tab',
  CATEGORY: 'kptm_rooms_category',
} as const;

const PERIOD_START_OPTIONS = [
  { value: '08:00', period: 1, label: 'Waktu 1 (08:00 AM)' },
  { value: '09:00', period: 2, label: 'Waktu 2 (09:00 AM)' },
  { value: '10:00', period: 3, label: 'Waktu 3 (10:00 AM)' },
  { value: '11:00', period: 4, label: 'Waktu 4 (11:00 AM)' },
  { value: '12:00', period: 5, label: 'Waktu 5 (12:00 PM)' },
  { value: '13:00', period: 6, label: 'Waktu 6 (01:00 PM)' },
  { value: '14:00', period: 7, label: 'Waktu 7 (02:00 PM)' },
  { value: '15:00', period: 8, label: 'Waktu 8 (03:00 PM)' },
  { value: '16:00', period: 9, label: 'Waktu 9 (04:00 PM)' },
  { value: '17:00', period: 10, label: 'Waktu 10 (05:00 PM)' },
] as const;

const PERIOD_END_OPTIONS = [
  { value: '09:00', period: 1, label: 'Waktu 1 (09:00 AM)' },
  { value: '10:00', period: 2, label: 'Waktu 2 (10:00 AM)' },
  { value: '11:00', period: 3, label: 'Waktu 3 (11:00 AM)' },
  { value: '12:00', period: 4, label: 'Waktu 4 (12:00 PM)' },
  { value: '13:00', period: 5, label: 'Waktu 5 (01:00 PM)' },
  { value: '14:00', period: 6, label: 'Waktu 6 (02:00 PM)' },
  { value: '15:00', period: 7, label: 'Waktu 7 (03:00 PM)' },
  { value: '16:00', period: 8, label: 'Waktu 8 (04:00 PM)' },
  { value: '17:00', period: 9, label: 'Waktu 9 (05:00 PM)' },
  { value: '18:00', period: 10, label: 'Waktu 10 (06:00 PM)' },
] as const;

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  let hour = h;
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }
  return hour * 60 + (m || 0);
};

const formatTime = (time: string): string => {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (hours >= 1 && hours <= 7) {
    hours += 12;
  }
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const roomCategoryLabel = (category?: string): string => {
  if (category === 'lab') return 'Makmal Komputer';
  if (category === 'lecture') return 'Bilik Kuliah';
  if (category === 'online') return 'Online';
  return 'Bilik Khas';
};

export default function RoomsPage() {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [timeStart, setTimeStart] = useState<string>('08:00');
  const [timeEnd, setTimeEnd] = useState<string>('09:00');
  const [excludeOnline, setExcludeOnline] = useState<boolean>(true);
  const [statusTab, setStatusTab] = useState<'available' | 'occupied' | 'all'>('available');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [availability, setAvailability] = useState<RoomAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scrapeNeeded, setScrapeNeeded] = useState<boolean>(false);
  const [copiedRoom, setCopiedRoom] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // 1. Initial Load: Restore user preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDay = localStorage.getItem(STORAGE_KEYS.DAY);
      const savedTimeStart = localStorage.getItem(STORAGE_KEYS.TIME_START);
      const savedTimeEnd = localStorage.getItem(STORAGE_KEYS.TIME_END);
      const savedExcludeOnline = localStorage.getItem(STORAGE_KEYS.EXCLUDE_ONLINE);
      const savedStatusTab = localStorage.getItem(STORAGE_KEYS.STATUS_TAB);
      const savedCategory = localStorage.getItem(STORAGE_KEYS.CATEGORY);

      if (savedDay && DAYS.includes(savedDay as (typeof DAYS)[number])) {
        setSelectedDay(savedDay);
      }
      if (savedTimeStart && PERIOD_START_OPTIONS.some(p => p.value === savedTimeStart)) {
        setTimeStart(savedTimeStart);
      }
      if (savedTimeEnd && PERIOD_END_OPTIONS.some(p => p.value === savedTimeEnd)) {
        setTimeEnd(savedTimeEnd);
      }
      if (savedExcludeOnline !== null) {
        setExcludeOnline(savedExcludeOnline === 'true');
      }
      if (savedStatusTab && ['available', 'occupied', 'all'].includes(savedStatusTab)) {
        setStatusTab(savedStatusTab as 'available' | 'occupied' | 'all');
      }
      if (savedCategory) {
        setCategoryFilter(savedCategory);
      }
      setInitialized(true);
    }
  }, []);

  // 2. Fetch Room Availability
  const fetchAvailability = useCallback(
    async (dayParam?: string, startParam?: string, endParam?: string) => {
      const activeDay = dayParam || selectedDay;
      const activeStart = startParam || timeStart;
      const activeEnd = endParam || timeEnd;

      setLoading(true);
      try {
        const url = `/api/rooms?day=${encodeURIComponent(activeDay)}&time=${encodeURIComponent(
          activeStart
        )}&time_end=${encodeURIComponent(activeEnd)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setAvailability(data.data);
          setScrapeNeeded(false);

          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.DAY, activeDay);
            localStorage.setItem(STORAGE_KEYS.TIME_START, activeStart);
            localStorage.setItem(STORAGE_KEYS.TIME_END, activeEnd);
          }
        } else {
          setScrapeNeeded(true);
        }
      } catch {
        setScrapeNeeded(true);
      } finally {
        setLoading(false);
      }
    },
    [selectedDay, timeStart, timeEnd]
  );

  // Auto-fetch once initialized
  useEffect(() => {
    if (initialized) {
      fetchAvailability();
    }
  }, [initialized, fetchAvailability]);

  // Handle Day Change
  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DAY, day);
    }
    fetchAvailability(day, timeStart, timeEnd);
  };

  // Handle Start Time Change
  const handleTimeStartChange = (start: string) => {
    setTimeStart(start);
    const startMin = timeToMinutes(start);
    let nextEnd = timeEnd;
    if (timeToMinutes(timeEnd) <= startMin) {
      const endOpt = PERIOD_END_OPTIONS.find(p => timeToMinutes(p.value) > startMin);
      nextEnd = endOpt ? endOpt.value : '18:00';
      setTimeEnd(nextEnd);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TIME_START, start);
      localStorage.setItem(STORAGE_KEYS.TIME_END, nextEnd);
    }
    fetchAvailability(selectedDay, start, nextEnd);
  };

  // Handle End Time Change
  const handleTimeEndChange = (end: string) => {
    setTimeEnd(end);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TIME_END, end);
    }
    fetchAvailability(selectedDay, timeStart, end);
  };

  // Quick Duration Setters
  const applyDurationPreset = (hours: number) => {
    const startMin = timeToMinutes(timeStart);
    const targetEndMin = startMin + hours * 60;
    const endOpt = PERIOD_END_OPTIONS.find(p => timeToMinutes(p.value) === targetEndMin);
    const nextEnd = endOpt ? endOpt.value : '18:00';
    setTimeEnd(nextEnd);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TIME_END, nextEnd);
    }
    fetchAvailability(selectedDay, timeStart, nextEnd);
  };

  const applySlotPreset = (start: string, end: string) => {
    setTimeStart(start);
    setTimeEnd(end);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TIME_START, start);
      localStorage.setItem(STORAGE_KEYS.TIME_END, end);
    }
    fetchAvailability(selectedDay, start, end);
  };

  const toggleExcludeOnline = () => {
    const nextVal = !excludeOnline;
    setExcludeOnline(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXCLUDE_ONLINE, String(nextVal));
    }
  };

  const handleStatusTabChange = (tab: 'available' | 'occupied' | 'all') => {
    setStatusTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STATUS_TAB, tab);
    }
  };

  const handleCategoryFilterChange = (cat: string) => {
    setCategoryFilter(cat);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORY, cat);
    }
  };

  const handleCopyRoom = (roomName: string) => {
    navigator.clipboard.writeText(roomName);
    setCopiedRoom(roomName);
    setTimeout(() => {
      setCopiedRoom(null);
    }, 1500);
  };

  // Calculate duration and period labels
  const durationInfo = useMemo(() => {
    const startMin = timeToMinutes(timeStart);
    const endMin = timeToMinutes(timeEnd);
    const hours = Math.max(1, Math.round((endMin - startMin) / 60));

    const startPeriod = PERIOD_START_OPTIONS.find(p => p.value === timeStart)?.period || 1;
    const endPeriod = PERIOD_END_OPTIONS.find(p => p.value === timeEnd)?.period || 1;

    let periodStr = `Waktu ${startPeriod}`;
    if (startPeriod !== endPeriod) {
      periodStr = `Waktu ${startPeriod} – ${endPeriod}`;
    }

    return {
      hours,
      startPeriod,
      endPeriod,
      periodStr,
    };
  }, [timeStart, timeEnd]);

  // Filtered available and occupied lists
  const filteredAvailable = useMemo(() => {
    if (!availability) return [];
    return availability.available.filter(room => {
      if (excludeOnline && room.isOnline) return false;
      if (categoryFilter !== 'all' && room.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!room.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [availability, excludeOnline, categoryFilter, searchQuery]);

  const filteredOccupied = useMemo(() => {
    if (!availability) return [];
    return availability.occupied.filter(room => {
      if (excludeOnline && room.isOnline) return false;
      if (categoryFilter !== 'all' && room.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = room.name.toLowerCase().includes(q);
        const matchesSubject = room.slot?.subject.toLowerCase().includes(q);
        const matchesTeacher = room.slot?.teacher.toLowerCase().includes(q);
        const matchesClass = room.slot?.class.toLowerCase().includes(q);
        if (!matchesName && !matchesSubject && !matchesTeacher && !matchesClass) return false;
      }
      return true;
    });
  }, [availability, excludeOnline, categoryFilter, searchQuery]);

  // Counts for physical vs total
  const physicalCounts = useMemo(() => {
    if (!availability) return { available: 0, occupied: 0, total: 0 };
    const availPhys = availability.available.filter(r => !r.isOnline).length;
    const occPhys = availability.occupied.filter(r => !r.isOnline).length;
    return {
      available: availPhys,
      occupied: occPhys,
      total: availPhys + occPhys,
    };
  }, [availability]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#3f8ceb] animate-pulse" />
            <span>Waktu 1–10 (Isnin – Jumaat)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Cari Bilik Kosong
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Semak makmal komputer dan bilik kuliah fizikal yang lapang mengikut slot waktu pembelajaran.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Bilik Fizikal: <strong className="text-[#3f8ceb] font-extrabold">{physicalCounts.available}</strong> lapang / {physicalCounts.total} jumlah</span>
        </div>
      </div>

      {scrapeNeeded ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center max-w-md mx-auto space-y-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
          <h3 className="text-base font-bold text-slate-950">Pangkalan Data Belum Dimuatkan</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sila lakukan scraping jadual waktu dari EduPage KPTM untuk memulakan semakan ketersediaan bilik.
          </p>
          <div className="pt-2">
            <ScrapeButton onComplete={() => fetchAvailability()} />
          </div>
        </div>
      ) : (
        <>
          {/* Control & Filter Panel - Gaya Apple Minimal */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-5">
            {/* Row 1: Day Selector Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900">
                Pilih Hari
              </label>
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-2xl max-w-fit">
                {DAYS.map(day => {
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayChange(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-sm scale-[1.02]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Time Range Dari - Hingga */}
            <div className="pt-4 border-t border-slate-100 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Waktu Dari – Hingga
                </label>
                <span className="text-xs font-semibold text-[#3f8ceb] bg-sky-50 px-3 py-1 rounded-full">
                  Tempoh: {durationInfo.hours} Jam ({durationInfo.periodStr})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-6 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-800">Waktu Mula:</span>
                  <select
                    value={timeStart}
                    onChange={e => handleTimeStartChange(e.target.value)}
                    className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3f8ceb] transition-colors cursor-pointer"
                  >
                    {PERIOD_START_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-6 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-800">Waktu Tamat:</span>
                  <select
                    value={timeEnd}
                    onChange={e => handleTimeEndChange(e.target.value)}
                    className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3f8ceb] transition-colors cursor-pointer"
                  >
                    {PERIOD_END_OPTIONS.map(opt => {
                      const disabled = timeToMinutes(opt.value) <= timeToMinutes(timeStart);
                      return (
                        <option key={opt.value} value={opt.value} disabled={disabled}>
                          {opt.label} {disabled ? '(Sebelum waktu mula)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400 mr-1">Preset Pantas:</span>
                {[
                  { label: '1 Jam', action: () => applyDurationPreset(1) },
                  { label: '2 Jam', action: () => applyDurationPreset(2) },
                  { label: '3 Jam', action: () => applyDurationPreset(3) },
                  { label: 'Sesi Pagi (08:00 – 13:00)', action: () => applySlotPreset('08:00', '13:00') },
                  { label: 'Sesi Petang (01:00 – 06:00 PM)', action: () => applySlotPreset('13:00', '18:00') },
                  { label: 'Sepanjang Hari', action: () => applySlotPreset('08:00', '18:00') },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={p.action}
                    className="h-7 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Exclude Online & Search */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-6">
                <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={excludeOnline}
                    onChange={toggleExcludeOnline}
                    className="w-4 h-4 rounded text-[#3f8ceb] focus:ring-[#3f8ceb]"
                  />
                  <span>Tapis Bilik Fizikal Sahaja (Abaikan Bilik Online)</span>
                </label>
              </div>

              <div className="md:col-span-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama bilik (cth: MAKMAL 2, BK 4-22)..."
                  className="w-full h-10 px-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f8ceb] transition-all"
                />
              </div>
            </div>

            {/* Row 4: Categories & Action Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'lab', label: 'Makmal Komputer' },
                  { id: 'lecture', label: 'Bilik Kuliah' },
                  { id: 'other', label: 'Bilik Khas' },
                  ...(!excludeOnline ? [{ id: 'online', label: 'Online' }] : []),
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryFilterChange(cat.id)}
                    className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => fetchAvailability()}
                disabled={loading}
                className="h-10 px-6 bg-[#3f8ceb] hover:bg-[#3280e2] text-white font-semibold text-xs rounded-xl shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Menyemak...' : 'Semak Ketersediaan Bilik →'}
              </button>
            </div>
          </div>

          {/* Status Tabs Switcher */}
          {availability && (
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl max-w-fit text-xs">
              <button
                type="button"
                onClick={() => handleStatusTabChange('available')}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  statusTab === 'available'
                    ? 'bg-white text-slate-950 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Bilik Kosong ({filteredAvailable.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusTabChange('occupied')}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  statusTab === 'occupied'
                    ? 'bg-white text-slate-950 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Bilik Ditempah ({filteredOccupied.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusTabChange('all')}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusTab === 'all'
                    ? 'bg-white text-slate-950 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>Semua ({filteredAvailable.length + filteredOccupied.length})</span>
              </button>
            </div>
          )}

          {/* Results Grid - Gaya Apple Minimal */}
          <div className="space-y-6">
            {/* Available Rooms Grid */}
            {(statusTab === 'available' || statusTab === 'all') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-950">
                    Bilik Kosong & Tersedia ({filteredAvailable.length})
                  </h2>
                  <span className="text-xs text-slate-500">
                    {DAY_LABELS[selectedDay]}, {formatTime(timeStart)} – {formatTime(timeEnd)}
                  </span>
                </div>

                {filteredAvailable.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAvailable.map(room => {
                      const isCopied = copiedRoom === room.name;

                      return (
                        <div
                          key={room.id}
                          className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {roomCategoryLabel(room.category)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                                ✓ Tersedia
                              </span>
                            </div>

                            <div className="text-base font-extrabold text-slate-950 pt-1">
                              {room.name}
                            </div>

                            <div className="text-xs text-slate-500">
                              {durationInfo.periodStr} ({durationInfo.hours} Jam)
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-medium text-slate-400">
                              {room.id.replace('*', '')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyRoom(room.name)}
                              className="h-7 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span>{isCopied ? 'Disalin!' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center text-xs text-slate-400 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
                    Tiada bilik kosong untuk penapis ini. Sila pilih waktu atau hari lain.
                  </div>
                )}
              </div>
            )}

            {/* Occupied Rooms Grid */}
            {(statusTab === 'occupied' || statusTab === 'all') && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-950">
                    Bilik Sudah Ditempah ({filteredOccupied.length})
                  </h2>
                  <span className="text-xs text-slate-500">
                    Ada kelas berjadual
                  </span>
                </div>

                {filteredOccupied.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredOccupied.map(room => (
                      <div
                        key={room.id}
                        className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                              {roomCategoryLabel(room.category)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Ditempah
                            </span>
                          </div>

                          <div className="text-base font-extrabold text-slate-950 pt-1">
                            {room.name}
                          </div>

                          {room.slot && (
                            <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1">
                              <div className="font-bold text-slate-900 truncate">
                                {room.slot.subject}
                              </div>
                              <div className="text-slate-600 truncate text-xs">
                                {room.slot.teacher || '—'} • {room.slot.class || '—'}
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {formatTime(room.slot.time)} – {formatTime(room.slot.timeEnd)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{room.id.replace('*', '')}</span>
                          <span className="text-rose-600 font-semibold">Bertembung</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center text-xs text-slate-400 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
                    Tiada bilik ditempah untuk penapis ini.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
