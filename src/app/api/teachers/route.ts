import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  try {
    if (name) {
      const res = await fetch(`${PYTHON_API}/api/teachers/${encodeURIComponent(name)}`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    const res = await fetch(`${PYTHON_API}/api/teachers`);
    const data = await res.json();
    // Return just names for the list
    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data.map((t: { name: string }) => t.name),
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
