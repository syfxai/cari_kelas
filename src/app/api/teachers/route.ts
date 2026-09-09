import { NextRequest, NextResponse } from 'next/server';
import { getTeacherByName, getTeachersList } from '@/lib/timetableService';

const PYTHON_API = process.env.PYTHON_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  // 1. If explicit external Python API is configured, try proxying first
  if (PYTHON_API) {
    try {
      if (name) {
        const res = await fetch(`${PYTHON_API}/api/teachers/${encodeURIComponent(name)}`);
        const data = await res.json();
        return NextResponse.json(data);
      }
      const res = await fetch(`${PYTHON_API}/api/teachers`);
      const data = await res.json();
      if (data.success) {
        return NextResponse.json({
          success: true,
          data: data.data.map((t: { name: string }) => t.name),
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
      const teacher = getTeacherByName(name);
      if (teacher) {
        return NextResponse.json({ success: true, data: teacher });
      }
      return NextResponse.json(
        { success: false, message: `Pensyarah '${name}' tidak dijumpai.` },
        { status: 404 }
      );
    }

    const teachers = getTeachersList();
    return NextResponse.json({ success: true, data: teachers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Ralat memproses data pensyarah.' },
      { status: 500 }
    );
  }
}
