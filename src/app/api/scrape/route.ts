import { NextResponse } from 'next/server';
import { getTimetableDb } from '@/lib/timetableService';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST() {
  try {
    const res = await fetch(`${PYTHON_API}/api/scrape`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    const db = getTimetableDb();
    return NextResponse.json({
      success: true,
      message: `Pangkalan data aktif sedia ada mengandungi ${db.totalSlots} slot jadual.`,
      data: {
        teachers: db.teachers.length,
        classes: db.classes.length,
        rooms: db.rooms.length,
        totalSlots: db.totalSlots,
        scrapedAt: db.scrapedAt,
      },
    });
  }
}

export async function GET() {
  try {
    const db = getTimetableDb();
    return NextResponse.json({
      success: true,
      data: db.teachers.map(t => ({ name: t.name })),
      scrapedAt: db.scrapedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Ralat pangkalan data.' },
      { status: 500 }
    );
  }
}
