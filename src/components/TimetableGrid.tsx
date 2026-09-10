'use client';

import React, { useState } from 'react';
import { DAYS, DAY_LABELS, type TimetableSlot } from '@/lib/types';
import { parseRoomBadge } from '@/lib/roomUtils';

interface TimetableGridProps {
  slots: TimetableSlot[];
  title?: string;
  subtitle?: string;
  viewType?: 'teacher' | 'class' | 'room';
}

const STANDARD_PERIODS = [
  { period: 1, time: '08:00', end: '09:00', label: 'W1', timeRange: '08:00 – 09:00' },
  { period: 2, time: '09:00', end: '10:00', label: 'W2', timeRange: '09:00 – 10:00' },
  { period: 3, time: '10:00', end: '11:00', label: 'W3', timeRange: '10:00 – 11:00' },
  { period: 4, time: '11:00', end: '12:00', label: 'W4', timeRange: '11:00 – 12:00' },
  { period: 5, time: '12:00', end: '13:00', label: 'W5', timeRange: '12:00 – 01:00' },
  { period: 6, time: '13:00', end: '14:00', label: 'W6', timeRange: '01:00 – 02:00' },
  { period: 7, time: '14:00', end: '15:00', label: 'W7', timeRange: '02:00 – 03:00' },
  { period: 8, time: '15:00', end: '16:00', label: 'W8', timeRange: '03:00 – 04:00' },
  { period: 9, time: '16:00', end: '17:00', label: 'W9', timeRange: '04:00 – 05:00' },
  { period: 10, time: '17:00', end: '18:00', label: 'W10', timeRange: '05:00 – 06:00' },
] as const;

const DAY_SHORT: Record<string, string> = {
  Monday: 'ISN',
  Tuesday: 'SEL',
  Wednesday: 'RAB',
  Thursday: 'KHA',
  Friday: 'JUM',
};

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  let hour = h;
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }
  return hour * 60 + (m || 0);
};

export default function TimetableGrid({
  slots,
  title,
  subtitle,
  viewType = 'teacher',
}: TimetableGridProps) {
  const [activeSlot, setActiveSlot] = useState<TimetableSlot | null>(null);

  // Find slot starting at a specific day and time period
  const getSlotAtPeriod = (day: string, periodStartTime: string) => {
    const periodStartMin = timeToMinutes(periodStartTime);
    return slots.find(
      s => s.day.toLowerCase() === day.toLowerCase() && timeToMinutes(s.time) === periodStartMin
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#3f8ceb] shrink-0 animate-pulse" />
          <h2 className="text-sm sm:text-base font-bold text-slate-950 tracking-tight truncate">
            {title || 'Jadual Waktu Mingguan'}
          </h2>
          {subtitle && (
            <span className="hidden sm:inline text-xs text-slate-400 font-medium truncate">
              • {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#3f8ceb] bg-sky-50 px-3 py-1 rounded-full shadow-2xs">
            {slots.length} sesi berjadual
          </span>
        </div>
      </div>

      {/* Legend Bar: Makmal Komputer (MK), Bilik Kuliah (BK), Online, Bilik Tutorial (BT), Studio */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-600 font-medium">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Lokasi:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold shadow-2xs text-[10.5px]">
            <img src="/icons/makmal-komputer.png" alt="MK" className="w-3.5 h-3.5 object-contain shrink-0 inline-block" />
            <span>MK</span> <span className="font-normal text-emerald-600 hidden sm:inline">(Makmal Komputer)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold shadow-2xs text-[10.5px]">
            <img src="/icons/bilik-kuliah.png" alt="BK" className="w-3.5 h-3.5 object-contain shrink-0 inline-block" />
            <span>BK</span> <span className="font-normal text-indigo-600 hidden sm:inline">(Bilik Kuliah)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold shadow-2xs text-[10.5px]">
            <img src="/icons/online.png" alt="Online" className="w-3.5 h-3.5 object-contain shrink-0 inline-block" />
            <span>Online</span> <span className="font-normal text-sky-600 hidden sm:inline">(Kelas Maya)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold shadow-2xs text-[10.5px]">
            <img src="/icons/bilik-tutorial.png" alt="BT" className="w-3.5 h-3.5 object-contain shrink-0 inline-block" />
            <span>BT</span> <span className="font-normal text-amber-600 hidden sm:inline">(Bilik Tutorial)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold shadow-2xs text-[10.5px]">
            <img src="/icons/studio.png" alt="Studio" className="w-3.5 h-3.5 object-contain shrink-0 inline-block" />
            <span>Studio</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-400 hidden md:inline">
          * Blok 2 jam digabungkan secara automatik
        </span>
      </div>

      {/* Main Grid: Compact Table Layout to eliminate horizontal scroll */}
      <div className="p-2 sm:p-3 overflow-x-auto lg:overflow-x-visible">
        <table className="w-full table-fixed border-separate border-spacing-1 sm:border-spacing-1.5 text-left">
          <thead>
            <tr>
              {/* Day Header Column */}
              <th className="w-[48px] sm:w-[68px] p-1 sm:p-2 font-bold text-center text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-600 bg-slate-100/80 rounded-xl">
                Hari
              </th>

              {/* 10 Time Period Headers */}
              {STANDARD_PERIODS.map(p => (
                <th
                  key={p.period}
                  className="p-1 sm:p-1.5 text-center bg-slate-50 rounded-xl border border-slate-100/80"
                >
                  <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px]">
                    <span className="sm:hidden">W{p.period}</span>
                    <span className="hidden sm:inline">Waktu {p.period}</span>
                  </div>
                  <div className="text-[8.5px] sm:text-[9px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
                    {p.timeRange}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map(day => {
              let nextAvailableIdx = 0;

              return (
                <tr key={day}>
                  {/* Day Label Cell */}
                  <td className="p-1 sm:p-2 bg-slate-50/90 rounded-xl align-middle text-center border border-slate-100">
                    <div className="font-black text-slate-900 text-[11px] sm:text-xs">
                      {DAY_SHORT[day] || day.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium hidden sm:block mt-0.5">
                      {DAY_LABELS[day] || day}
                    </div>
                  </td>

                  {/* 10 Periods for this Day */}
                  {STANDARD_PERIODS.map((p, periodIdx) => {
                    if (periodIdx < nextAvailableIdx) {
                      return null;
                    }

                    const slot = getSlotAtPeriod(day, p.time);

                    if (!slot) {
                      nextAvailableIdx = periodIdx + 1;
                      return (
                        <td key={p.period} className="p-0 align-top">
                          <div className="min-h-[86px] sm:min-h-[92px] rounded-xl bg-slate-50/50 border border-dashed border-slate-200/40 hover:bg-slate-50 transition-colors flex items-center justify-center">
                            <span className="text-[10px] text-slate-300 font-mono">—</span>
                          </div>
                        </td>
                      );
                    }

                    const sStartMin = timeToMinutes(slot.time);
                    const sEndMin = timeToMinutes(slot.timeEnd || slot.time);
                    const spanHours = Math.max(1, Math.min(10 - periodIdx, Math.round((sEndMin - sStartMin) / 60)));
                    nextAvailableIdx = periodIdx + spanHours;
                    const roomBadge = parseRoomBadge(slot.classroom);

                    return (
                      <td
                        key={p.period}
                        colSpan={spanHours}
                        className="p-0 align-top relative group"
                      >
                        <div
                          onClick={() => setActiveSlot(slot)}
                          className={`min-h-[86px] sm:min-h-[92px] h-full p-2 sm:p-2.5 rounded-xl border bg-white transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                            roomBadge.category === 'lab'
                              ? 'border-emerald-200/70 hover:border-emerald-300 shadow-2xs'
                              : roomBadge.category === 'online'
                              ? 'border-sky-200/70 hover:border-sky-300 shadow-2xs'
                              : roomBadge.category === 'lecture'
                              ? 'border-indigo-200/70 hover:border-indigo-300 shadow-2xs'
                              : 'border-slate-200/70 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {/* Top Row: Subject Title + Duration Pill */}
                          <div className="flex items-start justify-between gap-1">
                            <div
                              className="font-bold text-slate-950 text-[10px] sm:text-[11px] leading-snug line-clamp-2 break-words"
                              title={slot.subject}
                            >
                              {slot.subject}
                            </div>
                            {spanHours > 1 && (
                              <span className="shrink-0 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 shadow-2xs leading-none">
                                {spanHours}J
                              </span>
                            )}
                          </div>

                          {/* Middle: Clear Location Badge (MK / BK / Online / BT / Studio) */}
                          <div className="my-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] sm:text-[9.5px] font-bold shadow-2xs ${roomBadge.bgClass} ${roomBadge.textClass} max-w-full leading-tight`}
                              title={roomBadge.fullName}
                            >
                              <img src={roomBadge.iconUrl} alt="" className="w-3 h-3 object-contain shrink-0 inline-block" />
                              <span className="truncate">{roomBadge.code}</span>
                            </span>
                          </div>

                          {/* Bottom Row: Context details */}
                          <div className="text-[9px] sm:text-[9.5px] text-slate-600 font-medium flex items-center gap-1 min-w-0">
                            {viewType === 'teacher' ? (
                              slot.class ? (
                                <>
                                  <svg className="w-3 h-3 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span className="truncate font-semibold text-slate-700" title={slot.class}>{slot.class}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic text-[8.5px]">Sesi Khas</span>
                              )
                            ) : (
                              slot.teacher && (
                                <>
                                  <svg className="w-3 h-3 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="truncate font-semibold text-slate-700" title={slot.teacher}>{slot.teacher}</span>
                                </>
                              )
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interactive Modal / Popover on slot click */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3f8ceb] bg-sky-50 px-2.5 py-1 rounded-full shadow-2xs">
                  {DAY_LABELS[activeSlot.day] || activeSlot.day} • {activeSlot.time} – {activeSlot.timeEnd}
                </span>
                <h3 className="text-base font-extrabold text-slate-950 mt-2">
                  {activeSlot.subject}
                </h3>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-950 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi / Bilik</div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <img
                    src={parseRoomBadge(activeSlot.classroom).iconUrl}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  <span>{activeSlot.classroom || 'Tiada Bilik Ditetapkan'}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {parseRoomBadge(activeSlot.classroom).categoryLabel}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelas / Seksyen</div>
                <div className="font-bold text-slate-900 truncate">
                  {activeSlot.class || '—'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Kumpulan Pelajar
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 col-span-2 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pensyarah</div>
                <div className="font-bold text-slate-900">
                  {activeSlot.teacher || '—'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveSlot(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

