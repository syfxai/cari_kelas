import fs from 'fs';
import path from 'path';
import type {
  ClassData,
  TimetableSlot,
} from './types';
import type {
  RawTimetableDatabase,
} from './timetableService';

interface EdupageRawTable {
  id: string;
  data_rows?: EdupageRawRow[];
}

type EdupageRawRow = Record<string, unknown>;

interface EdupageApiResponse {
  r?: {
    regular?: {
      default_num?: string;
    };
    dbiAccessorRes?: {
      tables?: EdupageRawTable[];
    };
  };
}

const EDUPAGE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=UTF-8',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://kptmipoh.edupage.org/',
};

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function normalizeTime(value?: unknown, periodNumber?: unknown): string {
  if (!value || typeof value !== 'string') return '';
  const [hStr, mStr] = value.split(':');
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr || '0', 10);
  const pNum = typeof periodNumber === 'number'
    ? periodNumber
    : parseInt(String(periodNumber || 0), 10);

  if (pNum >= 6 && hour < 8) {
    hour += 12;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function sortSlotList(slots: TimetableSlot[]): TimetableSlot[] {
  return [...slots].sort((a, b) => {
    const dDiff = (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99);
    if (dDiff !== 0) return dDiff;
    return a.time.localeCompare(b.time);
  });
}

export function parseEdupageData(raw: EdupageApiResponse): RawTimetableDatabase {
  const tableList = raw.r?.dbiAccessorRes?.tables || [];
  const tables: Record<string, EdupageRawRow[]> = {};
  for (const t of tableList) {
    tables[t.id] = t.data_rows || [];
  }

  const mapById = (arr?: EdupageRawRow[]): Record<string, EdupageRawRow> => {
    const map: Record<string, EdupageRawRow> = {};
    for (const item of arr || []) {
      if (item && item.id !== undefined) {
        map[String(item.id)] = item;
      }
    }
    return map;
  };

  const periods = mapById(tables.periods);
  const periodsByNum: Record<string, EdupageRawRow> = {};
  for (const p of tables.periods || []) {
    if (p && p.period !== undefined) {
      periodsByNum[String(p.period)] = p;
    }
  }

  const days = mapById(tables.days);
  const classes = mapById(tables.classes);
  const teachers = mapById(tables.teachers);
  const subjects = mapById(tables.subjects);
  const classrooms = mapById(tables.classrooms);
  const lessons = mapById(tables.lessons);
  const cards = tables.cards || [];

  const teacherSlots: Record<string, TimetableSlot[]> = {};
  const classSlots: Record<string, TimetableSlot[]> = {};
  const roomSlots: Record<string, TimetableSlot[]> = {};

  for (const card of cards) {
    const lessonId = String(card.lessonid || '');
    const lesson = lessons[lessonId];
    if (!lesson) continue;

    const subjectId = String(lesson.subjectid || '');
    const subject = subjects[subjectId];
    const subjectName = subject
      ? String(subject.name || subject.short || 'Unknown')
      : 'Unknown';

    const teacherIds = (lesson.teacherids || []) as (string | number)[];
    const teacherNames: string[] = [];
    for (const tid of teacherIds) {
      const t = teachers[String(tid)];
      if (t && t.short) {
        teacherNames.push(String(t.short));
      }
    }

    const classIds = (lesson.classids || []) as (string | number)[];
    const classNames: string[] = [];
    for (const cid of classIds) {
      const c = classes[String(cid)];
      if (c && c.name) {
        classNames.push(String(c.name));
      }
    }

    const startPeriodNum = parseInt(String(card.period || '1'), 10);
    const duration = parseInt(String(lesson.durationperiods || 1), 10);
    const endPeriodNum = startPeriodNum + duration - 1;

    const startPeriod = periodsByNum[String(startPeriodNum)] || periods[String(card.period || '')] || {};
    const endPeriod = periodsByNum[String(endPeriodNum)] || startPeriod;

    const timeStart = normalizeTime(startPeriod.starttime, startPeriodNum);
    const timeEnd = normalizeTime(endPeriod.endtime, endPeriodNum);
    const periodLabel = duration === 1
      ? String(startPeriodNum)
      : `${startPeriodNum}-${endPeriodNum}`;

    const daysMask = String(card.days || '00000');
    for (let dayIdx = 0; dayIdx < daysMask.length; dayIdx += 1) {
      if (daysMask[dayIdx] === '1' && days[String(dayIdx)]) {
        const dayItem = days[String(dayIdx)];
        const dayName = String(dayItem.name || '');

        const roomIds = (card.classroomids || []) as (string | number)[];
        const roomNames: string[] = [];
        for (const rid of roomIds) {
          const r = classrooms[String(rid)];
          if (r && r.name) {
            roomNames.push(String(r.name));
          }
        }

        const slot: TimetableSlot = {
          day: dayName,
          period: periodLabel,
          time: timeStart,
          timeEnd: timeEnd,
          subject: subjectName,
          teacher: teacherNames.join(', '),
          class: classNames.join(', '),
          classroom: roomNames.join(', '),
        };

        for (const tname of teacherNames) {
          if (!teacherSlots[tname]) teacherSlots[tname] = [];
          teacherSlots[tname].push(slot);
        }
        for (const cname of classNames) {
          if (!classSlots[cname]) classSlots[cname] = [];
          classSlots[cname].push(slot);
        }
        for (const rname of roomNames) {
          if (!roomSlots[rname]) roomSlots[rname] = [];
          roomSlots[rname].push(slot);
        }
      }
    }
  }

  const teacherList = Object.values(teachers)
    .filter(t => !t.cb_hidden && typeof t.short === 'string' && teacherSlots[t.short])
    .map(t => ({
      id: String(t.id),
      name: String(t.short),
      slots: sortSlotList(teacherSlots[String(t.short)] || []),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const classList: ClassData[] = Object.values(classes)
    .filter(c => typeof c.name === 'string' && classSlots[c.name])
    .map(c => ({
      id: String(c.id),
      name: String(c.name),
      short: String(c.short || c.name),
      slots: sortSlotList(classSlots[String(c.name)] || []),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const roomList = Object.values(classrooms)
    .map(r => ({
      id: String(r.id),
      name: String(r.name),
      slots: sortSlotList(roomSlots[String(r.name)] || []),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalSlots = Object.values(classSlots).reduce(
    (sum, list) => sum + list.length,
    0
  );

  return {
    teachers: teacherList,
    classes: classList,
    rooms: roomList,
    totalSlots,
    scrapedAt: new Date().toISOString(),
  };
}

export async function fetchLiveEdupageTimetable(): Promise<RawTimetableDatabase> {
  const currentYear = new Date().getFullYear();

  // 1. Dapatkan TTViewer data untuk menentukan nombor jadual aktif (cth: "36")
  const ttViewerRes = await fetch(
    'https://kptmipoh.edupage.org/timetable/server/ttviewer.js?__func=getTTViewerData',
    {
      method: 'POST',
      headers: EDUPAGE_HEADERS,
      body: JSON.stringify({ __args: [null, currentYear], __gsh: '00000000' }),
    }
  );

  if (!ttViewerRes.ok) {
    throw new Error(`Gagal menghubungi EduPage TTViewer: HTTP ${ttViewerRes.status}`);
  }

  const ttViewerData = (await ttViewerRes.json()) as EdupageApiResponse;
  const defaultNum =
    ttViewerData.r?.regular?.default_num || '36';

  // 2. Muat turun pangkalan data jadual penuh (regularttGetData)
  const regularttRes = await fetch(
    'https://kptmipoh.edupage.org/timetable/server/regulartt.js?__func=regularttGetData',
    {
      method: 'POST',
      headers: EDUPAGE_HEADERS,
      body: JSON.stringify({
        __args: [null, String(defaultNum)],
        __gsh: '00000000',
      }),
    }
  );

  if (!regularttRes.ok) {
    throw new Error(`Gagal memuat turun data regulartt EduPage: HTTP ${regularttRes.status}`);
  }

  const rawData = (await regularttRes.json()) as EdupageApiResponse;

  // 3. Huraikan (parse) ke format standard sistem Cari Kelas
  const parsed = parseEdupageData(rawData);

  // 4. Jika persekitaran membenarkan (Node.js file system), simpan ke fail JSON tempatan
  try {
    const dataFilePath = path.join(process.cwd(), 'src', 'data', 'timetable.json');
    if (fs.existsSync(path.dirname(dataFilePath))) {
      await fs.promises.writeFile(
        dataFilePath,
        JSON.stringify(parsed, null, 2),
        'utf-8'
      );
    }
    const backendDataPath = path.join(process.cwd(), 'backend', 'data', 'timetable.json');
    if (fs.existsSync(path.dirname(backendDataPath))) {
      await fs.promises.writeFile(
        backendDataPath,
        JSON.stringify(parsed, null, 2),
        'utf-8'
      );
    }
  } catch (fsError) {
    // Pada persekitaran serverless read-only, ralat tulis fail diabaikan secara selamat
    console.warn('Nota: Gagal menulis fail JSON ke disk (mungkin read-only serverless):', fsError);
  }

  return parsed;
}
