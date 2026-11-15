import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Facebook } from "./fb-icon";
import { BRAND, phoneDisplay } from "@/content/site";

/** Нүүрний «Холбоо барих» — хаяг, утас, (FB/имэйл түр «#»), газрын зураг. */
export function ContactSection() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(BRAND.mapQuery)}&z=17&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;
  const items = [
    { icon: Phone, label: "Утас", value: phoneDisplay(BRAND.phone), href: `tel:+976${BRAND.phone}` },
    { icon: MapPin, label: "Хаяг", value: BRAND.address, href: mapLink, ext: true },
    { icon: Mail, label: "Имэйл", value: "Удахгүй", href: BRAND.email },
    { icon: Facebook, label: "Facebook", value: "Удахгүй", href: BRAND.facebook },
  ];
  return (
    <section id="holboo" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20 lg:px-10">
      <p className="text-sm font-extrabold uppercase tracking-wider text-brand">Холбоо барих</p>
      <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">Манай оффист ирээрэй</h2>
      <p className="mt-2 max-w-xl text-muted">Асуух зүйл байвал залгаарай, эсвэл оффис дээр ирж биечлэн бүртгүүлж болно.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ul className="grid grid-cols-1 content-start gap-3">
          {items.map((it) => {
            const Icon = it.icon;
            const soon = it.href === "#";
            return (
              <li key={it.label}>
                <a
                  href={it.href}
                  target={it.ext ? "_blank" : undefined}
                  rel={it.ext ? "noreferrer" : undefined}
                  aria-disabled={soon || undefined}
                  className={`flex items-start gap-4 rounded-2xl border border-line bg-white p-4 transition ${soon ? "pointer-events-none opacity-60" : "hover:border-brand"}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wide text-muted">{it.label}</span>
                    <span className={`mt-0.5 block font-bold leading-snug ${it.label === "Утас" ? "text-xl tracking-wide text-brand" : ""}`}>{it.value}</span>
                  </span>
                </a>
              </li>
            );
          })}
          <li className="flex items-center gap-2 px-1 text-sm text-muted">
            <Clock className="h-4 w-4" /> Ажлын цагаар утсаар болон биечлэн хүлээн авна.
          </li>
        </ul>

        <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-line bg-[#eef2f3] lg:min-h-[380px]">
          <iframe
            title="Газрын зураг — Юнион Билдинг"
            src={mapSrc}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={mapLink}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand shadow-md"
          >
            Google Maps-д нээх →
          </a>
        </div>
      </div>
    </section>
  );
}
