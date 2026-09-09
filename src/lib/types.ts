export interface TimetableSlot {
  day: string;
  period?: string;
  time: string;
  timeEnd: string;
  subject: string;
  teacher: string;
  classroom: string;
  class: string;
}

export interface ReplacementReason {
  type: 'class' | 'teacher' | 'classroom';
  message: string;
  slot: TimetableSlot;
}

export interface RoomOption {
  id: string;
  name: string;
  category?: string;
  isOnline?: boolean;
}

export interface ReplacementOption {
  day: string;
  time: string;
  timeEnd: string;
  periodStart?: number;
  periodEnd?: number;
  durationHours?: number;
  periodLabel?: string;
  roomCategory?: string;
  rooms?: RoomOption[];
  reasons?: ReplacementReason[];
}

export interface ReplacementResult {
  source: ReplacementOption & { subject: string; classroom: string; durationHours?: number };
  available: ReplacementOption[];
  conflicts: (ReplacementOption & { reasons: ReplacementReason[] })[];
}

export interface TeacherData {
  id: string;
  name: string;
  slots: TimetableSlot[];
}

export interface ClassData {
  id: string;
  name: string;
  slots: TimetableSlot[];
}

export interface RoomData {
  id: string;
  name: string;
  slots: TimetableSlot[];
}

export interface RoomStatusItem {
  id: string;
  name: string;
  category: 'lab' | 'lecture' | 'online' | 'other' | string;
  isOnline: boolean;
  totalSlots?: number;
  slot?: TimetableSlot;
  conflictSlots?: TimetableSlot[];
}

export interface RoomAvailabilityResponse {
  day: string;
  time: string;
  timeEnd: string;
  durationHours: number;
  totalRooms: number;
  availableCount: number;
  occupiedCount: number;
  available: RoomStatusItem[];
  occupied: RoomStatusItem[];
}

export interface ScrapeResult {
  teachers: TeacherData[];
  classes: ClassData[];
  rooms: RoomData[];
  scrapedAt: string;
}

export interface SearchResult {
  found: boolean;
  data: TeacherData | ClassData | RoomData | null;
  message: string;
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export const DAY_LABELS: Record<string, string> = {
  Monday: 'Isnin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Khamis',
  Friday: 'Jumaat',
};

export const TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
] as const;
