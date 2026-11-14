import Link from "next/link";
import { COUNTRIES, COUNTRY_IDS, PAUSED, STAGES, isCountry, stageName } from "@/content/programs";
import { listApplicants, pendingDocCount } from "@/server/applicant";
import { requireAdmin } from "@/server/auth";
import { formatDate } from "@/components/ui";

/** Серверт хүсэлт бүрд тооцно — render-ийн цэвэр байдлын дүрмээс гадуур. */
function isWithinDays(d: Date, days: number) {
  return Date.now() - d.getTime() < days * 86400000;
}

export default async function AdminHome() {
  const me = await requireAdmin();
  const [rows, pendingDocs] = await Promise.all([listApplicants(), pendingDocCount()]);
  const by = (stage: string) => rows.filter((r) => r.stage === stage).length;
  const max = Math.max(1, ...STAGES.map((s) => by(s.id)));
  const newThisWeek = rows.filter((r) => isWithinDays(r.user.createdAt, 7)).length;
  const incomplete = rows.filter((r) => r.stage === "registered" && (r.anketMissing > 0 || r.docs.have < r.docs.need)).length;

  return (
    <>
      <p className="jp text-sm font-bold text-red">お疲れさまです</p>
      <h1 className="text-2xl font-extrabold">{me.name}</h1>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-3xl bg-red p-4 text-white shadow-[0_6px_0_var(--red-deep)]">
          <div className="text-3xl font-extrabold">{rows.length}</div>
          <div className="text-sm opacity-90">нийт хүн</div>
          <div className="mt-1 text-xs opacity-80">+{newThisWeek} энэ 7 хоногт</div>
        </div>
        <Link href="/admin/hmuus?f=docs" className="card p-4">
          <div className="text-3xl font-extrabold text-red">{pendingDocs}</div>
          <div className="text-sm text-muted">шалгах баримт</div>
        </Link>
        <Link href="/admin/hmuus?f=incomplete" className="card col-span-2 flex items-center justify-between p-4">
          <span className="text-sm text-muted">Анкет/баримт дутуу шинэ бүртгэл</span>
          <span className="text-xl font-extrabold">{incomplete}</span>
        </Link>
      </section>

      <div className="lg:mt-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <div>
      <section className="card mt-5 p-5 lg:mt-0">
        <h2 className="mb-4 font-extrabold">Шат бүрт</h2>
        <ul className="grid grid-cols-1 gap-2.5">
          {STAGES.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/hmuus?stage=${s.id}`} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="truncate font-bold">{s.name}</span>
                <span className="h-3 overflow-hidden rounded-full bg-pink">
                  <span className="block h-full rounded-full bg-red" style={{ width: `${(by(s.id) / max) * 100}%` }} />
                </span>
                <span className="text-right font-extrabold">{by(s.id)}</span>
              </Link>
            </li>
          ))}
          {by(PAUSED.id) > 0 && (
            <li>
              <Link href={`/admin/hmuus?stage=${PAUSED.id}`} className="flex justify-between text-sm text-muted">
                <span>{PAUSED.name}</span>
                <b>{by(PAUSED.id)}</b>
              </Link>
            </li>
          )}
        </ul>
      </section>

      <section className="mt-3 grid grid-cols-3 gap-2">
        {COUNTRY_IDS.map((c) => (
          <Link key={c} href={`/admin/hmuus?country=${c}`} className="card p-3 text-center">
            <div className="text-xs font-extrabold text-red">{COUNTRIES[c].code}</div>
            <div className="text-xl font-extrabold">{rows.filter((r) => r.a?.country === c).length}</div>
            <div className="text-[11px] text-muted">{COUNTRIES[c].name}</div>
          </Link>
        ))}
      </section>
      </div>

      <section className="mt-7 lg:mt-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Сүүлд бүртгүүлсэн</h2>
          <Link href="/admin/hmuus" className="text-sm font-bold text-red">
            Бүгд
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-2">
          {rows.slice(0, 5).map((r) => (
            <li key={r.user.id}>
              <Link href={`/admin/hmuus/${r.user.id}`} className="card flex items-center gap-3 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink text-sm font-extrabold text-red">{r.user.name.slice(0, 1)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{r.user.name}</div>
                  <div className="truncate text-xs text-muted">
                    {isCountry(r.a?.country) ? COUNTRIES[r.a.country].name : "Улс сонгоогүй"} · {stageName(r.stage)}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted">{formatDate(r.user.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <a href="/api/export" className="btn btn-ghost mt-6">
          ⬇ Excel-ээр татах (CSV)
        </a>
      </section>
      </div>
    </>
  );
}
