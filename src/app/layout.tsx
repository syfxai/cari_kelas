import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CARI KELAS — Cari Kelas Ganti & Bilik Kosong KPTM Ipoh",
  description: "Sistem Cari Kelas KPTM Ipoh untuk mencari kelas ganti, bilik kosong, dan jadual waktu dengan mudah dan pantas.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
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
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)] bg-[#F4F6F9]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
