import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BRAND, COUNTRIES, COUNTRY_ORDER } from "@/content/site";
import { BRAND_THEME } from "@/components/theme";

const POINTS = ["Албан ёсны, гэрээтэй хөтөлбөрүүд", "Хэлний сургалт, тест утсаараа", "Материал, визийн явцаа өөрөө хянана"];

/**
 * Нэвтрэх / бүртгүүлэх хуудасны хүрээ. Компьютер: зүүнд брэндийн самбар,
 * баруунд форм. Утас: дээр жижиг брэндийн толгой, доор форм.
 */
export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div style={BRAND_THEME} className="min-h-dvh bg-[#f4f6f7] text-ink lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Брэндийн самбар */}
      <aside className="relative overflow-hidden bg-brand text-white">
        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 lg:h-[28rem] lg:w-[28rem]" />
        <div aria-hidden className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-white/5 lg:h-96 lg:w-96" />
        <div className="relative flex h-full flex-col px-5 py-5 lg:px-12 lg:py-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-brand">{BRAND.name.slice(0, 1)}</span>
              <span className="text-xl font-extrabold">{BRAND.name}</span>
            </Link>
            <Link href="/" className="flex items-center gap-1 text-sm font-bold text-white/80 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Нүүр
            </Link>
          </div>

          <div className="mt-6 hidden lg:mt-auto lg:block">
            <h2 className="text-4xl font-extrabold leading-tight">{BRAND.tagline}</h2>
            <p className="mt-3 max-w-md text-white/80">Бүртгүүлж, хэлээ сураад, материалаа бүрдүүлж, явцаа нэг дороос хянаарай.</p>
            <ul className="mt-8 grid gap-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 font-bold">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-white/90" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 lg:mt-10">
            {COUNTRY_ORDER.map((s) => (
              <span key={s} className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold lg:text-sm">
                {COUNTRIES[s].hello} · {COUNTRIES[s].name}
              </span>
            ))}
          </div>
          <p className="mt-6 hidden text-xs text-white/60 lg:block">Албан ёсны түнш: {BRAND.partner}</p>
        </div>
      </aside>

      {/* Форм */}
      <main className="flex items-start justify-center px-4 py-6 lg:items-center lg:px-10 lg:py-12">
        <div className="w-full max-w-md rounded-xl border-t-[3px] border-brand bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06)] lg:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted">{subtitle}</p>
          {children}
          {footer && <div className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
