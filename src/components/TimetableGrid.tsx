'use client';

import { DAYS, DAY_LABELS, type TimetableSlot } from '@/lib/types';

interface TimetableGridProps {
  slots: TimetableSlot[];
  title?: string;
  subtitle?: string;
}

const STANDARD_PERIODS = [
  { period: 1, time: '08:00', end: '09:00', label: '08:00 AM', timeRange: '08:00 – 09:00' },
  { period: 2, time: '09:00', end: '10:00', label: '09:00 AM', timeRange: '09:00 – 10:00' },
  { period: 3, time: '10:00', end: '11:00', label: '10:00 AM', timeRange: '10:00 – 11:00' },
  { period: 4, time: '11:00', end: '12:00', label: '11:00 AM', timeRange: '11:00 – 12:00' },
  { period: 5, time: '12:00', end: '13:00', label: '12:00 PM', timeRange: '12:00 – 01:00' },
  { period: 6, time: '13:00', end: '14:00', label: '01:00 PM', timeRange: '01:00 – 02:00' },
  { period: 7, time: '14:00', end: '15:00', label: '02:00 PM', timeRange: '02:00 – 03:00' },
  { period: 8, time: '15:00', end: '16:00', label: '03:00 PM', timeRange: '03:00 – 04:00' },
  { period: 9, time: '16:00', end: '17:00', label: '04:00 PM', timeRange: '04:00 – 05:00' },
  { period: 10, time: '17:00', end: '18:00', label: '05:00 PM', timeRange: '05:00 – 06:00' },
] as const;

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  let hour = h;
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }
  return hour * 60 + (m || 0);
};

export default function TimetableGrid({ slots, title, subtitle }: TimetableGridProps) {
  // Find slot for a specific day and time period
  const getSlot = (day: string, periodStartTime: string) => {
    const periodMin = timeToMinutes(periodStartTime);
    const periodEndMin = periodMin + 60;

    return slots.find(s => {
      if (s.day.toLowerCase() !== day.toLowerCase()) return false;
      const sStartMin = timeToMinutes(s.time);
      const sEndMin = timeToMinutes(s.timeEnd || s.time);
      // exact start match or within duration span
      if (s.time === periodStartTime) return true;
      if (sStartMin < periodEndMin && sEndMin > periodMin) return true;
      return false;
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header Bar */}
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#3f8ceb]" />
            <h2 className="text-base font-bold text-slate-950 tracking-tight">{title}</h2>
            {subtitle && <span className="text-xs text-slate-500">• {subtitle}</span>}
          </div>
          <span className="text-xs font-semibold text-[#3f8ceb] bg-sky-50 px-3 py-1 rounded-full">
            {slots.length} sesi berjadual
          </span>
        </div>
      )}

      {/* Complete Weekly Schedule Grid: Hari turun ke bawah (Y-axis), Waktu melintang (X-axis) */}
      <div className="overflow-x-auto p-4 sm:p-6">
        <table className="w-full text-left border-separate border-spacing-2 text-xs min-w-[1300px]">
          <thead>
            <tr>
              {/* Day Header Column */}
              <th className="px-4 py-3 font-extrabold w-28 text-center text-xs uppercase tracking-wider text-slate-700 bg-slate-50 rounded-2xl">
                Hari
              </th>
              {/* 10 Time Period Header Columns */}
              {STANDARD_PERIODS.map(p => (
                <th
                  key={p.period}
                  className="px-3 py-3 font-medium text-center min-w-[125px] bg-slate-50 rounded-2xl"
                >
                  <div className="font-extrabold text-slate-900 text-xs">
                    Waktu {p.period}
                  </div>
                  <div className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">
                    {p.timeRange}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day}>
                {/* Day Row Header */}
                <td className="px-4 py-3 bg-slate-50 rounded-2xl align-middle text-center whitespace-nowrap w-28">
                  <div className="font-black text-slate-950 text-xs uppercase">
                    {DAY_LABELS[day] || day}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {day}
                  </div>
                </td>

                {/* 10 Period Cells for this Day */}
                {STANDARD_PERIODS.map(p => {
                  const slot = getSlot(day, p.time);
                  return (
                    <td key={p.time} className="p-0 align-top min-w-[125px]">
                      {slot ? (
                        <div className="bg-white hover:shadow-md hover:scale-[1.01] rounded-2xl p-3 shadow-2xs transition-all space-y-1.5 min-h-[85px] border border-slate-100 flex flex-col justify-between">
                          <div
                            className="font-bold text-slate-900 text-xs leading-snug line-clamp-2"
                            title={slot.subject}
                          >
                            {slot.subject}
                          </div>

                          <div className="space-y-1">
                            {slot.classroom && (
                              <div
                                className="text-[11px] font-semibold text-[#3f8ceb] flex items-center gap-1.5"
                                title={slot.classroom}
                              >
                                <svg
                                  className="w-3.5 h-3.5 shrink-0 text-[#3f8ceb]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                <span className="truncate">{slot.classroom}</span>
                              </div>
                            )}

                            {slot.class && (
                              <div
                                className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5"
                                title={slot.class}
                              >
                                <svg
                                  className="w-3.5 h-3.5 shrink-0 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                <span className="truncate">{slot.class}</span>
                              </div>
                            )}

                            {slot.teacher && (
                              <div
                                className="text-[10px] text-slate-500 flex items-center gap-1.5"
                                title={slot.teacher}
                              >
                                <svg
                                  className="w-3.5 h-3.5 shrink-0 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span className="truncate">{slot.teacher}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="min-h-[85px] rounded-2xl bg-slate-50/50" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
