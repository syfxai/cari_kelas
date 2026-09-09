'use client';

import { DAYS, DAY_LABELS, type TimetableSlot } from '@/lib/types';

interface TimetableGridProps {
  slots: TimetableSlot[];
  title?: string;
  subtitle?: string;
}

const STANDARD_PERIODS = [
  { period: 1, time: '08:00', label: '08:00 AM', periodLabel: 'Waktu 1 (8:00 - 9:00)' },
  { period: 2, time: '09:00', label: '09:00 AM', periodLabel: 'Waktu 2 (9:00 - 10:00)' },
  { period: 3, time: '10:00', label: '10:00 AM', periodLabel: 'Waktu 3 (10:00 - 11:00)' },
  { period: 4, time: '11:00', label: '11:00 AM', periodLabel: 'Waktu 4 (11:00 - 12:00)' },
  { period: 5, time: '12:00', label: '12:00 PM', periodLabel: 'Waktu 5 (12:00 - 1:00)' },
  { period: 6, time: '13:00', label: '01:00 PM', periodLabel: 'Waktu 6 (1:00 - 2:00)' },
  { period: 7, time: '14:00', label: '02:00 PM', periodLabel: 'Waktu 7 (2:00 - 3:00)' },
  { period: 8, time: '15:00', label: '03:00 PM', periodLabel: 'Waktu 8 (3:00 - 4:00)' },
  { period: 9, time: '16:00', label: '04:00 PM', periodLabel: 'Waktu 9 (4:00 - 5:00)' },
  { period: 10, time: '17:00', label: '05:00 PM', periodLabel: 'Waktu 10 (5:00 - 6:00)' },
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header Bar */}
      {title && (
        <div className="border-b border-slate-200 px-5 py-3.5 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00A3FF]" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <span className="text-xs text-slate-500">• {subtitle}</span>}
          </div>
          <span className="text-[11px] font-semibold text-[#00A3FF] bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-md">
            {slots.length} sesi berjadual
          </span>
        </div>
      )}

      {/* Complete Weekly Schedule Grid (Waktu 1 – Waktu 10) */}
      <div className="overflow-x-auto p-2.5 sm:p-3.5 bg-slate-50/50">
        <table className="w-full text-left border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="px-3 py-2.5 font-extrabold w-28 text-xs uppercase tracking-wider text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl shadow-2xs">
                Masa
              </th>
              {DAYS.map(day => (
                <th
                  key={day}
                  className="px-3 py-2.5 font-extrabold text-center min-w-[155px] text-xs uppercase tracking-wider text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl shadow-2xs"
                >
                  <span className="hidden sm:inline">{DAY_LABELS[day]}</span>
                  <span className="sm:hidden">{DAY_LABELS[day].substring(0, 3)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STANDARD_PERIODS.map(p => (
              <tr key={p.time}>
                {/* Period & Time Column */}
                <td className="px-3 py-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs align-top whitespace-nowrap">
                  <div className="font-extrabold text-slate-900 text-xs">Waktu {p.period}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.label}</div>
                </td>

                {/* 5 Day Cells */}
                {DAYS.map(day => {
                  const slot = getSlot(day, p.time);
                  return (
                    <td key={day} className="p-0 align-top">
                      {slot ? (
                        <div className="bg-white border border-sky-200/90 hover:border-[#00A3FF] rounded-xl p-2.5 shadow-2xs hover:shadow-xs transition-all space-y-1 min-h-[64px]">
                          <div className="font-bold text-slate-900 text-xs leading-snug">
                            {slot.subject}
                          </div>

                          {slot.classroom && (
                            <div className="text-[11px] font-semibold text-[#00A3FF] flex items-center gap-1">
                              <svg className="w-3 h-3 shrink-0 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="truncate">{slot.classroom}</span>
                            </div>
                          )}

                          {slot.class && (
                            <div className="text-[11px] text-slate-600 flex items-center gap-1">
                              <svg className="w-3 h-3 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="truncate">{slot.class}</span>
                            </div>
                          )}

                          {slot.teacher && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <svg className="w-3 h-3 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate">{slot.teacher}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="min-h-[64px] rounded-xl bg-white/40 border border-slate-200/40" />
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
