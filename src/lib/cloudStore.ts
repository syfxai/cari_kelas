import { getStore } from '@netlify/blobs';
import rawTimetableData from '@/data/timetable.json';
import rawPreviousTimetableData from '@/data/timetable_previous.json';
import semestersConfigData from '@/data/semesters.json';
import type { RawTimetableDatabase } from './timetableService';
import type { SemestersConfig } from './types';

const STORE_NAME = 'kptm_timetable';

/**
 * Mendapatkan store Netlify Blobs dengan selamat (fallback jika persekitaran local tanpa Netlify CLI).
 */
function getSafeBlobStore() {
  try {
    return getStore(STORE_NAME);
  } catch {
    return null;
  }
}

/**
 * Mengambil data jadual daripada Netlify Blobs (dengan fallback kepada fail JSON tempatan).
 */
export async function getCloudTimetable(
  semesterId: string = 'current'
): Promise<RawTimetableDatabase> {
  const semKey = semesterId === 'previous' ? 'previous' : 'current';
  const store = getSafeBlobStore();

  if (store) {
    try {
      const blobData = await store.get(semKey, { type: 'json' });
      if (blobData && typeof blobData === 'object' && 'classes' in blobData) {
        return blobData as RawTimetableDatabase;
      }
    } catch (err) {
      console.warn(`[Netlify Blobs] Gagal membaca blob '${semKey}':`, err);
    }
  }

  // Fallback kepada fail JSON tempatan
  return (semKey === 'previous'
    ? rawPreviousTimetableData
    : rawTimetableData) as unknown as RawTimetableDatabase;
}

/**
 * Menyimpan jadual terkini ke Netlify Blobs dengan logik auto-rolling archive:
 * 1. Jadual semasa sedia ada digilis menjadi 'previous' (Semester Lepas).
 * 2. Jadual baru EduPage disimpan sebagai 'current' (Semester Semasa).
 * 3. Sebarang semester lebih tua automatik terpadam (saiz kekal bawah 2MB).
 */
export async function saveLiveEdupageToCloud(
  freshDb: RawTimetableDatabase
): Promise<boolean> {
  const store = getSafeBlobStore();
  if (!store) {
    console.warn('[Netlify Blobs] Store tidak tersedia, data disimpan dalam cache sementara.');
    return false;
  }

  try {
    // 1. Ambil data semasa sedia ada untuk dijadikan arkib semester lepas
    const existingCurrent = await getCloudTimetable('current');

    // 2. Simpan jadual lama ke slot 'previous'
    await store.setJSON('previous', existingCurrent);

    // 3. Simpan jadual baharu ke slot 'current'
    await store.setJSON('current', freshDb);

    // 4. Kemas kini konfigurasi semester
    const currentConfig = await getCloudSemestersConfig();
    const updatedConfig: SemestersConfig = {
      ...currentConfig,
      activeSemester: 'current',
      semesters: (currentConfig.semesters || []).map(s => {
        if (s.id === 'current') {
          return {
            ...s,
            updatedAt: freshDb.scrapedAt || new Date().toISOString(),
          };
        }
        if (s.id === 'previous' && existingCurrent.scrapedAt) {
          return {
            ...s,
            updatedAt: existingCurrent.scrapedAt,
          };
        }
        return s;
      }),
    };
    await store.setJSON('config', updatedConfig);

    console.log('[Netlify Blobs] Berjaya menyimpan jadual baharu & gilis semester lepas!');
    return true;
  } catch (err) {
    console.error('[Netlify Blobs] Ralat semasa menyimpan ke Cloud Blobs:', err);
    return false;
  }
}

/**
 * Mengambil konfigurasi semester dari Netlify Blobs (dengan fallback tempatan).
 */
export async function getCloudSemestersConfig(): Promise<SemestersConfig> {
  const store = getSafeBlobStore();
  if (store) {
    try {
      const cfg = await store.get('config', { type: 'json' });
      if (cfg && typeof cfg === 'object' && 'semesters' in cfg) {
        return cfg as SemestersConfig;
      }
    } catch {
      // Fallback
    }
  }

  return semestersConfigData as SemestersConfig;
}
