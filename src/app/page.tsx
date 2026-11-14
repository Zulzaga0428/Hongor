import Link from "next/link";
import { BRAND, COUNTRIES, COUNTRY_ORDER, STEPS } from "@/content/site";
import { currentUser, homeFor } from "@/server/auth";
import { CountryArt } from "@/components/site/country-art";
import { HeroSlider } from "@/components/site/hero-slider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default async function Landing() {
  const u = await currentUser();

  return (
    <div className="bg-white text-ink">
      <SiteHeader overHero home={u ? homeFor(u.role) : null} />
      <HeroSlider />

      {/* 3 улс — hero-гийн доод ирмэг дээр давхарлана */}
      <section className="relative z-10 mx-auto -mt-28 max-w-6xl px-5 lg:-mt-36 lg:px-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {COUNTRY_ORDER.map((s) => {
            const c = COUNTRIES[s];
            return (
              <Link
                key={s}
                href={`/${s}`}
                className="group overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
              >
                <div className="relative h-32 lg:h-40">
                  <CountryArt c={c} big={false} />
                  <div className="absolute bottom-3 left-5 text-white">
                    <div className="text-xs font-bold text-white/80">{c.hello}</div>
                    <div className="text-2xl font-extrabold">{c.name}</div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-muted">{c.cardText}</p>
                  <div className="mt-4 text-sm font-extrabold" style={{ color: c.primary }}>
                    Дэлгэрэнгүй <span className="inline-block transition group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Бидний тухай */}
      <section id="bidnii-tuhai" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-brand">Бидний тухай</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight lg:text-4xl">Хууль ёсны, найдвартай, нэг дор</h2>
            <p className="mt-4 leading-relaxed text-muted">
              {BRAND.name} нь гадаадад ажиллахыг хүссэн хүн бүрийг бүртгэл, хэлний сургалт, бичиг баримтаас эхлээд нислэг хүртэл дагалдана. Бид
              энэ салбарт 20 гаруй жил ажилласан <b className="text-ink">{BRAND.partner}</b>-тэй хамтран ажилладаг.
            </p>
            <ul className="mt-6 grid gap-3">
              {["Зөвхөн албан ёсны гэрээтэй хөтөлбөр", "Материалынхаа явцыг утсаараа хянана", "Хувийн мэдээллийг хуулийн дагуу хамгаална"].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-extrabold text-brand">✓</span>
                  <span className="font-bold">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "20+", t: "жилийн туршлагатай түнш" },
              { n: "3", t: "улс: Солонгос, Япон, Чех" },
              { n: "1", t: "минутад онлайн бүртгэл" },
              { n: "24/7", t: "явцаа хүссэн үедээ хянах" },
            ].map((x, k) => (
              <div key={x.t} className={`rounded-3xl p-6 ${k === 0 ? "bg-brand text-white" : "bg-bg"}`}>
                <div className="text-4xl font-extrabold">{x.n}</div>
                <div className={`mt-1 text-sm ${k === 0 ? "text-white/85" : "text-muted"}`}>{x.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Алхамууд */}
      <section className="bg-bg py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-10">
          <p className="text-sm font-extrabold uppercase tracking-wider text-brand">Хэрхэн явдаг вэ</p>
          <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">5 алхамаар гадаадад</h2>
          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, k) => (
              <li key={s.title} className="rounded-3xl bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">{k + 1}</div>
                <h3 className="mt-4 font-extrabold">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Хэлний сургалт */}
      <section id="surgalt" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-brand">Хэлний сургалт</p>
            <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">Хэлээ онлайнаар сур</h2>
          </div>
          <Link href="/burtgel" className="rounded-full bg-brand px-6 py-3 font-extrabold text-white">
            Үнэгүй эхлэх
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {COUNTRY_ORDER.map((s) => {
            const c = COUNTRIES[s];
            return (
              <div key={s} className="overflow-hidden rounded-3xl border border-line">
                <div className="relative flex h-40 items-end p-5">
                  <CountryArt c={c} big={false} />
                  <span className="relative rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold" style={{ color: c.primary }}>
                    {c.courseReady ? "Бэлэн" : "Удахгүй"}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-extrabold">{c.name} хэл</h3>
                  <p className="mt-1 text-sm text-muted">
                    {c.courseReady ? "Анхан, дунд, ахисан шат — хичээл, тест, багшийн даалгавар." : "Хичээлүүдийг бэлтгэж байна."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Уриалга */}
      <section className="px-5 pb-20 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-[2rem] bg-brand px-8 py-12 text-white lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <div>
            <h2 className="text-2xl font-extrabold lg:text-3xl">Гадаадад ажиллах замаа өнөөдөр эхлүүл</h2>
            <p className="mt-2 text-white/80">Бүртгэл үнэгүй. Утасны дугаар л хангалттай.</p>
          </div>
          <Link href="/burtgel" className="shrink-0 rounded-full bg-white px-7 py-3.5 font-extrabold text-brand">
            Бүртгүүлэх
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
