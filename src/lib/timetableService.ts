import rawTimetableData from '@/data/timetable.json';
import type {
  ClassData,
  MultiPlannedSlotItem,
  ReplacementOption,
  ReplacementReason,
  ReplacementResult,
  RoomAvailabilityResponse,
  RoomOption,
  RoomStatusItem,
  SmartSuggestionOption,
  TeacherData,
  TimetableSlot,
} from './types';

export interface RawTimetableDatabase {
  teachers: TeacherData[];
  classes: ClassData[];
  rooms: {
    id: string;
    name: string;
    slots: TimetableSlot[];
  }[];
  totalSlots: number;
  scrapedAt: string;
}

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

const DAY_BASE_SLOTS: Record<string, [string, string][]> = {
  Monday: [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
    ['12:00', '13:00'],
    ['13:00', '14:00'],
    ['14:00', '15:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00'],
    ['17:00', '18:00'],
  ],
  Tuesday: [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
    ['12:00', '13:00'],
    ['13:00', '14:00'],
    ['14:00', '15:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00'],
    ['17:00', '18:00'],
  ],
  Wednesday: [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
    ['12:00', '13:00'],
    ['13:00', '14:00'],
    ['14:00', '15:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00'],
    ['17:00', '18:00'],
  ],
  Thursday: [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
    ['12:00', '13:00'],
    ['13:00', '14:00'],
    ['14:00', '15:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00'],
    ['17:00', '18:00'],
  ],
  Friday: [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
    ['12:00', '13:00'],
    ['13:00', '14:00'],
    ['14:00', '15:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00'],
    ['17:00', '18:00'],
  ],
};

export function normalizeTimeStr(value?: string): string {
  if (!value) return '';
  const [hStr, mStr] = value.split(':');
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr || '0', 10);
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function timeToMinutes(value: string): number {
  if (!value) return 0;
  const [hStr, mStr] = value.split(':');
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr || '0', 10);
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }
  return hour * 60 + minute;
}

export function slotsOverlap(
  first: { time: string; timeEnd?: string },
  second: { time: string; timeEnd?: string }
): boolean {
  const fStart = timeToMinutes(first.time);
  const fEnd = timeToMinutes(first.timeEnd || first.time);
  const sStart = timeToMinutes(second.time);
  const sEnd = timeToMinutes(second.timeEnd || second.time);
  return fStart < sEnd && sStart < fEnd;
}

export function matchingSlots(
  slots: TimetableSlot[],
  day: string,
  candidate: { time: string; timeEnd?: string }
): TimetableSlot[] {
  return (slots || []).filter(
    slot => slot.day.toLowerCase() === day.toLowerCase() && slotsOverlap(slot, candidate)
  );
}

export function roomCategory(name: string): string {
  const norm = name.toUpperCase();
  if (norm.includes('ONLINE')) return 'online';
  if (norm.includes('MAKMAL') || norm.includes('LAB')) return 'lab';
  if (norm.includes('BILIK KULIAH') || norm.startsWith('BK')) return 'lecture';
  return 'other';
}

// Cached normalized database in memory
let cachedDb: RawTimetableDatabase | null = null;

export function getTimetableDb(): RawTimetableDatabase {
  if (cachedDb) return cachedDb;

  const raw = rawTimetableData as unknown as RawTimetableDatabase;

  const normalizeSlots = (slots: TimetableSlot[]) =>
    (slots || []).map(slot => ({
      ...slot,
      time: normalizeTimeStr(slot.time),
      timeEnd: normalizeTimeStr(slot.timeEnd || slot.time),
    }));

  const teachers = (raw.teachers || []).map(t => ({
    ...t,
    slots: normalizeSlots(t.slots),
  }));

  const classes = (raw.classes || []).map(c => ({
    ...c,
    slots: normalizeSlots(c.slots),
  }));

  const rooms = (raw.rooms || []).map(r => ({
    ...r,
    slots: normalizeSlots(r.slots),
  }));

  cachedDb = {
    ...raw,
    teachers,
    classes,
    rooms,
  };

  return cachedDb;
}

// 1. Get Teacher List & Single Teacher
export function getTeachersList(): string[] {
  const db = getTimetableDb();
  return db.teachers.map(t => t.name).sort();
}

export function getTeacherByName(name: string): TeacherData | null {
  const db = getTimetableDb();
  const lower = name.toLowerCase().trim();
  const exact = db.teachers.find(t => t.name.toLowerCase() === lower);
  if (exact) return exact;
  return db.teachers.find(t => t.name.toLowerCase().includes(lower)) || null;
}

// 2. Get Class List & Single Class
export function getClassesList(): { id: string; name: string }[] {
  const db = getTimetableDb();
  return db.classes.map(c => ({ id: c.name, name: c.name })).sort((a, b) => a.name.localeCompare(b.name));
}

export function getClassByName(name: string): ClassData | null {
  const db = getTimetableDb();
  const lower = name.toLowerCase().trim();
  const exact = db.classes.find(c => c.name.toLowerCase() === lower);
  if (exact) return exact;
  return db.classes.find(c => c.name.toLowerCase().includes(lower)) || null;
}

// 3. Get Room List & Available Rooms for Time Slot
export function getRoomsList(): { id: string; name: string }[] {
  const db = getTimetableDb();
  return db.rooms.map(r => ({ id: r.name, name: r.name })).sort((a, b) => a.name.localeCompare(b.name));
}

export function getAvailableRooms(
  day: string,
  time: string,
  timeEnd?: string
): RoomAvailabilityResponse {
  const db = getTimetableDb();

  const normTime = normalizeTimeStr(time);
  let normTimeEnd = normalizeTimeStr(timeEnd || '');

  if (!normTimeEnd || timeToMinutes(normTimeEnd) <= timeToMinutes(normTime)) {
    const startMin = timeToMinutes(normTime);
    const endMin = startMin + 60;
    normTimeEnd = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
  }

  const candidate = {
    time: normTime,
    timeEnd: normTimeEnd,
  };

  const startMin = timeToMinutes(normTime);
  const endMin = timeToMinutes(normTimeEnd);
  const durationHours = Math.max(1, Math.round((endMin - startMin) / 60));

  const available: RoomStatusItem[] = [];
  const occupied: RoomStatusItem[] = [];

  for (const r of db.rooms) {
    const conflicts = matchingSlots(r.slots, day, candidate);
    const cat = roomCategory(r.name);
    const isOnline = cat === 'online';

    const roomInfo: RoomStatusItem = {
      id: r.id,
      name: r.name,
      category: cat,
      isOnline,
      totalSlots: r.slots.length,
    };

    if (conflicts.length === 0) {
      available.push(roomInfo);
    } else {
      occupied.push({
        ...roomInfo,
        slot: conflicts[0],
        conflictSlots: conflicts,
      });
    }
  }

  const catOrder: Record<string, number> = { lab: 0, lecture: 1, other: 2, online: 3 };
  available.sort((a, b) => (catOrder[a.category || 'other'] ?? 99) - (catOrder[b.category || 'other'] ?? 99) || a.name.localeCompare(b.name));
  occupied.sort((a, b) => (catOrder[a.category || 'other'] ?? 99) - (catOrder[b.category || 'other'] ?? 99) || a.name.localeCompare(b.name));

  return {
    day,
    time: normTime,
    timeEnd: normTimeEnd,
    durationHours,
    totalRooms: db.rooms.length,
    availableCount: available.length,
    occupiedCount: occupied.length,
    available,
    occupied,
  };
}

// 4. Calculate Replacement Options
export interface ReplacementQueryRequest {
  teacher: string;
  class_name: string;
  source_day: string;
  source_time: string;
  source_time_end: string;
  classroom?: string;
}

export function calculateReplacementOptions(req: ReplacementQueryRequest): ReplacementResult {
  const db = getTimetableDb();

  const teacher = db.teachers.find(t => t.name.toLowerCase() === req.teacher.toLowerCase());
  const selectedClass = db.classes.find(c => c.name.toLowerCase() === req.class_name.toLowerCase());

  if (!teacher) {
    throw new Error(`Pensyarah '${req.teacher}' tidak dijumpai.`);
  }
  if (!selectedClass) {
    throw new Error(`Kelas '${req.class_name}' tidak dijumpai.`);
  }

  const normSourceStart = normalizeTimeStr(req.source_time);
  const normSourceEnd = normalizeTimeStr(req.source_time_end);

  let sourceSlot = selectedClass.slots.find(
    slot =>
      slot.day.toLowerCase() === req.source_day.toLowerCase() &&
      (slot.time === normSourceStart || slot.time === req.source_time)
  );

  if (!sourceSlot) {
    sourceSlot = selectedClass.slots.find(
      slot =>
        slot.day.toLowerCase() === req.source_day.toLowerCase() &&
        slotsOverlap(slot, { time: normSourceStart, timeEnd: normSourceEnd })
    );
  }

  if (!sourceSlot) {
    throw new Error('Slot asal tidak dijumpai untuk kelas ini.');
  }

  const sourceDurationHours = Math.max(
    1,
    Math.round((timeToMinutes(normSourceEnd) - timeToMinutes(normSourceStart)) / 60)
  );

  const source = {
    day: req.source_day,
    time: normSourceStart,
    timeEnd: normSourceEnd,
    durationHours: sourceDurationHours,
    subject: sourceSlot.subject,
    classroom: sourceSlot.classroom || req.classroom || '',
  };

  // Generate candidate period windows for durations 1, 2, and 3 hours
  const candidates: {
    day: string;
    time: string;
    timeEnd: string;
    periodStart: number;
    periodEnd: number;
    durationHours: number;
    periodLabel: string;
  }[] = [];

  const daysToCheck = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  for (const day of daysToCheck) {
    const slotsList = DAY_BASE_SLOTS[day] || [];
    const durations = Array.from(new Set([1, 2, 3, sourceDurationHours])).sort((a, b) => a - b);

    for (const numHours of durations) {
      if (numHours > slotsList.length) continue;
      for (let i = 0; i <= slotsList.length - numHours; i++) {
        const start = slotsList[i][0];
        const end = slotsList[i + numHours - 1][1];
        const pStart = i + 1;
        const pEnd = i + numHours;
        const pLabel = pStart === pEnd ? `Waktu ${pStart}` : `Waktu ${pStart}–${pEnd}`;

        candidates.push({
          day,
          time: start,
          timeEnd: end,
          periodStart: pStart,
          periodEnd: pEnd,
          durationHours: numHours,
          periodLabel: pLabel,
        });
      }
    }
  }

  candidates.sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99);
    if (dayDiff !== 0) return dayDiff;
    const timeDiff = timeToMinutes(a.time) - timeToMinutes(b.time);
    if (timeDiff !== 0) return timeDiff;
    return a.durationHours - b.durationHours;
  });

  const roomName = req.classroom || sourceSlot.classroom || '';
  const category = roomName ? roomCategory(roomName) : 'other';
  const allRooms = db.rooms;

  const available: ReplacementOption[] = [];
  const conflicts: (ReplacementOption & { reasons: ReplacementReason[] })[] = [];

  for (const cand of candidates) {
    const day = cand.day;
    const classConflicts = matchingSlots(selectedClass.slots, day, cand);
    const teacherConflicts = matchingSlots(teacher.slots, day, cand);

    const reasons: ReplacementReason[] = [];
    if (classConflicts.length > 0) {
      reasons.push({
        type: 'class',
        message: `${selectedClass.name} sudah mempunyai kelas pada waktu ini.`,
        slot: classConflicts[0],
      });
    }
    if (teacherConflicts.length > 0) {
      const conflict = teacherConflicts[0];
      reasons.push({
        type: 'teacher',
        message: `${teacher.name} sedang mengajar ${conflict.class || 'kelas lain'}.`,
        slot: conflict,
      });
    }

    // Calculate free rooms
    const availableRooms: RoomOption[] = [];
    for (const room of allRooms) {
      const rConflicts = matchingSlots(room.slots, day, cand);
      if (rConflicts.length === 0) {
        const rCat = roomCategory(room.name);
        const isOnline = room.name.toUpperCase().includes('ONLINE');
        availableRooms.push({
          id: room.id,
          name: room.name,
          category: rCat,
          isOnline,
        });
      }
    }

    availableRooms.sort((a, b) => {
      const aOnline = a.isOnline ? 1 : 0;
      const bOnline = b.isOnline ? 1 : 0;
      if (aOnline !== bOnline) return aOnline - bOnline;
      return a.name.localeCompare(b.name);
    });

    const resultItem: ReplacementOption = {
      ...cand,
      roomCategory: category,
      rooms: availableRooms,
    };

    if (reasons.length > 0) {
      conflicts.push({
        ...resultItem,
        reasons,
      });
    } else {
      available.push(resultItem);
    }
  }

  return {
    source,
    available,
    conflicts,
  };
}

// 5. Calculate Smart Multi-Class Replacement Distribution
export function calculateSmartMultiDistribution(
  teacherName: string,
  selectedSlots: TimetableSlot[]
): Record<string, MultiPlannedSlotItem> {
  const db = getTimetableDb();
  const teacher = db.teachers.find(t => t.name.toLowerCase() === teacherName.toLowerCase().trim());
  if (!teacher || selectedSlots.length === 0) return {};

  const daysToCheck = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const batchKeys = new Set(
    selectedSlots.map(s => `${s.day}-${s.time}-${s.timeEnd}-${s.subject}-${s.class}`)
  );

  interface SlotCandidatePool {
    key: string;
    sourceSlot: TimetableSlot;
    origCat: 'lab' | 'lecture' | 'online' | 'other';
    durationHours: number;
    candidates: SmartSuggestionOption[];
  }

  const poolList: SlotCandidatePool[] = [];

  selectedSlots.forEach(s => {
    const key = `${s.day}-${s.time}-${s.timeEnd}-${s.subject}-${s.class}`;
    let origCat = roomCategory(s.classroom || '');
    if (origCat === 'other' && (s.subject.toUpperCase().includes('LAB') || s.subject.toUpperCase().includes('KOMPUTER') || s.subject.toUpperCase().includes('MG') || s.subject.toUpperCase().includes('SB'))) {
      origCat = 'lab';
    }
    const diff = (timeToMinutes(s.timeEnd || s.time) - timeToMinutes(s.time)) / 60;
    const duration = Math.max(1, Math.round(diff));

    const classNames = (s.class || '').split(',').map(c => c.trim()).filter(Boolean);
    const classObjs = classNames
      .map(cn => db.classes.find(c => c.name.toLowerCase() === cn.toLowerCase()))
      .filter(Boolean) as ClassData[];

    const candidates: SmartSuggestionOption[] = [];

    daysToCheck.forEach(d => {
      const daySlots = [
        ['08:00', '09:00'],
        ['09:00', '10:00'],
        ['10:00', '11:00'],
        ['11:00', '12:00'],
        ['12:00', '13:00'],
        ['13:00', '14:00'],
        ['14:00', '15:00'],
        ['15:00', '16:00'],
        ['16:00', '17:00'],
        ['17:00', '18:00'],
      ];

      for (let i = 0; i <= daySlots.length - duration; i++) {
        const start = daySlots[i][0];
        const end = daySlots[i + duration - 1][1];
        const cand = { time: start, timeEnd: end };

        // Exclude Friday Mentor Mentee 10:00-12:00
        if (d === 'Friday' && timeToMinutes(start) < 720 && timeToMinutes(end) > 600) {
          continue;
        }

        // 1. Teacher conflict check (excluding any slots in the replacement batch)
        const tConf = teacher.slots.some(ts => {
          const k = `${ts.day}-${ts.time}-${ts.timeEnd}-${ts.subject}-${ts.class}`;
          if (batchKeys.has(k)) return false;
          return ts.day === d && slotsOverlap(ts, cand);
        });
        if (tConf) continue;

        // 2. Student class conflict check (excluding any slots in the replacement batch)
        let cConf = false;
        for (const co of classObjs) {
          const hasClash = co.slots.some(cs => {
            const k = `${cs.day}-${cs.time}-${cs.timeEnd}-${cs.subject}-${cs.class}`;
            if (batchKeys.has(k)) return false;
            if (cs.day === s.day && cs.time === s.time && cs.subject === s.subject) return false;
            return cs.day === d && slotsOverlap(cs, cand);
          });
          if (hasClash) {
            cConf = true;
            break;
          }
        }
        if (cConf) continue;

        // 3. Find matching rooms of the same category
        const freeMatchingRooms = db.rooms.filter(r => {
          const cat = roomCategory(r.name);
          const match = origCat === 'online' ? cat === 'online' : cat === origCat;
          if (!match) return false;
          return !r.slots.some(rs => {
            const k = `${rs.day}-${rs.time}-${rs.timeEnd}-${rs.subject}-${rs.class}`;
            if (batchKeys.has(k)) return false;
            return rs.day === d && slotsOverlap(rs, cand);
          });
        });

        if (freeMatchingRooms.length > 0) {
          const pStart = i + 1;
          const pEnd = i + duration;
          const pLabel = pStart === pEnd ? `Waktu ${pStart}` : `Waktu ${pStart}–${pEnd}`;

          candidates.push({
            day: d,
            period: pStart,
            timeStart: start,
            timeEnd: end,
            durationHours: duration,
            periodLabel: pLabel,
            roomName: freeMatchingRooms[0].name,
            roomCategory: origCat,
            availableMatchingRoomsCount: freeMatchingRooms.length,
            availableRooms: freeMatchingRooms.map(r => ({
              id: r.id || r.name,
              name: r.name,
              category: origCat,
              isOnline: r.name.toUpperCase().includes('ONLINE'),
            })),
          });
        }
      }
    });

    poolList.push({
      key,
      sourceSlot: s,
      origCat: origCat as 'lab' | 'lecture' | 'online' | 'other',
      durationHours: duration,
      candidates,
    });
  });

  // Assign optimal non-overlapping distribution
  const usedAssignments: { day: string; timeStart: string; timeEnd: string; roomName: string }[] = [];
  const resultMap: Record<string, MultiPlannedSlotItem> = {};

  poolList.forEach(pool => {
    // Generate up to 1 best suggestion per available day for quick suggestion chips
    const daySuggestionMap: Record<string, SmartSuggestionOption> = {};
    pool.candidates.forEach(c => {
      if (!daySuggestionMap[c.day]) {
        daySuggestionMap[c.day] = c;
      }
    });
    const suggestions = Object.values(daySuggestionMap);

    // Sort candidates:
    // 1. Give bonus to days NOT yet used in this batch (spread across different days!)
    // 2. Prefer days other than the source slot's original day
    // 3. Prefer mid-morning / afternoon (period 2 to 7)
    // 4. Prefer slots with higher room availability
    const sortedCandidates = [...pool.candidates].sort((a, b) => {
      const aDayCount = usedAssignments.filter(u => u.day === a.day).length;
      const bDayCount = usedAssignments.filter(u => u.day === b.day).length;
      if (aDayCount !== bDayCount) return aDayCount - bDayCount;

      const aIsSourceDay = a.day === pool.sourceSlot.day ? 1 : 0;
      const bIsSourceDay = b.day === pool.sourceSlot.day ? 1 : 0;
      if (aIsSourceDay !== bIsSourceDay) return aIsSourceDay - bIsSourceDay;

      const aPeriodDiff = Math.abs(a.period - 3);
      const bPeriodDiff = Math.abs(b.period - 3);
      if (aPeriodDiff !== bPeriodDiff) return aPeriodDiff - bPeriodDiff;

      return b.availableMatchingRoomsCount - a.availableMatchingRoomsCount;
    });

    // Find first candidate that has 0 collision with previously assigned slots in this batch
    let chosen = sortedCandidates.find(cand => {
      const clash = usedAssignments.some(ua => {
        if (ua.day !== cand.day) return false;
        return slotsOverlap(
          { time: ua.timeStart, timeEnd: ua.timeEnd },
          { time: cand.timeStart, timeEnd: cand.timeEnd }
        );
      });
      if (clash) return false;

      // Ensure room is not occupied by another slot in batch at the same time
      const roomClash = usedAssignments.some(ua => {
        if (ua.day !== cand.day) return false;
        const timeOverlap = slotsOverlap(
          { time: ua.timeStart, timeEnd: ua.timeEnd },
          { time: cand.timeStart, timeEnd: cand.timeEnd }
        );
        return timeOverlap && ua.roomName === cand.roomName;
      });

      if (roomClash) {
        const altRoom = (cand.availableRooms || []).find(r => !usedAssignments.some(ua => {
          if (ua.day !== cand.day) return false;
          const timeOverlap = slotsOverlap(
            { time: ua.timeStart, timeEnd: ua.timeEnd },
            { time: cand.timeStart, timeEnd: cand.timeEnd }
          );
          return timeOverlap && ua.roomName === r.name;
        }));
        if (altRoom) {
          cand.roomName = altRoom.name;
          return true;
        }
        return false;
      }

      return true;
    });

    if (!chosen && pool.candidates.length > 0) {
      chosen = pool.candidates[0];
    }

    if (!chosen) {
      // Fallback
      chosen = {
        day: pool.sourceSlot.day === 'Wednesday' ? 'Tuesday' : 'Wednesday',
        period: 2,
        timeStart: '09:00',
        timeEnd: pool.durationHours === 2 ? '11:00' : '10:00',
        durationHours: pool.durationHours,
        periodLabel: `Waktu 2`,
        roomName: pool.sourceSlot.classroom || 'MAKMAL KOMPUTER 1-01',
        roomCategory: pool.origCat,
        availableMatchingRoomsCount: 1,
        availableRooms: [],
      };
    }

    usedAssignments.push({
      day: chosen.day,
      timeStart: chosen.timeStart,
      timeEnd: chosen.timeEnd,
      roomName: chosen.roomName,
    });

    resultMap[pool.key] = {
      key: pool.key,
      sourceSlot: pool.sourceSlot,
      originalCategory: pool.origCat,
      targetDay: chosen.day,
      targetPeriod: chosen.period,
      durationHours: chosen.durationHours,
      targetTimeStart: chosen.timeStart,
      targetTimeEnd: chosen.timeEnd,
      targetRoom: chosen.roomName,
      suggestions,
      availableRooms: chosen.availableRooms,
      loadingRooms: false,
    };
  });

  return resultMap;
}
