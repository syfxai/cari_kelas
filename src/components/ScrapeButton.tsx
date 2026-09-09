'use client';

import { useState } from 'react';

interface ScrapeButtonProps {
  onComplete?: () => void;
}

export default function ScrapeButton({ onComplete }: ScrapeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: Record<string, number> } | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      setResult(data);
      if (data.success && onComplete) {
        onComplete();
      }
    } catch {
      setResult({ success: false, message: 'Ralat semasa scraping' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleScrape}
        disabled={loading}
        className="h-9 px-4 bg-[#00A3FF] hover:bg-[#008fe0] text-white rounded-lg font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sedang memuat data...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Kemas Kini Data Jadual
          </span>
        )}
      </button>

      {result && (
        <div className={`px-3 py-1.5 rounded-lg text-xs border ${
          result.success
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${result.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{result.message}</span>
          </div>
          {result.success && result.data && (
            <div className="mt-0.5 text-[11px] text-emerald-600 pl-3">
              Pensyarah: {result.data.teachers} | Kelas: {result.data.classes} | Bilik: {result.data.rooms}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

