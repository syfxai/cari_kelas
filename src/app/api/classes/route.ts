import { NextRequest, NextResponse } from 'next/server';
import { getClassByName, getClassesList } from '@/lib/timetableService';

const PYTHON_API = process.env.PYTHON_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  // 1. If explicit external Python API is configured, try proxying first
  if (PYTHON_API) {
    try {
      if (name) {
        const res = await fetch(`${PYTHON_API}/api/classes/${encodeURIComponent(name)}`);
        const data = await res.json();
        return NextResponse.json(data);
      }
      const res = await fetch(`${PYTHON_API}/api/classes`);
      const data = await res.json();
      if (data.success) {
        return NextResponse.json({
          success: true,
          data: data.data.map((c: { name: string }) => ({ id: c.name, name: c.name })),
        });
      }
      return NextResponse.json(data);
    } catch {
      // Fallback to native TypeScript execution below
    }
  }

  // 2. Native TypeScript execution (Works 100% on Netlify, Vercel & Node.js)
  try {
    if (name) {
      const cls = getClassByName(name);
      if (cls) {
        return NextResponse.json({ success: true, data: cls });
      }
      return NextResponse.json(
        { success: false, message: `Kelas '${name}' tidak dijumpai.` },
        { status: 404 }
      );
    }

    const classes = getClassesList();
    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Ralat memproses data kelas.' },
      { status: 500 }
    );
  }
}
