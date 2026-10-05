'use client';

import React, { useState, useRef } from 'react';
import { DAYS, DAY_LABELS, type TimetableSlot } from '@/lib/types';
import { parseRoomBadge } from '@/lib/roomUtils';
import MarqueeText from '@/components/MarqueeText';

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

export function formatCleanClassCodes(raw?: string): string {
  if (!raw) return '';
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  const codes = parts.map(p => {
    const match = p.match(/^([A-Z0-9]+)/i);
    return match ? match[1] : p;
  });

  if (codes.length <= 1) return codes[0] || '';
  if (codes.length === 2) return `${codes[0]} & ${codes[1]}`;
  return `${codes.slice(0, -1).join(', ')} & ${codes[codes.length - 1]}`;
}

export function getClassCodesList(raw?: string): string[] {
  if (!raw) return [];
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  return parts.map(p => {
    const match = p.match(/^([A-Z0-9]+)/i);
    return match ? match[1] : p;
  });
}

// Reusable Cell Card with Apple-grade 3D depth and Marquee Hover
function SlotCard({
  slot,
  spanHours,
  viewType,
  onClick,
}: {
  slot: TimetableSlot;
  spanHours: number;
  viewType: 'teacher' | 'class' | 'room';
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const roomBadge = parseRoomBadge(slot.classroom);

  const classList = (slot.class || '').split(',').map(s => s.trim()).filter(Boolean);
  const isMultiClass = classList.length > 1;
  const cleanClassCodes = formatCleanClassCodes(slot.class);
  const classCodes = getClassCodesList(slot.class);

  // Directly display clean class codes (e.g. "DIM0301, DIM0302") for multi-class slots or 1-hour slots.
  // Full details (section & intake) are revealed on hover marquee and interactive modal.
  const staticClassDisplay = isMultiClass
    ? cleanClassCodes
    : spanHours === 1
    ? cleanClassCodes
    : slot.class;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`min-h-[86px] sm:min-h-[92px] h-full p-2 sm:p-2.5 rounded-xl border bg-white transition-all duration-300 flex flex-col justify-between cursor-pointer transform-gpu will-change-transform ${
        roomBadge.category === 'lab'
          ? 'border-emerald-200/80 hover:border-emerald-400 hover:shadow-emerald-500/10'
          : roomBadge.category === 'online'
          ? 'border-sky-200/80 hover:border-sky-400 hover:shadow-sky-500/10'
          : roomBadge.category === 'lecture'
          ? 'border-indigo-200/80 hover:border-indigo-400 hover:shadow-indigo-500/10'
          : 'border-slate-200/80 hover:border-slate-400 hover:shadow-slate-500/10'
      } ${isHovered ? 'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] z-10' : 'shadow-2xs'}`}
      style={{
        transform: isHovered
          ? 'translateY(-2px) rotateX(1.5deg) scale(1.015)'
          : 'translateY(0) rotateX(0deg) scale(1)',
        transformOrigin: 'center bottom',
      }}
    >
      {/* Top Row: Subject Title with Marquee Effect + Duration Pill (for >1 hour) */}
      <div className="flex items-start justify-between gap-1 min-w-0">
        <div className="min-w-0 flex-1">
          <MarqueeText
            text={slot.subject}
            isParentHovered={isHovered}
            className="font-bold text-slate-950 text-[10px] sm:text-[11px] leading-snug"
          />
        </div>
        {spanHours > 1 && (
          <span className="shrink-0 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 shadow-2xs leading-none">
            {spanHours}J
          </span>
        )}
      </div>

      {/* Middle Row: Room / Location Badge + Combined Class Pill */}
      <div className="my-1 min-w-0 flex items-center justify-between gap-1">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] sm:text-[9.5px] font-bold shadow-2xs max-w-full leading-tight ${roomBadge.bgClass} ${roomBadge.textClass}`}
          title={roomBadge.fullName}
        >
          <img
            src={roomBadge.iconUrl}
            alt=""
            className="w-3 h-3 object-contain shrink-0 inline-block"
          />
          <MarqueeText
            text={roomBadge.code}
            isParentHovered={isHovered}
            className="text-[9px] sm:text-[9.5px] font-bold"
          />
        </span>
        {isMultiClass && (
          <span
            className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 shadow-2xs leading-none shrink-0"
            title={`${classList.length} Kelas Gabungan: ${cleanClassCodes}`}
          >
            {classList.length}K
          </span>
        )}
      </div>

      {/* Bottom Row: Context details - stacked clean codes for multi-classes */}
      <div className="text-[9px] sm:text-[9.5px] text-slate-600 font-medium min-w-0">
        {viewType === 'teacher' ? (
          slot.class ? (
            isMultiClass ? (
              <div
                className="w-full flex flex-col gap-0.5 text-slate-700 font-semibold"
                title={slot.class}
              >
                {classCodes.slice(0, 3).map((code, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 text-[8.5px] sm:text-[9px] leading-tight"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span className="truncate">{code}</span>
                  </div>
                ))}
                {classCodes.length > 3 && (
                  <span className="text-[7.5px] text-purple-600 font-bold leading-none pl-2.5">
                    +{classCodes.length - 3} lagi
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                <MarqueeText
                  text={spanHours === 1 ? cleanClassCodes : slot.class}
                  hoverText={slot.class}
                  isParentHovered={isHovered}
                  prefixIcon={
                    <svg
                      className="w-3 h-3 shrink-0 text-slate-400"
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
                  }
                  className="text-[9px] sm:text-[9.5px] font-semibold text-slate-700"
                />
              </div>
            )
          ) : (
            <span className="text-slate-400 italic text-[8.5px]">Sesi Khas</span>
          )
        ) : (
          slot.teacher && (
            <div className="flex items-center gap-1 min-w-0">
              <MarqueeText
                text={slot.teacher}
                isParentHovered={isHovered}
                prefixIcon={
                  <svg
                    className="w-3 h-3 shrink-0 text-slate-400"
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
                }
                className="text-[9px] sm:text-[9.5px] font-semibold text-slate-700"
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function TimetableGrid({
  slots,
  title,
  subtitle,
  viewType = 'teacher',
}: TimetableGridProps) {
  const [activeSlot, setActiveSlot] = useState<TimetableSlot | null>(null);

  // Mobile View Scale & Pinch-Zoom State
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomMode, setZoomMode] = useState<'fit' | 'normal' | 'large' | 'custom'>('normal');
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  // Pinch-to-zoom gesture listener for mobile touch screens
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = zoomScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistRef.current;
      const newScale = Math.max(
        0.58,
        Math.min(1.5, Number((touchStartScaleRef.current * ratio).toFixed(2)))
      );
      setZoomScale(newScale);
      setZoomMode('custom');
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Find slot starting at a specific day and time period
  const getSlotAtPeriod = (day: string, periodStartTime: string) => {
    const periodStartMin = timeToMinutes(periodStartTime);
    return slots.find(
      s => s.day.toLowerCase() === day.toLowerCase() && timeToMinutes(s.time) === periodStartMin
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden perspective-1000">
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
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            Lokasi:
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold shadow-2xs text-[10.5px]">
            <img
              src="/icons/makmal-komputer.png"
              alt="MK"
              className="w-3.5 h-3.5 object-contain shrink-0 inline-block"
            />
            <span>MK</span>{' '}
            <span className="font-normal text-emerald-600 hidden sm:inline">
              (Makmal Komputer)
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold shadow-2xs text-[10.5px]">
            <img
              src="/icons/bilik-kuliah.png"
              alt="BK"
              className="w-3.5 h-3.5 object-contain shrink-0 inline-block"
            />
            <span>BK</span>{' '}
            <span className="font-normal text-indigo-600 hidden sm:inline">
              (Bilik Kuliah)
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold shadow-2xs text-[10.5px]">
            <img
              src="/icons/online.png"
              alt="Online"
              className="w-3.5 h-3.5 object-contain shrink-0 inline-block"
            />
            <span>Online</span>{' '}
            <span className="font-normal text-sky-600 hidden sm:inline">
              (Kelas Maya)
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold shadow-2xs text-[10.5px]">
            <img
              src="/icons/bilik-tutorial.png"
              alt="BT"
              className="w-3.5 h-3.5 object-contain shrink-0 inline-block"
            />
            <span>BT</span>{' '}
            <span className="font-normal text-amber-600 hidden sm:inline">
              (Bilik Tutorial)
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold shadow-2xs text-[10.5px]">
            <img
              src="/icons/studio.png"
              alt="Studio"
              className="w-3.5 h-3.5 object-contain shrink-0 inline-block"
            />
            <span>Studio</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-400 hidden md:inline">
          * Blok 2 jam digabungkan secara automatik • Hover kotak sempit untuk membaca teks penuh
        </span>
      </div>

      {/* Mobile Responsive Scale Toolbar & Pinch Zoom Quick Controls */}
      <div className="px-3 sm:px-6 py-2 bg-slate-100/60 border-b border-slate-100 flex items-center justify-between gap-2 text-xs lg:hidden">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <span className="hidden xs:inline">Paparan:</span>
          <span className="font-bold text-slate-800">{Math.round(zoomScale * 100)}%</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">(Pinch-zoom aktif)</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setZoomScale(0.68);
              setZoomMode('fit');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
              zoomMode === 'fit'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
            title="Kecilkan perkadaran untuk melihat seluruh jadual dalam skrin telefon tanpa ruangan disempitkan"
          >
            Muat Skrin
          </button>
          <button
            onClick={() => {
              setZoomScale(1.0);
              setZoomMode('normal');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
              zoomMode === 'normal'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
            title="Saiz standard 1:1"
          >
            100%
          </button>
          <button
            onClick={() => {
              setZoomScale(1.25);
              setZoomMode('large');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
              zoomMode === 'large'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
            title="Zum besar untuk membaca dengan lebih jelas"
          >
            125%
          </button>
        </div>
      </div>

      {/* Main Grid: Scrollable Container with Pinch-Zoom Support and Minimum Width */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="p-2 sm:p-3 overflow-x-auto lg:overflow-x-visible timetable-scroll-container transition-all"
      >
        <div
          style={{
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: 'top left',
            width: zoomScale !== 1 ? `${(100 / zoomScale).toFixed(2)}%` : '100%',
            transition: zoomMode !== 'custom' ? 'transform 0.25s ease-out, width 0.25s ease-out' : undefined,
          }}
        >
          {/* min-w-[780px] ensures columns never squash or squeeze below readable size */}
          <table className="w-full min-w-[780px] lg:min-w-0 table-fixed border-separate border-spacing-1 sm:border-spacing-1.5 text-left">
            <thead>
              <tr>
                {/* Day Header Column */}
                <th className="w-[52px] sm:w-[68px] p-1 sm:p-2 font-bold text-center text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-600 bg-slate-100/80 rounded-xl">
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
                      const spanHours = Math.max(
                        1,
                        Math.min(10 - periodIdx, Math.round((sEndMin - sStartMin) / 60))
                      );
                      nextAvailableIdx = periodIdx + spanHours;

                      return (
                        <td
                          key={p.period}
                          colSpan={spanHours}
                          className="p-0 align-top relative group"
                        >
                          <SlotCard
                            slot={slot}
                            spanHours={spanHours}
                            viewType={viewType}
                            onClick={() => setActiveSlot(slot)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal / Popover on slot click */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3f8ceb] bg-sky-50 px-2.5 py-1 rounded-full shadow-2xs">
                  {DAY_LABELS[activeSlot.day] || activeSlot.day} • {activeSlot.time} –{' '}
                  {activeSlot.timeEnd}
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
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Lokasi / Bilik
                </div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <img
                    src={parseRoomBadge(activeSlot.classroom).iconUrl}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  <span>
                    {activeSlot.classroom?.toUpperCase().includes('ONLINE')
                      ? 'Online (Kelas Maya)'
                      : activeSlot.classroom || 'Tiada Bilik Ditetapkan'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {parseRoomBadge(activeSlot.classroom).categoryLabel}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Kelas / Seksyen</span>
                  {activeSlot.class && activeSlot.class.includes(',') && (
                    <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                      Kelas Gabungan
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {activeSlot.class ? (
                    activeSlot.class.includes(',') ? (
                      <div className="space-y-1 pt-0.5">
                        {activeSlot.class.split(',').map((cls, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            <span className="break-words">{cls.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="break-words">{activeSlot.class}</div>
                    )
                  ) : (
                    '—'
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Kumpulan Pelajar
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 col-span-2 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pensyarah
                </div>
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
