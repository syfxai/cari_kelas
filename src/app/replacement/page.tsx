'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import {
  DAY_LABELS,
  DAYS,
  type MultiPlannedSlotItem,
  type ReplacementOption,
  type ReplacementResult,
  type RoomOption,
  type SmartSuggestionOption,
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
  const [autoPlanningLoading, setAutoPlanningLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Mode: 'single' (Standard 1 Class) or 'multi' (Advance Multi-Class Planner)
  const [plannerMode, setPlannerMode] = useState<'single' | 'multi'>('single');

  // Multi-Class Planning States
  const [selectedMultiKeys, setSelectedMultiKeys] = useState<string[]>([]);
  const [multiPlans, setMultiPlans] = useState<Record<string, MultiPlannedSlotItem>>({});

  // View & Filter States (Single Mode)
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [durationFilter, setDurationFilter] = useState<string>('match_source');
  const [excludeOnline, setExcludeOnline] = useState<boolean>(true);
  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>('all');
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>('');

  // Selected / Expanded Slot State (Single Mode)
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

  // 3. Extract unique slots for this teacher (used in multi-planner)
  const allTeacherSlots = useMemo(() => {
    if (!teacher || !teacher.slots) return [];
    const seen = new Set<string>();
    const list: TimetableSlot[] = [];
    teacher.slots.forEach((slot: TimetableSlot) => {
      const key = `${slot.day}-${slot.time}-${slot.timeEnd}-${slot.subject}-${slot.class}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(slot);
      }
    });
    return list;
  }, [teacher]);

  // 4. Extract slots that this teacher teaches for the selected class (single mode)
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
    setSelectedMultiKeys([]);
    setMultiPlans({});
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
    setSelectedMultiKeys([]);
    setMultiPlans({});
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

  // Execute replacement check (Single Mode)
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

  // Copy slot summary details for WhatsApp / Memo (Single Mode)
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

  // ==================== MULTI-CLASS PLANNER HANDLERS ====================

  // Auto-distribute slots intelligently via API
  const applySmartDistribution = async (slotsToPlan: TimetableSlot[]) => {
    if (!teacher || slotsToPlan.length === 0) {
      setSelectedMultiKeys([]);
      setMultiPlans({});
      return;
    }

    setAutoPlanningLoading(true);
    try {
      const res = await fetch('/api/replacement/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher: teacher.name,
          slots: slotsToPlan,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMultiPlans(data.data);
        const keys = slotsToPlan.map(
          s => `${s.day}-${s.time}-${s.timeEnd}-${s.subject}-${s.class}`
        );
        setSelectedMultiKeys(keys);
      }
    } catch (err) {
      console.error('Smart distribution error:', err);
    } finally {
      setAutoPlanningLoading(false);
    }
  };

  const toggleMultiSlotSelection = (slot: TimetableSlot) => {
    const key = `${slot.day}-${slot.time}-${slot.timeEnd}-${slot.subject}-${slot.class}`;
    if (selectedMultiKeys.includes(key)) {
      const nextKeys = selectedMultiKeys.filter(k => k !== key);
      setSelectedMultiKeys(nextKeys);
      setMultiPlans(old => {
        const copy = { ...old };
        delete copy[key];
        return copy;
      });
    } else {
      const currentSelectedSlots = allTeacherSlots.filter(s => {
        const k = `${s.day}-${s.time}-${s.timeEnd}-${s.subject}-${s.class}`;
        return selectedMultiKeys.includes(k);
      });
      const newSelectedSlots = [...currentSelectedSlots, slot];
      applySmartDistribution(newSelectedSlots);
    }
  };

  const selectAllTeacherSlots = () => {
    applySmartDistribution(allTeacherSlots);
  };

  const clearAllMultiSelections = () => {
    setSelectedMultiKeys([]);
    setMultiPlans({});
  };

  const applySuggestionToSlot = (key: string, suggestion: SmartSuggestionOption) => {
    setMultiPlans(prev => {
      const current = prev[key];
      if (!current) return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          targetDay: suggestion.day,
          targetPeriod: suggestion.period,
          durationHours: suggestion.durationHours,
          targetTimeStart: suggestion.timeStart,
          targetTimeEnd: suggestion.timeEnd,
          targetRoom: suggestion.roomName,
          availableRooms: suggestion.availableRooms,
        },
      };
    });
  };

  const fetchRoomsForMultiItem = async (
    key: string,
    dayOverride?: string,
    startOverride?: string,
    endOverride?: string
  ) => {
    const item = multiPlans[key];
    if (!item) return;

    const day = dayOverride || item.targetDay;
    const start = startOverride || item.targetTimeStart;
    const end = endOverride || item.targetTimeEnd;

    setMultiPlans(prev => ({
      ...prev,
      [key]: { ...prev[key], loadingRooms: true },
    }));

    try {
      const res = await fetch(
        `/api/rooms?day=${encodeURIComponent(day)}&time=${encodeURIComponent(
          start
        )}&time_end=${encodeURIComponent(end)}`
      );
      const data = await res.json();
      if (data.success && data.data) {
        const targetCat = item.originalCategory;
        const allAvail = (data.data.available || []).map((r: any) => ({
          id: r.id || r.name,
          name: r.name,
          category: r.category,
          isOnline: r.isOnline,
        }));

        const matching = allAvail.filter((r: any) => {
          if (targetCat === 'lab') return r.category === 'lab';
          if (targetCat === 'lecture') return r.category === 'lecture';
          if (targetCat === 'online') return r.isOnline;
          return true;
        });

        const finalRooms = matching.length > 0 ? matching : allAvail;

        setMultiPlans(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            availableRooms: finalRooms,
            loadingRooms: false,
            targetRoom:
              finalRooms.length > 0 &&
              !finalRooms.some((r: any) => r.name === prev[key]?.targetRoom)
                ? finalRooms[0].name
                : prev[key]?.targetRoom,
          },
        }));
      }
    } catch {
      setMultiPlans(prev => ({
        ...prev,
        [key]: { ...prev[key], loadingRooms: false },
      }));
    }
  };

  const updateMultiPlanField = (
    key: string,
    field: 'targetDay' | 'targetPeriod' | 'durationHours' | 'targetRoom',
    val: any
  ) => {
    setMultiPlans(prev => {
      const current = prev[key];
      if (!current) return prev;

      const updated = { ...current, [field]: val };
      if (field === 'targetPeriod' || field === 'durationHours') {
        const periodNum = field === 'targetPeriod' ? Number(val) : current.targetPeriod;
        const duration = field === 'durationHours' ? Number(val) : current.durationHours;
        const startH = periodNum + 7;
        const endH = startH + duration;
        updated.targetTimeStart = `${String(startH).padStart(2, '0')}:00`;
        updated.targetTimeEnd = `${String(endH).padStart(2, '0')}:00`;
      }
      return { ...prev, [key]: updated };
    });

    if (field === 'targetDay' || field === 'targetPeriod' || field === 'durationHours') {
      const current = multiPlans[key];
      if (current) {
        const periodNum = field === 'targetPeriod' ? Number(val) : current.targetPeriod;
        const duration = field === 'durationHours' ? Number(val) : current.durationHours;
        const startH = periodNum + 7;
        const endH = startH + duration;
        const startStr = `${String(startH).padStart(2, '0')}:00`;
        const endStr = `${String(endH).padStart(2, '0')}:00`;
        const dayStr = field === 'targetDay' ? String(val) : current.targetDay;
        fetchRoomsForMultiItem(key, dayStr, startStr, endStr);
      }
    }
  };

  // Cross-collision checks for planned items
  const multiPlanCollisions = useMemo(() => {
    const collisions: Record<string, string[]> = {};
    selectedMultiKeys.forEach(key => {
      collisions[key] = [];
    });

    for (let i = 0; i < selectedMultiKeys.length; i++) {
      const keyA = selectedMultiKeys[i];
      const planA = multiPlans[keyA];
      if (!planA) continue;

      const aStart = timeToMinutes(planA.targetTimeStart);
      const aEnd = timeToMinutes(planA.targetTimeEnd);

      // 1. Check with other planned items
      for (let j = i + 1; j < selectedMultiKeys.length; j++) {
        const keyB = selectedMultiKeys[j];
        const planB = multiPlans[keyB];
        if (!planB) continue;

        if (planA.targetDay === planB.targetDay) {
          const bStart = timeToMinutes(planB.targetTimeStart);
          const bEnd = timeToMinutes(planB.targetTimeEnd);

          if (aStart < bEnd && aEnd > bStart) {
            collisions[keyA].push(`Pertembungan waktu dengan kelas ${planB.sourceSlot.class}`);
            collisions[keyB].push(`Pertembungan waktu dengan kelas ${planA.sourceSlot.class}`);
          }
          if (
            planA.targetRoom &&
            planB.targetRoom &&
            planA.targetRoom === planB.targetRoom &&
            aStart < bEnd &&
            aEnd > bStart
          ) {
            collisions[keyA].push(`Pertembungan bilik (${planA.targetRoom})`);
            collisions[keyB].push(`Pertembungan bilik (${planB.targetRoom})`);
          }
        }
      }

      // 2. Check with teacher's other unreplaced slots
      if (teacher && teacher.slots) {
        teacher.slots.forEach(slot => {
          const slotKey = `${slot.day}-${slot.time}-${slot.timeEnd}-${slot.subject}-${slot.class}`;
          if (!selectedMultiKeys.includes(slotKey) && slot.day === planA.targetDay) {
            const sStart = timeToMinutes(slot.time);
            const sEnd = timeToMinutes(slot.timeEnd || slot.time);
            if (aStart < sEnd && aEnd > sStart) {
              collisions[keyA].push(`Pensyarah ada kelas asal (${slot.subject} - ${slot.class})`);
            }
          }
        });
      }
    }

    return collisions;
  }, [selectedMultiKeys, multiPlans, teacher]);

  const totalCollisionsCount = useMemo(() => {
    return Object.values(multiPlanCollisions).reduce((acc, curr) => acc + curr.length, 0);
  }, [multiPlanCollisions]);

  // Export handlers
  const handlePrintSchedule = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!teacher || selectedMultiKeys.length === 0) return;
    const rows = [
      [
        'No',
        'Pensyarah',
        'Kod Kelas',
        'Subjek',
        'Hari Asal',
        'Masa Asal',
        'Bilik Asal',
        'Hari Ganti',
        'Masa Ganti',
        'Bilik Ganti',
        'Status',
      ],
      ...selectedMultiKeys.map((key, idx) => {
        const plan = multiPlans[key];
        if (!plan) return [];
        const slot = plan.sourceSlot;
        return [
          String(idx + 1),
          `"${teacher.name}"`,
          `"${slot.class}"`,
          `"${slot.subject}"`,
          `"${DAY_LABELS[slot.day] || slot.day}"`,
          `"${formatTime(slot.time)} - ${formatTime(slot.timeEnd)}"`,
          `"${slot.classroom || '-'}"`,
          `"${DAY_LABELS[plan.targetDay] || plan.targetDay}"`,
          `"${formatTime(plan.targetTimeStart)} - ${formatTime(plan.targetTimeEnd)}"`,
          `"${plan.targetRoom}"`,
          `"Disahkan"`,
        ];
      }).filter(r => r.length > 0),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Jadual_Ganti_${teacher.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMultiMemo = () => {
    if (!teacher || selectedMultiKeys.length === 0) return;
    const lines = [
      `📢 *[JADUAL KELAS GANTI BERGANDA - KPTM IPOH]*`,
      `*Pensyarah:* ${teacher.name}`,
      `*Tarikh Penjadualan:* ${new Date().toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
      `*Jumlah Kelas Ganti:* ${selectedMultiKeys.length} Sesi`,
      ``,
      ...selectedMultiKeys.map((key, idx) => {
        const plan = multiPlans[key];
        if (!plan) return '';
        const slot = plan.sourceSlot;
        return [
          `📌 *${idx + 1}. ${slot.class} — ${slot.subject}*`,
          `• *Slot Asal:* ${DAY_LABELS[slot.day] || slot.day}, ${formatTime(slot.time)} – ${formatTime(
            slot.timeEnd
          )} (${slot.classroom || 'Bilik Asal'})`,
          `• *Slot Ganti:* ${DAY_LABELS[plan.targetDay] || plan.targetDay}, ${formatTime(
            plan.targetTimeStart
          )} – ${formatTime(plan.targetTimeEnd)} (Waktu ${plan.targetPeriod})`,
          `• *Bilik Ganti:* ${plan.targetRoom}`,
          ``,
        ].join('\n');
      }),
      `Sila ambil perhatian kepada semua pelajar berkenaan. Terima kasih!`,
      `— *Kolej Poly-Tech MARA Ipoh*`,
    ];

    navigator.clipboard.writeText(lines.filter(Boolean).join('\n'));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const canSubmit = Boolean(teacher && className && selectedSourceSlot && !loading);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 print:hidden">
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

        {(teacherName || className || sourceKey || selectedMultiKeys.length > 0) && (
          <button
            onClick={handleReset}
            className="self-start sm:self-auto text-xs font-semibold text-slate-700 hover:text-slate-950 px-4 py-2 rounded-xl border border-slate-900 bg-transparent hover:bg-slate-900 hover:text-white hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            Set Semula Pilihan
          </button>
        )}
      </div>

      {/* Mode Switcher Toggle (Standard vs Lanjutan) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-2xs border border-slate-100 print:hidden">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setPlannerMode('single')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              plannerMode === 'single'
                ? 'bg-white text-slate-950 shadow-sm scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setPlannerMode('multi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              plannerMode === 'multi'
                ? 'bg-slate-900 text-white shadow-sm scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lanjutan
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          {plannerMode === 'single'
            ? 'Pilih 1 kelas asal & cari slot ganti terbaik'
            : 'Rancang beberapa kelas ganti serentak berserta muat turun jadual'}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ======================== 1. MOD STANDARD (SINGLE CLASS) ================== */}
      {/* ========================================================================= */}
      {plannerMode === 'single' && (
        <div className="space-y-8 print:hidden">
          {/* Step Workflow Guide Card */}
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

          {/* Step 1-2-3 Selection Form - 100% Perfectly Aligned Baseline */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Step 1: Lecturer Select */}
              <div className="space-y-1.5">
                <div className="h-5 flex items-center justify-between">
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
                <div className="h-5 flex items-center justify-between">
                  <label htmlFor="select-class" className="text-xs font-semibold text-slate-800">
                    2. Kelas yang Diajar
                  </label>
                </div>
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
                <div className="h-5 flex items-center justify-between">
                  <label htmlFor="select-slot" className="text-xs font-semibold text-slate-800">
                    3. Sesi Kelas Asal
                  </label>
                </div>
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

                {/* EXPANDABLE DETAILS & ROOM SELECTOR PANEL */}
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
      )}

      {/* ========================================================================= */}
      {/* =================== 2. MOD LANJUTAN (MULTI-CLASS PLANNER) ================ */}
      {/* ========================================================================= */}
      {plannerMode === 'multi' && (
        <div className="space-y-8 print:hidden">
          {/* Top Lecturer Selector for Multi-Planner */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-slate-950">
                  Langkah 1: Pilih Pensyarah
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih pensyarah untuk memuatkan senarai semua sesi kelas yang diajar.
                </p>
              </div>
              {teacher && (
                <span className="text-xs font-semibold text-[#3f8ceb] bg-sky-50 px-3 py-1 rounded-full">
                  {allTeacherSlots.length} sesi mengajar ditemui
                </span>
              )}
            </div>

            <div className="max-w-md space-y-1.5">
              <label htmlFor="multi-select-teacher" className="text-xs font-semibold text-slate-800">
                Nama Pensyarah
              </label>
              <select
                id="multi-select-teacher"
                value={teacherName}
                onChange={e => handleTeacherChange(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer"
              >
                <option value="">Pilih Pensyarah</option>
                {teacherNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Multi-Slot Picker Checkboxes */}
          {teacher && allTeacherSlots.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-slate-950">
                    Langkah 2: Pilih Sesi-Sesi Asal yang Ingin Diganti ({selectedMultiKeys.length} dipilih)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tandakan 2, 3, atau lebih kelas yang anda ingin susun jadual gantinya secara serentak.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllTeacherSlots}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                  {selectedMultiKeys.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllMultiSelections}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>
              </div>

              {/* Slot Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold">
                      <th className="py-3 px-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={allTeacherSlots.length > 0 && selectedMultiKeys.length === allTeacherSlots.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              selectAllTeacherSlots();
                            } else {
                              clearAllMultiSelections();
                            }
                          }}
                          className="w-4 h-4 rounded text-[#3f8ceb] focus:ring-0 cursor-pointer"
                          title="Pilih Semua"
                        />
                      </th>
                      <th className="py-3 px-4">Kod Kelas / Seksyen</th>
                      <th className="py-3 px-4">Subjek</th>
                      <th className="py-3 px-4">Hari & Waktu Asal</th>
                      <th className="py-3 px-4 text-center">Durasi</th>
                      <th className="py-3 px-4">Bilik Asal</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTeacherSlots.map((slot) => {
                      const key = `${slot.day}-${slot.time}-${slot.timeEnd}-${slot.subject}-${slot.class}`;
                      const isChecked = selectedMultiKeys.includes(key);
                      const diff = (timeToMinutes(slot.timeEnd) - timeToMinutes(slot.time)) / 60;
                      const duration = Math.max(1, Math.round(diff));

                      return (
                        <tr
                          key={key}
                          onClick={() => toggleMultiSlotSelection(slot)}
                          className={`cursor-pointer transition-colors select-none ${
                            isChecked
                              ? 'bg-sky-50/50 hover:bg-sky-50/80'
                              : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMultiSlotSelection(slot)}
                              className="w-4 h-4 rounded text-[#3f8ceb] focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {slot.class}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {slot.subject}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">{DAY_LABELS[slot.day] || slot.day}</span>, {formatTime(slot.time)} – {formatTime(slot.timeEnd)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md text-[11px]">
                              {duration} Jam
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[#3f8ceb] font-medium">
                              {slot.classroom || 'Bilik Asal'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isChecked ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3f8ceb] bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                                ✓ Dipilih
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Belum dipilih
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Step 3: Detailed Interactive Planner for Selected Slots */}
          {selectedMultiKeys.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-slate-950">
                      Langkah 3: Tetapkan Waktu & Bilik Ganti ({selectedMultiKeys.length} Sesi)
                    </h2>
                    {totalCollisionsCount === 0 ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        ✓ Bebas Pertembungan
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        ⚠️ {totalCollisionsCount} Pertembungan Dikesan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Sistem secara automatik mencadangkan slot bebas pertembungan dan memadankan jenis makmal/bilik mengikut kelas asal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const selectedSlots = allTeacherSlots.filter(s => {
                        const k = `${s.day}-${s.time}-${s.timeEnd}-${s.subject}-${s.class}`;
                        return selectedMultiKeys.includes(k);
                      });
                      applySmartDistribution(selectedSlots);
                    }}
                    disabled={autoPlanningLoading}
                    className="px-3.5 py-2 bg-[#3f8ceb] hover:bg-[#3280e2] text-white rounded-xl text-xs font-semibold shadow-xs hover:scale-[1.02] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{autoPlanningLoading ? 'Menyusun...' : '✨ Susun Semula Pintar'}</span>
                  </button>
                </div>
              </div>

              {/* Assignment Cards List */}
              <div className="space-y-4">
                {selectedMultiKeys.map((key, idx) => {
                  const plan = multiPlans[key];
                  if (!plan) return null;
                  const slot = plan.sourceSlot;
                  const collisions = multiPlanCollisions[key] || [];
                  const hasConflict = collisions.length > 0;
                  const isLab = plan.originalCategory === 'lab';
                  const isLecture = plan.originalCategory === 'lecture';
                  const isOnline = plan.originalCategory === 'online';

                  return (
                    <div
                      key={key}
                      className={`p-5 rounded-3xl border transition-all space-y-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] ${
                        hasConflict
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-slate-200/80 bg-white'
                      }`}
                    >
                      {/* Card Top: Original Info & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-950">
                            {slot.class} — {slot.subject}
                          </span>
                          <span className="text-xs text-slate-400">
                            (Asal: {DAY_LABELS[slot.day] || slot.day}, {formatTime(slot.time)} – {formatTime(slot.timeEnd)})
                          </span>
                          {/* Room Category Badge */}
                          {isLab && (
                            <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md">
                              🧪 Makmal: {slot.classroom || 'Makmal Asal'}
                            </span>
                          )}
                          {isLecture && (
                            <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md">
                              🏛️ Bilik Kuliah: {slot.classroom || 'Bilik Asal'}
                            </span>
                          )}
                          {isOnline && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                              🌐 Atas Talian
                            </span>
                          )}
                        </div>

                        {hasConflict ? (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span>⚠️ {collisions[0]}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span>✓ Bebas Pertembungan</span>
                          </span>
                        )}
                      </div>

                      {/* Quick Suggestions Chips Across Different Days */}
                      {plan.suggestions && plan.suggestions.length > 0 && (
                        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                              <span>💡 Cadangan {isLab ? 'Makmal' : 'Bilik'} Lapang Merentas Hari:</span>
                              <span className="text-[10px] font-medium text-slate-400">
                                ({plan.suggestions.length} hari alternatif)
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              Klik mana-mana cadangan untuk guna terus
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.suggestions.map((sug) => {
                              const isSelected = plan.targetDay === sug.day && plan.targetPeriod === sug.period;
                              return (
                                <button
                                  key={`${sug.day}-${sug.period}`}
                                  type="button"
                                  onClick={() => applySuggestionToSlot(key, sug)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.01]'
                                      : 'bg-white hover:bg-sky-50/60 text-slate-800 border-slate-200/80 hover:border-[#3f8ceb]'
                                  }`}
                                >
                                  <span>{DAY_LABELS[sug.day] || sug.day}, {formatTime(sug.timeStart)}</span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                    isSelected ? 'bg-slate-800 text-sky-300' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {sug.roomName}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Card Inputs: Target Day, Period/Time, Duration, and Room */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
                        {/* 1. Target Day */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Hari Ganti Baharu</label>
                          <select
                            value={plan.targetDay}
                            onChange={e => updateMultiPlanField(key, 'targetDay', e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                          >
                            {DAYS.map(d => (
                              <option key={d} value={d}>
                                {DAY_LABELS[d]}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Target Period / Start Time */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Waktu Mula Ganti</label>
                          <select
                            value={plan.targetPeriod}
                            onChange={e => updateMultiPlanField(key, 'targetPeriod', Number(e.target.value))}
                            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                          >
                            {PERIODS.map(p => (
                              <option key={p.period} value={p.period}>
                                Waktu {p.period} ({p.start.slice(0, 2)}:00)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Duration */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Tempoh Sesi</label>
                          <select
                            value={plan.durationHours}
                            onChange={e => updateMultiPlanField(key, 'durationHours', Number(e.target.value))}
                            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                          >
                            <option value={1}>1 Jam ({formatTime(plan.targetTimeStart)} - {formatTime(`${String(parseInt(plan.targetTimeStart.slice(0, 2), 10) + 1).padStart(2, '0')}:00`)})</option>
                            <option value={2}>2 Jam ({formatTime(plan.targetTimeStart)} - {formatTime(`${String(parseInt(plan.targetTimeStart.slice(0, 2), 10) + 2).padStart(2, '0')}:00`)})</option>
                            <option value={3}>3 Jam ({formatTime(plan.targetTimeStart)} - {formatTime(`${String(parseInt(plan.targetTimeStart.slice(0, 2), 10) + 3).padStart(2, '0')}:00`)})</option>
                          </select>
                        </div>

                        {/* 4. Target Room */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">
                              {isLab ? 'Makmal Komputer' : 'Bilik Ganti'}
                            </label>
                            <button
                              type="button"
                              onClick={() => fetchRoomsForMultiItem(key)}
                              className="text-[10px] font-bold text-[#3f8ceb] hover:underline"
                            >
                              {plan.loadingRooms ? 'Menyemak...' : '🔍 Semak Bilik'}
                            </button>
                          </div>
                          <select
                            value={plan.targetRoom}
                            onChange={e => updateMultiPlanField(key, 'targetRoom', e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                          >
                            {plan.availableRooms && plan.availableRooms.length > 0 ? (
                              plan.availableRooms.map(r => (
                                <option key={r.name} value={r.name}>
                                  ✓ {r.name} {r.category === 'lab' ? '(Makmal)' : r.category === 'lecture' ? '(Bilik Kuliah)' : ''}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value={slot.classroom || 'MAKMAL KOMPUTER 1-01'}>{slot.classroom || 'MAKMAL KOMPUTER 1-01'}</option>
                                <option value="MAKMAL KOMPUTER 1-01">MAKMAL KOMPUTER 1-01</option>
                                <option value="MAKMAL KOMPUTER 1-02">MAKMAL KOMPUTER 1-02</option>
                                <option value="MAKMAL KOMPUTER 2-03">MAKMAL KOMPUTER 2-03</option>
                                <option value="MAKMAL KOMPUTER 2-04">MAKMAL KOMPUTER 2-04</option>
                                <option value="MAKMAL KOMPUTER 3-07">MAKMAL KOMPUTER 3-07</option>
                                <option value="BILIK KULIAH 1-01">BILIK KULIAH 1-01</option>
                                <option value="BILIK KULIAH 2-03">BILIK KULIAH 2-03</option>
                                <option value="BILIK KULIAH 2-04">BILIK KULIAH 2-04</option>
                                <option value="ONLINE 51">ONLINE 51</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 4: Unified Visual Matrix Timetable for Multi-Class Plan */}
          {selectedMultiKeys.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-slate-950">
                    Langkah 4: Pratonton Visual Matriks Jadual Ganti
                  </h2>
                  <p className="text-xs text-slate-500">
                    Paparan visual di mana semua kelas ganti yang dirancang diletakkan pada grid mingguan.
                  </p>
                </div>
              </div>

              {/* Multi Matrix Timetable */}
              <div className="overflow-x-auto p-1">
                <table className="w-full text-left border-separate border-spacing-2 text-xs min-w-[1250px]">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 w-28 font-extrabold text-center text-xs uppercase tracking-wider text-slate-700 bg-slate-50 rounded-2xl">
                        Hari
                      </th>
                      {PERIODS.map(p => (
                        <th
                          key={p.period}
                          className="px-3 py-3 bg-slate-50 rounded-2xl font-medium text-center min-w-[115px]"
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
                    {DAYS.map(day => (
                      <tr key={day}>
                        <td className="px-4 py-3 bg-slate-50 rounded-2xl align-middle text-center whitespace-nowrap w-28">
                          <div className="font-black text-slate-950 text-xs uppercase">
                            {DAY_LABELS[day] || day}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {day}
                          </div>
                        </td>

                        {PERIODS.map(p => {
                          // Check if any planned item falls in this day & period
                          const matchingPlans = Object.values(multiPlans).filter(item => {
                            if (item.targetDay !== day) return false;
                            const itemStartP = item.targetPeriod;
                            const itemEndP = itemStartP + item.durationHours;
                            return p.period >= itemStartP && p.period < itemEndP;
                          });

                          if (matchingPlans.length > 0) {
                            const mainItem = matchingPlans[0];
                            const idx = selectedMultiKeys.indexOf(mainItem.key) + 1;
                            const hasConflict = (multiPlanCollisions[mainItem.key] || []).length > 0;

                            return (
                              <td key={p.period} className="p-0 align-top min-w-[115px]">
                                <div
                                  className={`rounded-2xl p-2.5 min-h-[75px] shadow-2xs border flex flex-col justify-between space-y-1 transition-all ${
                                    hasConflict
                                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                                      : 'bg-sky-50 border-[#3f8ceb]/50 text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-extrabold bg-[#3f8ceb] text-white px-2 py-0.5 rounded-md">
                                      Ganti #{idx}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-600 truncate">
                                      {mainItem.sourceSlot.class}
                                    </span>
                                  </div>
                                  <div className="font-bold text-[11px] truncate" title={mainItem.sourceSlot.subject}>
                                    {mainItem.sourceSlot.subject}
                                  </div>
                                  <div className="text-[10px] font-semibold text-[#3f8ceb] truncate">
                                    📍 {mainItem.targetRoom}
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={p.period} className="p-0 align-middle min-w-[115px]">
                              <div className="bg-slate-50/50 rounded-2xl min-h-[75px]" />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Step 5: Summary Table & Download Actions */}
          {selectedMultiKeys.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-slate-950">
                    Langkah 5: Ringkasan & Muat Turun Jadual Ganti
                  </h2>
                  <p className="text-xs text-slate-500">
                    Semak senarai penuh kelas ganti dan eksport ke pelbagai format dokumen rasmi atau salin memo.
                  </p>
                </div>

                {/* Export / Download Buttons Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handlePrintSchedule}
                    className="h-10 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>🖨️ Cetak / Simpan PDF</span>
                  </button>

                  <button
                    onClick={handleDownloadCSV}
                    className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>📊 Muat Turun CSV</span>
                  </button>

                  <button
                    onClick={handleCopyMultiMemo}
                    className="h-10 px-4 bg-[#3f8ceb] hover:bg-[#3280e2] text-white rounded-xl text-xs font-semibold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>{copiedSuccess ? '✓ Memo Disalin!' : '📋 Salin Memo WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Summary Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/80">
                      <th className="p-3 w-10 text-center">No</th>
                      <th className="p-3">Kumpulan Kelas</th>
                      <th className="p-3">Subjek</th>
                      <th className="p-3">Sesi Asal</th>
                      <th className="p-3">Sesi Ganti Baharu</th>
                      <th className="p-3">Bilik Ganti</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 bg-white">
                    {selectedMultiKeys.map((key, idx) => {
                      const plan = multiPlans[key];
                      if (!plan) return null;
                      const slot = plan.sourceSlot;
                      const hasConflict = (multiPlanCollisions[key] || []).length > 0;

                      return (
                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-bold text-center text-slate-900">{idx + 1}</td>
                          <td className="p-3 font-extrabold text-slate-900">{slot.class}</td>
                          <td className="p-3 text-slate-700 font-medium">{slot.subject}</td>
                          <td className="p-3 text-slate-500">
                            {DAY_LABELS[slot.day] || slot.day}, {formatTime(slot.time)} – {formatTime(slot.timeEnd)} ({slot.classroom || '-'})
                          </td>
                          <td className="p-3 font-semibold text-slate-900">
                            {DAY_LABELS[plan.targetDay] || plan.targetDay}, {formatTime(plan.targetTimeStart)} – {formatTime(plan.targetTimeEnd)} (Waktu {plan.targetPeriod})
                          </td>
                          <td className="p-3 font-bold text-[#3f8ceb]">{plan.targetRoom}</td>
                          <td className="p-3 text-center">
                            {hasConflict ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                ⚠️ Pertembungan
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                ✓ Sah
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ============ PRINT-ONLY OFFICIAL DOCUMENT TEMPLATE (A4 PRINT VIEW) ====== */}
      {/* ========================================================================= */}
      <div className="hidden print:block font-sans text-black p-8 max-w-4xl mx-auto space-y-6">
        {/* Official Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold uppercase tracking-wide">KOLEJ POLY-TECH MARA IPOH</h1>
            <h2 className="text-sm font-bold text-slate-800 uppercase">BORANG PENJADUALAN KELAS GANTI PENSYARAH</h2>
            <p className="text-xs text-slate-600">Sistem Pintar Cari Kelas & Penjadualan Akademik KPTM</p>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <div><strong>Tarikh Dicetak:</strong> {new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div><strong>Jumlah Sesi Ganti:</strong> {selectedMultiKeys.length > 0 ? selectedMultiKeys.length : (selectedSourceSlot ? 1 : 0)} Kelas</div>
          </div>
        </div>

        {/* Lecturer Details */}
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs grid grid-cols-2 gap-3">
          <div><strong>Nama Pensyarah:</strong> {teacher?.name || '-'}</div>
          <div><strong>Kampus / Kolej:</strong> KPTM Ipoh</div>
          <div><strong>Tarikh Sesi Ganti:</strong> Sepanjang Minggu / Sesi Semasa</div>
          <div><strong>Status Pengesahan:</strong> Dijana Secara Digital</div>
        </div>

        {/* Table of Classes */}
        <table className="w-full text-xs border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold">
              <th className="border border-slate-400 p-2 text-center w-8">No</th>
              <th className="border border-slate-400 p-2 text-left">Kumpulan Kelas</th>
              <th className="border border-slate-400 p-2 text-left">Subjek</th>
              <th className="border border-slate-400 p-2 text-left">Waktu & Bilik Asal</th>
              <th className="border border-slate-400 p-2 text-left">Waktu Ganti Baharu</th>
              <th className="border border-slate-400 p-2 text-left">Bilik Ganti</th>
            </tr>
          </thead>
          <tbody>
            {selectedMultiKeys.length > 0 ? (
              selectedMultiKeys.map((key, idx) => {
                const plan = multiPlans[key];
                if (!plan) return null;
                const slot = plan.sourceSlot;
                return (
                  <tr key={key}>
                    <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-400 p-2 font-bold">{slot.class}</td>
                    <td className="border border-slate-400 p-2">{slot.subject}</td>
                    <td className="border border-slate-400 p-2">{DAY_LABELS[slot.day] || slot.day}, {formatTime(slot.time)} - {formatTime(slot.timeEnd)} ({slot.classroom || '-'})</td>
                    <td className="border border-slate-400 p-2 font-semibold">{DAY_LABELS[plan.targetDay] || plan.targetDay}, {formatTime(plan.targetTimeStart)} - {formatTime(plan.targetTimeEnd)}</td>
                    <td className="border border-slate-400 p-2 font-bold">{plan.targetRoom}</td>
                  </tr>
                );
              })
            ) : selectedSourceSlot && activeSlotOption ? (
              <tr>
                <td className="border border-slate-400 p-2 text-center font-bold">1</td>
                <td className="border border-slate-400 p-2 font-bold">{className}</td>
                <td className="border border-slate-400 p-2">{selectedSourceSlot.subject}</td>
                <td className="border border-slate-400 p-2">{formatSlot(selectedSourceSlot)} ({selectedSourceSlot.classroom || '-'})</td>
                <td className="border border-slate-400 p-2 font-semibold">{DAY_LABELS[activeSlotOption.day] || activeSlotOption.day}, {formatTime(activeSlotOption.time)} - {formatTime(activeSlotOption.timeEnd)}</td>
                <td className="border border-slate-400 p-2 font-bold">{selectedRoomName || 'Bilik Kosong'}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={6} className="border border-slate-400 p-4 text-center text-slate-500">
                  Tiada kelas ganti dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Verification & Signatures */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-12">
            <div>Disediakan oleh:</div>
            <div className="border-t border-slate-400 pt-1">
              <div><strong>{teacher?.name || 'Nama Pensyarah'}</strong></div>
              <div className="text-slate-500">Pensyarah Kursus</div>
              <div className="text-slate-500">Tarikh: _________________</div>
            </div>
          </div>
          <div className="space-y-12">
            <div>Disahkan oleh:</div>
            <div className="border-t border-slate-400 pt-1">
              <div><strong>Ketua Program / HEP</strong></div>
              <div className="text-slate-500">Kolej Poly-Tech MARA Ipoh</div>
              <div className="text-slate-500">Tarikh: _________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
