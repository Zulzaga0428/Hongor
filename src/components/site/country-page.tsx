import Link from "next/link";
import { COUNTRIES, COUNTRY_ORDER, STEPS, type CountrySlug } from "@/content/site";
import { currentUser, homeFor } from "@/server/auth";
import { CountryArt } from "./country-art";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * Улс бүрийн хуудас. Бүх өнгө нь CSS хувьсагчаас (--c1 үндсэн, --c2 нэмэлт,
 * --cs зөөлөн) — ингэснээр нэг загвар 3 өөр дүр төрхтэй болно.
 */
export async function CountryPage({ slug }: { slug: CountrySlug }) {
  const c = COUNTRIES[slug];
  const u = await currentUser();
  const others = COUNTRY_ORDER.filter((s) => s !== slug).map((s) => COUNTRIES[s]);
  const vars = { "--c1": c.primary, "--c2": c.accent, "--cs": c.soft } as React.CSSProperties;

  return (
    <div style={vars} className="bg-white text-ink">
      <SiteHeader overHero home={u ? homeFor(u.role) : null} />

      <section className="relative h-[78svh] min-h-[520px] overflow-hidden text-white">
        <CountryArt c={c} priority />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-5 pt-16 lg:px-10">
          <p className="text-sm font-bold text-white/80 lg:text-base">
            {c.hello} · {c.city}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.1] lg:text-6xl">{c.heroTitle}</h1>
          <p className="mt-4 max-w-xl text-white/85 lg:text-lg">{c.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/burtgel" className="rounded-full bg-white px-6 py-3.5 font-extrabold" style={{ color: "var(--c1)" }}>
              {c.name} руу бүртгүүлэх
            </Link>
            {c.courseReady && (
              <Link href="/burtgel" className="rounded-full border-2 border-white/70 px-6 py-3.5 font-extrabold text-white hover:bg-white/10">
                Хэлний сургалт
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Хөтөлбөрүүд */}
      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 lg:px-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {c.programs.map((p, k) => (
            <div key={p.title} className="rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-extrabold text-white" style={{ background: k === 1 ? "var(--c2)" : "var(--c1)" }}>
                {k + 1}
              </div>
              <h3 className="mt-4 text-lg font-extrabold">{p.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Алхамууд */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-10">
        <p className="text-sm font-extrabold uppercase tracking-wider" style={{ color: "var(--c1)" }}>
          Хэрхэн явдаг вэ
        </p>
        <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">{c.name} руу явах алхамууд</h2>
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, k) => (
            <li key={s.title} className="rounded-3xl p-6" style={{ background: "var(--cs)" }}>
              <div className="text-3xl font-extrabold" style={{ color: "var(--c1)" }}>
                {String(k + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 font-extrabold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Шаардлага — эгчээс тодруулах хүртэл ерөнхий */}
      <section className="px-5 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-[2rem] px-8 py-10 lg:px-14" style={{ background: "var(--cs)" }}>
          <h2 className="text-2xl font-extrabold">Шаардлага</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">
            Нас, эрүүл мэнд, боловсрол, хэлний түвшний шаардлага хөтөлбөр бүрээр өөр байна. Бүртгүүлсний дараа манай ажилтан танд тохирох
            хөтөлбөрийг тодорхойлж өгнө.
          </p>
        </div>
      </section>

      {/* Бусад улс */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-10">
        <h2 className="text-2xl font-extrabold">Бусад улс</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {others.map((o) => (
            <Link key={o.slug} href={`/${o.slug}`} className="group relative flex h-36 items-end overflow-hidden rounded-3xl p-6 text-white">
              <CountryArt c={o} big={false} />
              <div className="relative">
                <div className="text-xs font-bold text-white/80">{o.hello}</div>
                <div className="text-2xl font-extrabold">
                  {o.name} <span className="inline-block transition group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
