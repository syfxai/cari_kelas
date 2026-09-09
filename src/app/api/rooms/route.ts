import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day');
  const time = searchParams.get('time');
  const timeEnd = searchParams.get('time_end') || searchParams.get('timeEnd') || '';

  try {
    if (day && time) {
      const url = new URL(`${PYTHON_API}/api/rooms/available`);
      url.searchParams.set('day', day);
      url.searchParams.set('time', time);
      if (timeEnd) {
        url.searchParams.set('time_end', timeEnd);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      return NextResponse.json(data);
    }

    const res = await fetch(`${PYTHON_API}/api/rooms`);
    const data = await res.json();
    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data.map((r: { name: string }) => ({ id: r.name, name: r.name })),
      });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Python backend tidak berjalan.' },
      { status: 500 }
    );
  }
}
