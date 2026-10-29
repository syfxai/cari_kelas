'use client';

import { useEffect } from 'react';

export default function PwaRegister(): null {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => {
          // Silent or debug log in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('[PWA] Service Worker registration failed:', err);
          }
        });
    }
  }, []);

  return null;
}
