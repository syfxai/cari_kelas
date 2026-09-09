import { NextResponse } from 'next/server';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST() {
  try {
    const res = await fetch(`${PYTHON_API}/api/scrape`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Python backend tidak berjalan. Jalankan: cd backend && python main.py' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_API}/api/teachers`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Python backend tidak berjalan.' },
      { status: 500 }
    );
  }
}
