import type { MetadataRoute } from "next";
import { BRAND } from "@/content/site";

/**
 * PWA manifest — утасны нүүр дэлгэцэд апп шиг суулгана.
 * start_url=/home: сурагч шууд нүүр рүүгээ, нэвтрээгүй бол /nevtreh,
 * ажилтан бол өөрийн самбар руу (homeFor) шилжинэ.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${BRAND.name} — ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: "Солонгос, Япон, Чехэд албан ёсоор ажиллах: бүртгэл, хэлний сургалт, бичиг баримт, явцаа хянах.",
    lang: "mn",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f6f7",
    theme_color: "#0f8a7e",
    categories: ["education", "business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Хичээл", url: "/hicheel", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Миний материал", url: "/material", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
