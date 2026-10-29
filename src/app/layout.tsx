import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AppShell from "@/components/AppShell";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "CARI KELAS — Cari Kelas Ganti & Bilik Kosong KPTM Ipoh",
  description: "Sistem Cari Kelas KPTM Ipoh untuk mencari kelas ganti, bilik kosong, dan jadual waktu dengan mudah dan pantas.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CARI KELAS",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredPwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPwaPrompt = e;
                window.dispatchEvent(new Event('pwa-prompt-ready'));
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)] bg-[#F4F6F9]">
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
