import { NextRequest, NextResponse } from 'next/server';
import { ensureCloudDbLoaded, getTimetableDb, setTimetableDb } from '@/lib/timetableService';
import { fetchLiveEdupageTimetable } from '@/lib/edupageScraper';
import { saveLiveEdupageToCloud } from '@/lib/cloudStore';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 1. Ambil data jadual langsung dari EduPage (mengambil masa ~1-2 saat)
    const freshDb = await fetchLiveEdupageTimetable();
    setTimetableDb(freshDb, 'current');

    // 2. Simpan secara automatik ke Netlify Blobs (dengan auto-rolling archive)
    await saveLiveEdupageToCloud(freshDb);

    return NextResponse.json({
      success: true,
      message: `Jadual EduPage berjaya dikemas kini! ${freshDb.totalSlots} slot dijumpai.`,
      data: {
        teachers: freshDb.teachers.length,
        classes: freshDb.classes.length,
        rooms: freshDb.rooms.length,
        totalSlots: freshDb.totalSlots,
        scrapedAt: freshDb.scrapedAt,
        semester: 'current',
      },
    });
  } catch (error) {
    console.error('Ralat semasa kemas kini live EduPage:', error);

    // 2. Fallback kepada pangkalan data sedia ada jika internet/EduPage terputus
    const currentDb = getTimetableDb('current');
    return NextResponse.json({
      success: false,
      message: error instanceof Error
        ? `Gagal berhubung ke EduPage: ${error.message}`
        : 'Gagal mengemas kini dari EduPage. Menggunakan data sedia ada.',
      data: {
        teachers: currentDb.teachers.length,
        classes: currentDb.classes.length,
        rooms: currentDb.rooms.length,
        totalSlots: currentDb.totalSlots,
        scrapedAt: currentDb.scrapedAt,
        semester: 'current',
      },
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const semester = request.nextUrl.searchParams.get('semester') || request.cookies.get('kptm_semester')?.value || 'current';
    const db = await ensureCloudDbLoaded(semester);
    return NextResponse.json({
      success: true,
      data: {
        teachers: db.teachers.length,
        classes: db.classes.length,
        rooms: db.rooms.length,
        totalSlots: db.totalSlots,
        scrapedAt: db.scrapedAt,
        semester,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Ralat pangkalan data.',
      },
      { status: 500 }
    );
  }
}
