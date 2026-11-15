import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Facebook } from "./fb-icon";
import { BRAND, COUNTRIES, COUNTRY_ORDER, phoneDisplay } from "@/content/site";

export function SiteFooter() {
  const col = "grid content-start gap-2.5 text-sm text-white/60";
  const head = "mb-1 text-sm font-extrabold uppercase tracking-wider text-white";
  const social = [
    { href: BRAND.facebook, label: "Facebook", icon: Facebook },
    { href: BRAND.email === "#" ? "#" : `mailto:${BRAND.email}`, label: "Имэйл", icon: Mail },
  ];
  return (
    <footer className="bg-[#14181f] text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:px-10">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">{BRAND.name.slice(0, 1)}</span>
            {BRAND.name}
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            {BRAND.tagline}. Албан ёсны түнш: {BRAND.partner}.
          </p>
          <div className="mt-4 flex gap-2">
            {social.map((s) => {
              const Icon = s.icon;
              const soon = s.href === "#";
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={soon ? `${s.label} (удахгүй)` : s.label}
                  aria-disabled={soon || undefined}
                  title={soon ? "Удахгүй" : s.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ${soon ? "pointer-events-none opacity-40" : "hover:bg-brand"}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
        <div className={col}>
          <div className={head}>Улсууд</div>
          {COUNTRY_ORDER.map((s) => (
            <Link key={s} href={`/${s}`} className="hover:text-white">
              {COUNTRIES[s].name}
            </Link>
          ))}
        </div>
        <div className={col}>
          <div className={head}>Сурагчдад</div>
          <Link href="/burtgel" className="hover:text-white">Бүртгүүлэх</Link>
          <Link href="/nevtreh" className="hover:text-white">Нэвтрэх</Link>
          <Link href="/#surgalt" className="hover:text-white">Хэлний сургалт</Link>
          <Link href="/#bidnii-tuhai" className="hover:text-white">Бидний тухай</Link>
          <Link href="/nuutslal" className="hover:text-white">Нууцлалын бодлого</Link>
        </div>
        <div className={`${col} col-span-2 lg:col-span-1`}>
          <div className={head}>Холбоо барих</div>
          <a href={`tel:+976${BRAND.phone}`} className="flex items-center gap-2 font-bold text-white hover:text-brand">
            <Phone className="h-4 w-4 shrink-0" /> {phoneDisplay(BRAND.phone)}
          </a>
          <Link href="/#holboo" className="flex items-start gap-2 leading-relaxed hover:text-white">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {BRAND.address}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 text-xs text-white/40 sm:flex-row sm:justify-between lg:px-10">
          <span>
            © {new Date().getFullYear()} {BRAND.name}
          </span>
          <span>
            Хөгжүүлсэн:{" "}
            <a href={BRAND.developer.url} target="_blank" rel="noreferrer" className="font-bold text-white/70 hover:text-white">
              {BRAND.developer.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
