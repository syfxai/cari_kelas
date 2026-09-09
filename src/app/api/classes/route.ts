import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

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
    return NextResponse.json(
      { success: false, message: 'Python backend tidak berjalan.' },
      { status: 500 }
    );
  }
}
