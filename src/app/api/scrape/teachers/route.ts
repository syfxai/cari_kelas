import { NextResponse } from 'next/server';
import { getTeachersList, getTimetableDb } from '@/lib/timetableService';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

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
      { success: false, message: error instanceof Error ? error.message : 'Ralat pangkalan data pensyarah.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const res = await fetch(`${PYTHON_API}/api/scrape`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      const teacherRes = await fetch(`${PYTHON_API}/api/teachers`);
      const teacherData = await teacherRes.json();
      if (teacherData.success) {
        return NextResponse.json({
          success: true,
          message: data.message,
          data: teacherData.data.map((t: { name: string }) => t.name),
        });
      }
    }
    return NextResponse.json(data);
  } catch {
    const teachers = getTeachersList();
    return NextResponse.json({
      success: true,
      message: `${teachers.length} pensyarah dimuatkan dari pangkalan data aktif.`,
      data: teachers,
    });
  }
}
