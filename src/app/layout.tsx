import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const round = M_PLUS_Rounded_1c({
  variable: "--font-round",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin", "cyrillic"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Япон хэл — Хонгор Түрүү",
  description: "Японд ажиллахаар бэлдэж буй сурагчдын япон хэлний сургалт: анхан, дунд, ахисан шат.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d7263d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${round.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
