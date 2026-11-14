import Image from "next/image";
import type { CountryTheme } from "@/content/site";

/**
 * Улс бүрийн дэвсгэр. Зураг (country.image) байвал зураг + бараан бүрхүүл,
 * байхгүй бол тугны өнгөнөөс градиент + тугны хэлбэрээс санаа авсан чимэглэл.
 * Зураг ирэхэд site.ts-д `image: "/hero/korea.jpg"` гэж нэмэхэд л болно.
 */
export function CountryArt({ c, priority = false, big = true }: { c: CountryTheme; priority?: boolean; big?: boolean }) {
  if (c.image) {
    return (
      <div className="absolute inset-0">
        <Image src={c.image} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${c.primary} 0%, color-mix(in srgb, ${c.primary} 55%, #000) 100%)` }}
      aria-hidden
    >
      {/* Тугны хэлбэр */}
      {c.slug === "japan" && (
        <div
          className="absolute rounded-full"
          style={{ right: "-6%", top: "12%", width: big ? "46vmin" : "60%", aspectRatio: "1", background: "rgba(255,255,255,0.12)" }}
        />
      )}
      {c.slug === "korea" && (
        <div
          className="absolute rounded-full"
          style={{
            right: "-4%",
            top: "14%",
            width: big ? "44vmin" : "58%",
            aspectRatio: "1",
            background: `linear-gradient(180deg, ${c.accent} 0 50%, rgba(255,255,255,0.14) 50% 100%)`,
            transform: "rotate(-34deg)",
            opacity: 0.55,
          }}
        />
      )}
      {c.slug === "czech" && (
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: "38%", background: "rgba(255,255,255,0.08)", clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
        />
      )}
      <div
        className="absolute bottom-[-0.12em] right-[-0.04em] select-none font-extrabold leading-none text-white/10"
        style={{ fontSize: big ? "clamp(6rem, 22vw, 20rem)" : "6rem" }}
      >
        {c.native}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent" />
    </div>
  );
}
