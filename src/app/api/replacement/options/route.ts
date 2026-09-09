import { NextRequest, NextResponse } from 'next/server';
import { calculateReplacementOptions, type ReplacementQueryRequest } from '@/lib/timetableService';

const PYTHON_API = process.env.PYTHON_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReplacementQueryRequest;

    // 1. If explicit external Python API is configured, try proxying first
    if (PYTHON_API) {
      try {
        const response = await fetch(`${PYTHON_API}/api/replacement/options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch {
        // Fallback to native TypeScript execution below
      }
    }

    // 2. Native TypeScript execution (Works 100% on Netlify, Vercel & Node.js)
    const result = calculateReplacementOptions(body);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal menyemak slot ganti.' },
      { status: 400 }
    );
  }
}
