import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import type { ScrapeResult, TeacherData, ClassData, RoomData } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getCachedData(key: string): Promise<ScrapeResult | null> {
  try {
    const docRef = doc(db, 'timetable_cache', key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as ScrapeResult;
      const scrapedAt = new Date(data.scrapedAt).getTime();
      if (Date.now() - scrapedAt < CACHE_TTL_MS) {
        return data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCachedData(key: string, data: ScrapeResult): Promise<void> {
  try {
    const docRef = doc(db, 'timetable_cache', key);
    await setDoc(docRef, data);
  } catch (e) {
    console.error('Failed to cache data:', e);
  }
}

export async function searchTeacher(name: string): Promise<TeacherData | null> {
  const cache = await getCachedData('all_data');
  if (!cache) return null;
  const search = name.toLowerCase();
  return cache.teachers.find(t => t.name.toLowerCase().includes(search)) || null;
}

export async function searchClass(name: string): Promise<ClassData | null> {
  const cache = await getCachedData('all_data');
  if (!cache) return null;
  const search = name.toLowerCase();
  return cache.classes.find(c => c.name.toLowerCase().includes(search)) || null;
}

export async function getAllTeachers(): Promise<TeacherData[]> {
  const cache = await getCachedData('all_data');
  return cache?.teachers || [];
}

export async function getAllClasses(): Promise<ClassData[]> {
  const cache = await getCachedData('all_data');
  return cache?.classes || [];
}

export async function getAllRooms(): Promise<RoomData[]> {
  const cache = await getCachedData('all_data');
  return cache?.rooms || [];
}

export { db };
