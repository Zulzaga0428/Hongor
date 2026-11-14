import Link from "next/link";
import { BRAND, COUNTRIES, COUNTRY_ORDER } from "@/content/site";

export function SiteFooter() {
  const col = "grid gap-2.5 text-sm text-white/60";
  const head = "mb-1 text-sm font-extrabold uppercase tracking-wider text-white";
  return (
    <footer className="bg-[#14181f] text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">{BRAND.name.slice(0, 1)}</span>
            {BRAND.name}
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">{BRAND.tagline}. Албан ёсны түнш: {BRAND.partner}.</p>
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
        </div>
        <div className={col}>
          <div className={head}>Мэдээлэл</div>
          <Link href="/#bidnii-tuhai" className="hover:text-white">Бидний тухай</Link>
          <Link href="/nuutslal" className="hover:text-white">Нууцлалын бодлого</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-5 text-xs text-white/40 lg:px-10">© {new Date().getFullYear()} {BRAND.name}</div>
      </div>
    </footer>
  );
}
