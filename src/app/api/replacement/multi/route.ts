import { NextRequest, NextResponse } from 'next/server';
import { calculateSmartMultiDistribution } from '@/lib/timetableService';
import type { TimetableSlot } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacher, slots } = body as { teacher: string; slots: TimetableSlot[] };

    if (!teacher || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { success: false, message: 'Parameter teacher dan slots diperlukan.' },
        { status: 400 }
      );
    }

    const distribution = calculateSmartMultiDistribution(teacher, slots);

    return NextResponse.json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal memproses perancangan jadual ganti.' },
      { status: 500 }
    );
  }
}
