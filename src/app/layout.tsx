import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import { BRAND } from "@/content/site";
import "./globals.css";

const round = M_PLUS_Rounded_1c({
  variable: "--font-round",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin", "cyrillic"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: "Солонгос, Япон, Чехэд албан ёсоор ажиллах: бүртгэл, хэлний сургалт, бичиг баримт — нэг дор.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f8a7e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${round.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
