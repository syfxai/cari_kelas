import { NextResponse } from 'next/server';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_API}/api/teachers`);
    const data = await res.json();
    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data.map((t: { name: string }) => t.name),
        scrapedAt: data.scrapedAt,
      });
    }
    return NextResponse.json({ success: false, message: 'Tiada data. Sila scrap dahulu.' });
  } catch {
    return NextResponse.json({ success: false, message: 'Python backend tidak berjalan.' });
  }
}

export async function POST() {
  try {
    const res = await fetch(`${PYTHON_API}/api/scrape`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      // Fetch updated teacher list
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
    return NextResponse.json(
      { success: false, message: 'Python backend tidak berjalan. Jalankan: cd backend && python main.py' },
      { status: 500 }
    );
  }
}
