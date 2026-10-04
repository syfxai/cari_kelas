import { NextResponse } from 'next/server';
import { getTeachersList, getTimetableDb, setTimetableDb } from '@/lib/timetableService';
import { fetchLiveEdupageTimetable } from '@/lib/edupageScraper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getTimetableDb();
    const teachers = getTeachersList();
    return NextResponse.json({
      success: true,
      data: teachers,
      scrapedAt: db.scrapedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Ralat pangkalan data pensyarah.',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const freshDb = await fetchLiveEdupageTimetable();
    setTimetableDb(freshDb);
    const teachers = getTeachersList();

    return NextResponse.json({
      success: true,
      message: `${teachers.length} pensyarah berjaya dikemas kini dari EduPage.`,
      data: teachers,
      scrapedAt: freshDb.scrapedAt,
    });
  } catch (error) {
    console.error('Ralat kemas kini pensyarah:', error);
    const teachers = getTeachersList();
    const db = getTimetableDb();

    return NextResponse.json({
      success: true,
      message: `${teachers.length} pensyarah dimuatkan dari data sedia ada.`,
      data: teachers,
      scrapedAt: db.scrapedAt,
    });
  }
}
