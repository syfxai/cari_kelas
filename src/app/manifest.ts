import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CARI KELAS — KPTM Ipoh',
    short_name: 'CARI KELAS',
    description: 'Sistem Semakan Jadual Waktu & Cari Kelas Ganti KPTM Ipoh',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#ffffff',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
