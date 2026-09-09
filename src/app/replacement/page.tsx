'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import {
  DAY_LABELS,
  DAYS,
  type ReplacementOption,
  type ReplacementResult,
  type RoomOption,
  type TeacherData,
  type TimetableSlot,
} from '@/lib/types';

const STORAGE_KEYS = {
  TEACHER: 'kptm_replacement_teacher',
  CLASS: 'kptm_replacement_class',
  SLOT: 'kptm_replacement_slot',
} as const;

const PERIODS = [
  { period: 1, start: '08:00', end: '09:00', label: '1 (8:00 - 9:00)' },
  { period: 2, start: '09:00', end: '10:00', label: '2 (9:00 - 10:00)' },
  { period: 3, start: '10:00', end: '11:00', label: '3 (10:00 - 11:00)' },
  { period: 4, start: '11:00', end: '12:00', label: '4 (11:00 - 12:00)' },
  { period: 5, start: '12:00', end: '13:00', label: '5 (12:00 - 1:00)' },
  { period: 6, start: '13:00', end: '14:00', label: '6 (1:00 - 2:00)' },
  { period: 7, start: '14:00', end: '15:00', label: '7 (2:00 - 3:00)' },
  { period: 8, start: '15:00', end: '16:00', label: '8 (3:00 - 4:00)' },
  { period: 9, start: '16:00', end: '17:00', label: '9 (4:00 - 5:00)' },
  { period: 10, start: '17:00', end: '18:00', label: '10 (5:00 - 6:00)' },
] as const;

const DAY_CODES: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
};

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

const formatSlot = (slot: { day: string; time: string; timeEnd: string }): string =>
  `${DAY_LABELS[slot.day] || slot.day}, ${formatTime(slot.time)} - ${formatTime(slot.timeEnd)}`;

export default function ReplacementPage() {
  const [teacherNames, setTeacherNames] = useState<string[]>([]);
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [className, setClassName] = useState<string>('');
  const [sourceKey, setSourceKey] = useState<string>('');
  const [result, setResult] = useState<ReplacementResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTeacher, setLoadingTeacher] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [durationFilter, setDurationFilter] = useState<string>('match_source');
  const [excludeOnline, setExcludeOnline] = useState<boolean>(true);
  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>('all');
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>('');

  // Selected / Expanded Slot State
  const [activeSlotOption, setActiveSlotOption] = useState<ReplacementOption | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');
  const detailsPanelRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Fetch all teacher names and restore from URL query param or localStorage
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        const res = await fetch('/api/teachers');
        const data = await res.json();
        if (data.success && isMounted) {
          const names: string[] = data.data;
          setTeacherNames(names);

          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const queryTeacher = urlParams.get('teacher');
            const savedTeacher = localStorage.getItem(STORAGE_KEYS.TEACHER);
            const savedClass = localStorage.getItem(STORAGE_KEYS.CLASS);
            const savedSlot = localStorage.getItem(STORAGE_KEYS.SLOT);

            const activeTeacher = (queryTeacher && names.includes(queryTeacher))
              ? queryTeacher
              : (savedTeacher && names.includes(savedTeacher) ? savedTeacher : '');

            if (activeTeacher) {
              setTeacherName(activeTeacher);
              const teacherRes = await fetch(`/api/teachers?name=${encodeURIComponent(activeTeacher)}`);
              const teacherData = await teacherRes.json();
              if (teacherData.success && isMounted) {
                const currentTeacher: TeacherData = teacherData.data;
                setTeacher(currentTeacher);

                const classesTaught = Array.from(
                  new Set(
                    currentTeacher.slots
                      .flatMap((slot: TimetableSlot) =>
                        slot.class ? slot.class.split(',').map(c => c.trim()) : []
                      )
                      .filter(Boolean)
                  )
                ).sort();

                if (!queryTeacher && savedClass && classesTaught.includes(savedClass)) {
                  setClassName(savedClass);
                  if (savedSlot) {
                    setSourceKey(savedSlot);
                  }
                }
              }
            }
          }
        }
      } catch {
        if (isMounted) {
          setMessage('Gagal memuatkan senarai pensyarah dari sistem.');
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Extract classes that THIS specific teacher actually teaches
  const classesTaughtByTeacher = useMemo(() => {
    if (!teacher || !teacher.slots) return [];
    const classSet = new Set<string>();
    teacher.slots.forEach((slot: TimetableSlot) => {
      if (slot.class) {
        slot.class.split(',').forEach((c: string) => {
          const trimmed = c.trim();
          if (trimmed) classSet.add(trimmed);
        });
      }
    });
    return Array.from(classSet).sort();
  }, [teacher]);

  // 3. Extract slots that this teacher teaches for the selected class
  const classSlotsForTeacher = useMemo(() => {
    if (!teacher || !className) return [];
    const matchingSlots = teacher.slots.filter((slot: TimetableSlot) => {
      if (!slot.class) return false;
      const classList = slot.class.split(',').map((c: string) => c.trim());
      return classList.includes(className);
    });

    const seen = new Set<string>();
    const uniqueSlots: TimetableSlot[] = [];

    matchingSlots.forEach((slot: TimetableSlot) => {
      const key = `${slot.day}-${slot.time}-${slot.timeEnd}-${slot.subject}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSlots.push(slot);
      }
    });

    return uniqueSlots;
  }, [teacher, className]);

  // Handle Lecturer Selection
  const handleTeacherChange = async (name: string) => {
    setTeacherName(name);
    setClassName('');
    setSourceKey('');
    setResult(null);
    setActiveSlotOption(null);
    setMessage('');

    if (typeof window !== 'undefined') {
      if (name) {
        localStorage.setItem(STORAGE_KEYS.TEACHER, name);
        localStorage.removeItem(STORAGE_KEYS.CLASS);
        localStorage.removeItem(STORAGE_KEYS.SLOT);
      } else {
        localStorage.removeItem(STORAGE_KEYS.TEACHER);
        localStorage.removeItem(STORAGE_KEYS.CLASS);
        localStorage.removeItem(STORAGE_KEYS.SLOT);
        setTeacher(null);
        return;
      }
    }

    if (!name) {
      setTeacher(null);
      return;
    }

    setLoadingTeacher(true);
    try {
      const response = await fetch(`/api/teachers?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      if (data.success) {
        setTeacher(data.data);
      } else {
        setMessage(data.message || 'Gagal mengambil maklumat jadual pensyarah.');
      }
    } catch {
      setMessage('Ralat rangkaian semasa memuatkan data pensyarah.');
    } finally {
      setLoadingTeacher(false);
    }
  };

  // Handle Class Selection
  const handleClassChange = (selectedName: string) => {
    setClassName(selectedName);
    setSourceKey('');
    setResult(null);
    setActiveSlotOption(null);
    setMessage('');

    if (typeof window !== 'undefined') {
      if (selectedName) {
        localStorage.setItem(STORAGE_KEYS.CLASS, selectedName);
        localStorage.removeItem(STORAGE_KEYS.SLOT);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CLASS);
        localStorage.removeItem(STORAGE_KEYS.SLOT);
      }
    }

    // Auto-select if single slot
    if (teacher && selectedName) {
      const slots = teacher.slots.filter((slot: TimetableSlot) => {
        if (!slot.class) return false;
        return slot.class.split(',').map((c: string) => c.trim()).includes(selectedName);
      });
      if (slots.length === 1) {
        const singleSlot = slots[0];
        const key = `${singleSlot.day}-${singleSlot.time}-${singleSlot.timeEnd}-${singleSlot.subject}`;
        setSourceKey(key);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.SLOT, key);
        }
      }
    }
  };

  // Handle Slot Selection
  const handleSlotChange = (key: string) => {
    setSourceKey(key);
    setResult(null);
    setActiveSlotOption(null);
    setMessage('');

    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem(STORAGE_KEYS.SLOT, key);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SLOT);
      }
    }
  };

  // Reset entire selection
  const handleReset = () => {
    setTeacherName('');
    setTeacher(null);
    setClassName('');
    setSourceKey('');
    setResult(null);
    setActiveSlotOption(null);
    setMessage('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TEACHER);
      localStorage.removeItem(STORAGE_KEYS.CLASS);
      localStorage.removeItem(STORAGE_KEYS.SLOT);
    }
  };

  const selectedSourceSlot = useMemo(() => {
    if (!sourceKey || !classSlotsForTeacher.length) return null;
    return (
      classSlotsForTeacher.find(
        (slot: TimetableSlot) =>
          `${slot.day}-${slot.time}-${slot.timeEnd}-${slot.subject}` === sourceKey
      ) || null
    );
  }, [sourceKey, classSlotsForTeacher]);

  const sourceDurationHours = useMemo(() => {
    if (!selectedSourceSlot) return 1;
    const diff = (timeToMinutes(selectedSourceSlot.timeEnd) - timeToMinutes(selectedSourceSlot.time)) / 60;
    return Math.max(1, Math.round(diff));
  }, [selectedSourceSlot]);

  // Execute replacement check
  const checkOptions = async () => {
    if (!teacher || !className || !selectedSourceSlot) return;
    setLoading(true);
    setMessage('');
    setResult(null);
    setActiveSlotOption(null);

    try {
      const response = await fetch('/api/replacement/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher: teacher.name,
          class_name: className,
          source_day: selectedSourceSlot.day,
          source_time: selectedSourceSlot.time,
          source_time_end: selectedSourceSlot.timeEnd,
          classroom: selectedSourceSlot.classroom || '',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Gagal menyemak slot ganti.');
      }
      setResult(data.data);
      setDurationFilter('match_source');

      // Auto-select first available slot if present
      if (data.data.available.length > 0) {
        const firstAvail = data.data.available[0];
        setActiveSlotOption(firstAvail);
        const validRooms = getFilteredRooms(firstAvail.rooms);
        setSelectedRoomName(validRooms[0]?.name || '');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyemak pilihan slot ganti.');
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms for a slot based on room filters
  const getFilteredRooms = (rooms?: RoomOption[]) => {
    if (!rooms) return [];
    return rooms.filter(room => {
      if (excludeOnline && room.isOnline) return false;
      if (roomCategoryFilter !== 'all' && room.category !== roomCategoryFilter) return false;
      if (roomSearchQuery.trim()) {
        return room.name.toLowerCase().includes(roomSearchQuery.toLowerCase().trim());
      }
      return true;
    });
  };

  // Map Available and Conflicts into Matrix Lookup: day -> time -> option
  const matrixData = useMemo(() => {
    if (!result) return null;

    const targetDuration =
      durationFilter === 'match_source'
        ? result.source.durationHours || sourceDurationHours
        : durationFilter === 'all'
        ? null
        : parseInt(durationFilter, 10);

    const availableMap: Record<string, Record<string, ReplacementOption>> = {};
    const conflictMap: Record<string, Record<string, ReplacementOption>> = {};

    DAYS.forEach(day => {
      availableMap[day] = {};
      conflictMap[day] = {};
    });

    // Populate available
    result.available.forEach(opt => {
      if (targetDuration === null || (opt.durationHours || 1) === targetDuration) {
        if (availableMap[opt.day]) {
          availableMap[opt.day][opt.time] = opt;
        }
      }
    });

    // Populate conflicts
    result.conflicts.forEach(opt => {
      if (targetDuration === null || (opt.durationHours || 1) === targetDuration) {
        if (conflictMap[opt.day]) {
          conflictMap[opt.day][opt.time] = opt;
        }
      }
    });

    return { availableMap, conflictMap };
  }, [result, durationFilter, sourceDurationHours]);

  // Handle user clicking a slot cell
  const handleSelectSlot = (option: ReplacementOption) => {
    setActiveSlotOption(option);
    const validRooms = getFilteredRooms(option.rooms);
    setSelectedRoomName(validRooms[0]?.name || '');

    // Smooth scroll into details panel
    setTimeout(() => {
      detailsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Copy slot summary details for WhatsApp / Memo
  const handleCopyMemo = () => {
    if (!selectedSourceSlot || !teacher || !activeSlotOption) return;
    const roomToUse = selectedRoomName || (getFilteredRooms(activeSlotOption.rooms)[0]?.name ?? 'Bilik Kosong');
    const text = [
      `[CADANGAN KELAS GANTI]`,
      `• Pensyarah: ${teacher.name}`,
      `• Kelas: ${className}`,
      `• Subjek: ${selectedSourceSlot.subject}`,
      `• Slot Asal: ${formatSlot(selectedSourceSlot)} (${selectedSourceSlot.classroom || 'Bilik Asal'})`,
      `• Slot Ganti: ${DAY_LABELS[activeSlotOption.day] || activeSlotOption.day}, ${formatTime(activeSlotOption.time)} – ${formatTime(activeSlotOption.timeEnd)} (${activeSlotOption.periodLabel || ''})`,
      `• Bilik: ${roomToUse}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => {
      setCopiedSuccess(false);
    }, 2000);
  };

  const canSubmit = Boolean(teacher && className && selectedSourceSlot && !loading);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#3f8ceb] animate-pulse" />
            <span>Penjana Kelas Ganti Pintar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Cari Kelas Ganti & Bilik Kosong
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Pilih pensyarah dan kelas untuk menyemak slot waktu lapang pada jadual matriks mingguan tanpa pertembungan waktu.
          </p>
        </div>

        {(teacherName || className || sourceKey) && (
          <button
            onClick={handleReset}
            className="self-start sm:self-auto text-xs font-semibold text-slate-700 hover:text-slate-950 px-4 py-2 rounded-xl border border-slate-900 bg-transparent hover:bg-slate-900 hover:text-white hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            Set Semula Pilihan
          </button>
        )}
      </div>

      {/* Step Workflow Guide Card - Gaya Apple Minimal */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#3f8ceb] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            1→2
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Aliran Kerja 2 Langkah:</span>
              <span className="text-[11px] font-semibold text-[#3f8ceb] bg-sky-50 px-2.5 py-0.5 rounded-full">
                Langkah 1: Jadual Pensyarah → Langkah 2: Cari Kelas Ganti
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Belum pasti slot mana hendak diganti? Semak jadual pensyarah dahulu untuk melihat jadual penuh 10 waktu.
            </p>
          </div>
        </div>
        <Link
          href="/teachers"
          className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:scale-[1.02] transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>🔍 Buka Jadual Pensyarah</span>
        </Link>
      </div>

      {/* Step 1-2-3 Selection Form - Gaya Apple Minimal */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-950">
            Pilih Slot Kelas Asal
          </h2>
          {typeof window !== 'undefined' && (teacherName || className) && (
            <span className="text-xs font-medium text-slate-400">
              Pilihan diingati dalam pelayar
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Lecturer Select */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-teacher" className="text-xs font-semibold text-slate-800">
                1. Nama Pensyarah
              </label>
              <Link
                href="/teachers"
                className="text-[11px] text-[#3f8ceb] hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>🔍 Jadual Penuh</span>
              </Link>
            </div>
            <select
              id="select-teacher"
              value={teacherName}
              onChange={e => handleTeacherChange(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer"
            >
              <option value="">Pilih Pensyarah</option>
              {teacherNames.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {loadingTeacher && (
              <p className="text-[11px] text-slate-400">
                Memuatkan jadual pensyarah...
              </p>
            )}
          </div>

          {/* Step 2: Class Select */}
          <div className="space-y-1.5">
            <label htmlFor="select-class" className="text-xs font-semibold text-slate-800">
              2. Kelas yang Diajar
            </label>
            <select
              id="select-class"
              value={className}
              onChange={e => handleClassChange(e.target.value)}
              disabled={!teacher || classesTaughtByTeacher.length === 0}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="">
                {!teacher
                  ? 'Pilih pensyarah dahulu'
                  : classesTaughtByTeacher.length === 0
                  ? 'Tiada kelas ditemui'
                  : 'Pilih Kod Kelas'}
              </option>
              {classesTaughtByTeacher.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Slot selection */}
          <div className="space-y-1.5">
            <label htmlFor="select-slot" className="text-xs font-semibold text-slate-800">
              3. Sesi Kelas Asal
            </label>
            <select
              id="select-slot"
              value={sourceKey}
              onChange={e => handleSlotChange(e.target.value)}
              disabled={!className || classSlotsForTeacher.length === 0}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="">
                {!className ? 'Pilih kelas dahulu' : 'Pilih slot waktu'}
              </option>
              {classSlotsForTeacher.map((slot: TimetableSlot) => {
                const key = `${slot.day}-${slot.time}-${slot.timeEnd}-${slot.subject}`;
                return (
                  <option key={key} value={key}>
                    {formatSlot(slot)} · {slot.subject} {slot.classroom ? `(${slot.classroom})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Source Slot Context Display */}
        {selectedSourceSlot && (
          <div className="rounded-2xl bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{selectedSourceSlot.subject}</span>
                <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-md shadow-2xs">
                  Tempoh Asal: {sourceDurationHours} Jam
                </span>
              </div>
              <div className="text-slate-500 flex flex-wrap items-center gap-x-2">
                <span>{formatSlot(selectedSourceSlot)}</span>
                <span>•</span>
                <span>Kelas: {className}</span>
                {selectedSourceSlot.classroom && (
                  <>
                    <span>•</span>
                    <span>Bilik Asal: {selectedSourceSlot.classroom}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={checkOptions}
            disabled={!canSubmit}
            className="h-10 px-6 bg-[#3f8ceb] hover:bg-[#3280e2] text-white rounded-xl text-xs font-semibold shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Menyemak Jadual...' : 'Cari Pilihan Slot Ganti →'}
          </button>

          {message && (
            <p className="text-xs text-rose-600 font-medium">
              {message}
            </p>
          )}
        </div>
      </section>

      {/* Results Section */}
      {result && matrixData && (
        <section className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Jadual Ketersediaan Slot Mingguan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {result.available.length} slot lapang ditemui sepanjang minggu Isnin – Jumaat
                </p>
              </div>

              {/* View Switcher & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={durationFilter}
                  onChange={e => setDurationFilter(e.target.value)}
                  className="h-9 px-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3f8ceb]"
                >
                  <option value="match_source">
                    Ikut Asal ({result.source.durationHours || sourceDurationHours} Jam)
                  </option>
                  <option value="1">1 Jam</option>
                  <option value="2">2 Jam</option>
                  <option value="3">3 Jam</option>
                  <option value="all">Semua Durasi</option>
                </select>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                      viewMode === 'matrix'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    Jadual Matriks
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                      viewMode === 'list'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    Senarai Ringkas
                  </button>
                </div>
              </div>
            </div>

            {/* FORMAT JADUAL MATRIKS MINGGUAN GAYA APPLE (1px Outline to Fill) */}
            {viewMode === 'matrix' && (
              <div className="overflow-x-auto p-1">
                <table className="w-full text-center border-separate border-spacing-2 text-xs min-w-[920px]">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 w-28 font-extrabold text-center text-xs uppercase tracking-wider text-slate-700 bg-slate-50 rounded-2xl">
                        Hari
                      </th>
                      {PERIODS.map(p => (
                        <th
                          key={p.period}
                          className="p-3 bg-slate-50 rounded-2xl font-medium"
                        >
                          <div className="font-extrabold text-slate-900 text-xs">
                            Waktu {p.period}
                          </div>
                          <div className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">
                            {p.start.slice(0, 2)}:00 – {p.end.slice(0, 2)}:00
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => {
                      return (
                        <tr key={day}>
                          {/* Day Row Header */}
                          <td className="px-4 py-3 bg-slate-50 rounded-2xl align-middle text-center whitespace-nowrap w-28">
                            <div className="font-black text-slate-950 text-xs uppercase">
                              {DAY_LABELS[day] || day}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {day}
                            </div>
                          </td>

                          {/* 10 Period Cells */}
                          {PERIODS.map(p => {
                            const availSlot = matrixData.availableMap[day]?.[p.start];
                            const conflictSlot = matrixData.conflictMap[day]?.[p.start];
                            const isSource =
                              selectedSourceSlot?.day.toLowerCase() === day.toLowerCase() &&
                              selectedSourceSlot?.time === p.start;
                            const isFridayMentor = day === 'Friday' && (p.period === 3 || p.period === 4);
                            const isSelectedActive =
                              activeSlotOption?.day === day && activeSlotOption?.time === p.start;

                            // 1. Available Slot Cell (Gaya Apple 1px Outline to Fill)
                            if (availSlot) {
                              const validRooms = getFilteredRooms(availSlot.rooms);
                              return (
                                <td
                                  key={p.period}
                                  onClick={() => handleSelectSlot(availSlot)}
                                  className="p-0 align-middle"
                                  title={`Klik untuk pilih slot ${DAY_LABELS[day]} Waktu ${p.period}`}
                                >
                                  <div
                                    className={`rounded-2xl p-2.5 min-h-[64px] transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                                      isSelectedActive
                                        ? 'bg-[#3f8ceb] text-white shadow-lg shadow-sky-500/20 scale-[1.03]'
                                        : 'bg-white border border-[#3f8ceb] text-[#3f8ceb] hover:bg-[#3f8ceb] hover:text-white hover:scale-[1.02] shadow-2xs group'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1 font-extrabold text-[11px] tracking-tight">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          isSelectedActive ? 'bg-white' : 'bg-[#3f8ceb] group-hover:bg-white'
                                        }`}
                                      />
                                      <span>{isSelectedActive ? 'DIPILIH' : 'LAPANG'}</span>
                                    </div>

                                    <div
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg mt-1 transition-colors ${
                                        isSelectedActive
                                          ? 'bg-white/20 text-white'
                                          : 'bg-slate-50 text-[#3f8ceb] group-hover:bg-white/20 group-hover:text-white'
                                      }`}
                                    >
                                      {validRooms.length} bilik
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            // 2. Source Slot Cell
                            if (isSource) {
                              return (
                                <td key={p.period} className="p-0 align-middle">
                                  <div className="bg-slate-950 text-white rounded-2xl p-2.5 min-h-[64px] flex flex-col items-center justify-center shadow-xs">
                                    <span className="font-bold text-[11px] text-white">Slot Asal</span>
                                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">Diganti</span>
                                  </div>
                                </td>
                              );
                            }

                            // 3. Special: Mentor Mentee on Friday
                            if (isFridayMentor && conflictSlot) {
                              return (
                                <td key={p.period} className="p-0 align-middle">
                                  <div className="bg-slate-100 rounded-2xl p-2.5 min-h-[64px] flex flex-col items-center justify-center text-slate-600 text-[10px] leading-tight">
                                    <span className="font-bold text-slate-800">Mentor</span>
                                    <span className="font-bold text-slate-800">Mentee</span>
                                  </div>
                                </td>
                              );
                            }

                            // 4. Conflict Cell
                            if (conflictSlot) {
                              const reasonText = conflictSlot.reasons?.[0]?.message || 'Ada Kelas';
                              return (
                                <td key={p.period} className="p-0 align-middle" title={reasonText}>
                                  <div className="bg-slate-50 rounded-2xl p-2.5 min-h-[64px] flex flex-col items-center justify-center text-slate-400 text-[10px] leading-tight opacity-70">
                                    <span className="truncate max-w-[76px] font-medium text-slate-600">
                                      {reasonText.replace('Pensyarah', 'Pensy.')}
                                    </span>
                                  </div>
                                </td>
                              );
                            }

                            // 5. Empty / Out of bounds
                            return (
                              <td key={p.period} className="p-0 align-middle">
                                <div className="bg-slate-50/50 rounded-2xl min-h-[64px]" />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* FORMAT SENARAI RINGKAS (LIST VIEW) */}
            {viewMode === 'list' && (
              <div className="rounded-2xl overflow-hidden bg-slate-50 p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-600 font-bold">
                      <th className="p-3">Hari</th>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Tempoh</th>
                      <th className="p-3">Bilik Kosong</th>
                      <th className="p-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {result.available.map((opt, idx) => {
                      const validRooms = getFilteredRooms(opt.rooms);
                      const isSelected =
                        activeSlotOption?.day === opt.day && activeSlotOption?.time === opt.time;
                      return (
                        <tr
                          key={idx}
                          onClick={() => handleSelectSlot(opt)}
                          className={`hover:bg-white rounded-xl transition-all cursor-pointer ${
                            isSelected ? 'bg-white font-bold shadow-sm' : ''
                          }`}
                        >
                          <td className="p-3 font-semibold text-slate-900">{DAY_LABELS[opt.day] || opt.day}</td>
                          <td className="p-3 font-semibold text-slate-800">{formatTime(opt.time)} – {formatTime(opt.timeEnd)}</td>
                          <td className="p-3 text-slate-500">{opt.periodLabel}</td>
                          <td className="p-3 text-[#3f8ceb] font-semibold">{validRooms.length} bilik fizikal</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleSelectSlot(opt); }}
                              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-black hover:scale-[1.02] transition-all cursor-pointer"
                            >
                              Pilih
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* EXPANDABLE DETAILS & ROOM SELECTOR PANEL (Gaya Apple Minimal) */}
            {activeSlotOption && (
              <div
                ref={detailsPanelRef}
                className="mt-6 p-6 sm:p-8 rounded-3xl bg-slate-50 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#3f8ceb] bg-sky-100/70 px-3 py-1 rounded-full">
                      ✓ Slot Dipilih
                    </span>
                    <h3 className="text-base font-extrabold text-slate-950 mt-1">
                      {DAY_LABELS[activeSlotOption.day] || activeSlotOption.day}, {formatTime(activeSlotOption.time)} – {formatTime(activeSlotOption.timeEnd)} ({activeSlotOption.periodLabel})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyMemo}
                      className="h-10 px-5 bg-[#3f8ceb] hover:bg-[#3280e2] text-white rounded-xl text-xs font-semibold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>{copiedSuccess ? '✓ Berjaya Disalin!' : 'Salin Mesej WhatsApp/Memo'}</span>
                    </button>
                  </div>
                </div>

                {/* Room Selector Inside Panel */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800">
                      Pilih Bilik Kosong ({getFilteredRooms(activeSlotOption.rooms).length} pilihan):
                    </span>

                    <div className="flex items-center gap-2">
                      <select
                        value={roomCategoryFilter}
                        onChange={e => setRoomCategoryFilter(e.target.value)}
                        className="h-8 px-2.5 bg-white rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3f8ceb]"
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="lab">Makmal Komputer</option>
                        <option value="lecture">Bilik Kuliah</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Cari bilik..."
                        value={roomSearchQuery}
                        onChange={e => setRoomSearchQuery(e.target.value)}
                        className="h-8 px-3 bg-white rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3f8ceb] w-32"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 bg-white rounded-2xl shadow-2xs">
                    {getFilteredRooms(activeSlotOption.rooms).length === 0 ? (
                      <span className="text-xs text-slate-400 p-2">Tiada bilik fizikal sepadan.</span>
                    ) : (
                      getFilteredRooms(activeSlotOption.rooms).map(room => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoomName(room.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedRoomName === room.name
                              ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {room.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Preview of Memo */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-2xs text-xs text-slate-700 space-y-1.5">
                  <div className="font-extrabold text-slate-950">[CADANGAN KELAS GANTI]</div>
                  <div>• Pensyarah: {teacher?.name}</div>
                  <div>• Kelas: {className}</div>
                  <div>• Subjek: {selectedSourceSlot?.subject}</div>
                  <div>• Slot Asal: {selectedSourceSlot ? formatSlot(selectedSourceSlot) : ''}</div>
                  <div>• Slot Ganti: {DAY_LABELS[activeSlotOption.day] || activeSlotOption.day}, {formatTime(activeSlotOption.time)} – {formatTime(activeSlotOption.timeEnd)} ({activeSlotOption.periodLabel})</div>
                  <div>• Bilik: <span className="font-bold text-slate-950">{selectedRoomName || 'Bilik Kosong'}</span></div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
