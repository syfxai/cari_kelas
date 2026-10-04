'use client';

import { useState } from 'react';

interface ScrapeButtonProps {
  onComplete?: () => void;
  className?: string;
}

export default function ScrapeButton({ onComplete, className = '' }: ScrapeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: Record<string, number | string>;
  } | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        window.dispatchEvent(new CustomEvent('timetable-updated', { detail: data }));
        if (onComplete) {
          onComplete();
        }
      }
    } catch {
      setResult({ success: false, message: 'Ralat semasa menyegerak dengan EduPage' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleScrape}
        disabled={loading}
        className="h-10 px-5 bg-[#3f8ceb] hover:bg-[#3280e2] text-white rounded-xl font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2 cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Menyegerak EduPage...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Kemas Kini Data EduPage
          </span>
        )}
      </button>

      {result && (
        <div
          className={`px-3.5 py-2 rounded-xl text-xs border ${
            result.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                result.success ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span>{result.message}</span>
          </div>
          {result.success && result.data && (
            <div className="mt-1 text-[11px] text-emerald-700 pl-3">
              Pensyarah: {result.data.teachers} | Kelas: {result.data.classes} | Bilik: {result.data.rooms} | Slot: {result.data.totalSlots}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
