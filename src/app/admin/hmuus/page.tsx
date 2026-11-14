import Link from "next/link";
import { COUNTRIES, COUNTRY_IDS, PAUSED, STAGES, isCountry, isStage, stageName } from "@/content/programs";
import { LEVELS, type LevelId } from "@/content/lessons";
import { listApplicants } from "@/server/applicant";
import { requireAdmin } from "@/server/auth";
import { Badge } from "@/components/ui";
import { StageDots } from "@/components/stepper";

export default async function People({ searchParams }: PageProps<"/admin/hmuus">) {
  await requireAdmin();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const stage = one(sp.stage);
  const country = one(sp.country);
  const f = one(sp.f);
  const q = one(sp.q).trim().toLowerCase();

  let rows = await listApplicants();
  const total = rows.length;
  if (isStage(stage)) rows = rows.filter((r) => r.stage === stage);
  if (isCountry(country)) rows = rows.filter((r) => r.a?.country === country);
  if (f === "docs") rows = rows.filter((r) => r.pendingDocs > 0);
  if (f === "incomplete") rows = rows.filter((r) => r.stage === "registered" && (r.anketMissing > 0 || r.docs.have < r.docs.need));
  if (q) {
    rows = rows.filter((r) =>
      [r.user.name, r.user.phone, r.a?.lastName, r.a?.firstName].some((x) => x?.toLowerCase().includes(q)),
    );
  }

  const chip = (href: string, on: boolean, label: string) => (
    <Link key={href} href={href} className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold ${on ? "bg-red text-white" : "border border-line bg-white text-muted"}`}>
      {label}
    </Link>
  );
  const filtered = !!(stage || country || f || q);

  return (
    <>
      <h1 className="text-2xl font-extrabold">Хүмүүс</h1>

      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Нэр эсвэл утасаар хайх…" className="field" />
      </form>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {chip("/admin/hmuus", !filtered, `Бүгд ${total}`)}
        {f === "docs" && chip("/admin/hmuus?f=docs", true, "Шалгах баримттай")}
        {f === "incomplete" && chip("/admin/hmuus?f=incomplete", true, "Дутуу бүртгэл")}
        {[...STAGES, PAUSED].map((s) => chip(`/admin/hmuus?stage=${s.id}`, stage === s.id, s.short))}
      </div>
      <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        {COUNTRY_IDS.map((c) => chip(`/admin/hmuus?country=${c}`, country === c, COUNTRIES[c].name))}
      </div>

      <p className="mt-4 text-xs font-bold text-muted">{rows.length} хүн</p>
      <ul className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        {rows.map((r) => (
          <li key={r.user.id}>
            <Link href={`/admin/hmuus/${r.user.id}`} className="card block p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink font-extrabold text-red">{r.user.name.slice(0, 1)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">
                    {r.a?.lastName && r.a.firstName ? `${r.a.lastName} ${r.a.firstName}` : r.user.name}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {r.user.phone} · {isCountry(r.a?.country) ? COUNTRIES[r.a.country].name : "—"} · {r.a?.jobType ?? "—"}
                  </div>
                </div>
                <span className="jp shrink-0 text-xs font-bold text-red">{LEVELS[r.user.level as LevelId]?.jlpt}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StageDots stage={r.stage} />
                  <span className="text-xs font-bold">{stageName(r.stage)}</span>
                </div>
                <div className="flex gap-1">
                  {r.pendingDocs > 0 && <Badge tone="gold">{r.pendingDocs} шалгах</Badge>}
                  {r.anketMissing > 0 && <Badge tone="gray">анкет дутуу</Badge>}
                  <Badge tone={r.docs.have >= r.docs.need ? "green" : "gray"}>
                    {r.docs.have}/{r.docs.need}
                  </Badge>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
