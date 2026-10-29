import { NextRequest, NextResponse } from 'next/server';
import { getSemesterMetadata, getSemestersConfig } from '@/lib/timetableService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const config = getSemestersConfig();
    const cookieSemester = request.cookies.get('kptm_semester')?.value;
    const requestedSemester = request.nextUrl.searchParams.get('semester');

    const activeSemester = requestedSemester || cookieSemester || config.activeSemester || 'current';
    const currentMeta = getSemesterMetadata(activeSemester) || config.semesters[0];

    return NextResponse.json({
      success: true,
      activeSemester,
      currentSemesterMeta: currentMeta,
      semesters: config.semesters,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Ralat mengambil senarai semester.',
      },
      { status: 500 }
    );
  }
}
