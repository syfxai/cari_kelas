import { NextRequest, NextResponse } from 'next/server';
import { getAvailableRooms, getRoomsList } from '@/lib/timetableService';

const PYTHON_API = process.env.PYTHON_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day');
  const time = searchParams.get('time');
  const timeEnd = searchParams.get('time_end') || searchParams.get('timeEnd') || '';

  // 1. If explicit external Python API is configured, try proxying first
  if (PYTHON_API) {
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
      // Fallback to native TypeScript execution below
    }
  }

  // 2. Native TypeScript execution (Works 100% on Netlify, Vercel & Node.js)
  try {
    if (day && time) {
      const data = getAvailableRooms(day, time, timeEnd);
      return NextResponse.json({
        success: true,
        data,
      });
    }

    const rooms = getRoomsList();
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Ralat memproses ketersediaan bilik.' },
      { status: 500 }
    );
  }
}
