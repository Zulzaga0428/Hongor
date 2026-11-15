import Link from "next/link";
import { Search } from "lucide-react";
import { COUNTRIES, COUNTRY_IDS, PAUSED, STAGES, isCountry, isStage, stageName } from "@/content/programs";
import { LEVELS, type LevelId } from "@/content/lessons";
import { listApplicants, listOrgs } from "@/server/applicant";
import type { Staff } from "@/server/auth";
import { Badge, formatDate } from "@/components/ui";
import { StageDots } from "@/components/stepper";
import { QuickAssign } from "@/components/admin-forms";

export async function StaffPeople({ staff, searchParams }: { staff: Staff; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const stage = one(sp.stage);
  const country = one(sp.country);
  const f = one(sp.f);
  const org = one(sp.org);
  const q = one(sp.q).trim().toLowerCase();
  const owner = staff.org === null;
  const base = staff.base;

  let rows = await listApplicants(staff.org?.id ?? null);
  const orgs = owner ? await listOrgs() : [];
  const activeOrgs = orgs.filter((o) => o.active).map((o) => ({ id: o.id, name: o.name }));
  const total = rows.length;
  if (isStage(stage)) rows = rows.filter((r) => r.stage === stage);
  if (isCountry(country)) rows = rows.filter((r) => r.a?.country === country);
  if (f === "docs") rows = rows.filter((r) => r.pendingDocs > 0);
  if (f === "incomplete") rows = rows.filter((r) => r.anketMissing > 0 || r.docs.have < r.docs.need);
  if (f === "unassigned") rows = rows.filter((r) => !r.a?.orgId && r.a?.consentAt);
  if (owner && org) rows = rows.filter((r) => r.a?.orgId === org);
  if (q) rows = rows.filter((r) => [r.user.name, r.user.phone, r.a?.lastName, r.a?.firstName].some((x) => x?.toLowerCase().includes(q)));

  const filtered = !!(stage || country || f || q || org);
  const title =
    f === "docs" ? "Шалгах баримттай" : f === "incomplete" ? "Анкет/баримт дутуу" : f === "unassigned" ? "Байгууллагад оноогоогүй" : isStage(stage) ? stageName(stage) : "Хүмүүс";
  const chip = (href: string, on: boolean, label: string) => (
    <Link
      key={href + label}
      href={href}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition ${on ? "bg-brand text-white" : "border border-line bg-white text-ink/70 hover:border-brand"}`}
    >
      {label}
    </Link>
  );
  const nameOf = (r: (typeof rows)[number]) => (r.a?.lastName && r.a?.firstName ? `${r.a.lastName} ${r.a.firstName}` : r.user.name);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold lg:text-[28px]">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length} хүн{filtered ? ` (нийт ${total})` : ""}
          </p>
        </div>
        <form className="relative w-full sm:w-72">
          {stage && <input type="hidden" name="stage" value={stage} />}
          {f && <input type="hidden" name="f" value={f} />}
          <input name="q" defaultValue={q} placeholder="Нэр, утсаар хайх…" className="w-full rounded-lg border border-line bg-white py-2.5 pl-3 pr-10 text-sm outline-none focus:border-brand" />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </form>
      </div>

      <div className="mt-5 rounded-xl border-t-[3px] border-brand bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <div className="flex gap-2 overflow-x-auto border-b border-line p-4">
          {chip(`${base}/hmuus`, !filtered, `Бүгд ${total}`)}
          {chip(`${base}/hmuus?f=docs`, f === "docs", "Шалгах баримт")}
          {chip(`${base}/hmuus?f=incomplete`, f === "incomplete", "Дутуу")}
          {owner && chip(`${base}/hmuus?f=unassigned`, f === "unassigned", "Оноогоогүй")}
          <span className="mx-1 w-px shrink-0 bg-line" />
          {[...STAGES, PAUSED].map((s) => chip(`${base}/hmuus?stage=${s.id}`, stage === s.id, s.short))}
          <span className="mx-1 w-px shrink-0 bg-line" />
          {COUNTRY_IDS.map((c) => chip(`${base}/hmuus?country=${c}`, country === c, COUNTRIES[c].name))}
          {owner && orgs.length > 0 && <span className="mx-1 w-px shrink-0 bg-line" />}
          {owner && orgs.map((o) => chip(`${base}/hmuus?org=${o.id}`, org === o.id, o.name))}
        </div>

        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">Энэ шүүлтэд хүн алга.</p>
        ) : (
          <>
            {/* Компьютер: хүснэгт */}
            <table className="hidden w-full text-left text-sm lg:table">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-bold">Нэр</th>
                  <th className="px-3 py-3 font-bold">Улс · ажил</th>
                  <th className="px-3 py-3 font-bold">Шат</th>
                  {owner && <th className="px-3 py-3 font-bold">Байгууллага</th>}
                  <th className="px-3 py-3 font-bold">Баримт</th>
                  <th className="px-3 py-3 font-bold">Хэл</th>
                  <th className="px-5 py-3 text-right font-bold">Бүртгүүлсэн</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.user.id} className="group hover:bg-[#f7faf9]">
                    <td className="px-5 py-3">
                      <Link href={`${base}/hmuus/${r.user.id}`} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-extrabold text-brand">{r.user.name.slice(0, 1)}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold group-hover:text-brand">{nameOf(r)}</span>
                          <span className="block text-xs text-muted">{r.user.phone}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-bold">{isCountry(r.a?.country) ? COUNTRIES[r.a.country].name : <span className="text-muted">—</span>}</div>
                      <div className="text-xs text-muted">{r.a?.jobType ?? "—"}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[13px] font-bold">{stageName(r.stage)}</div>
                      <div className="mt-1">
                        <StageDots stage={r.stage} />
                      </div>
                    </td>
                    {owner && (
                      <td className="px-3 py-3 text-[13px]">
                        {r.org ? (
                          <span className="font-bold text-brand">{r.org.name}</span>
                        ) : r.a?.consentAt && activeOrgs.length ? (
                          <QuickAssign userId={r.user.id} orgs={activeOrgs} />
                        ) : (
                          <span className="text-muted">{r.a?.consentAt ? "оноогоогүй" : "зөвшөөрөлгүй"}</span>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={r.docs.have >= r.docs.need ? "green" : "gray"}>
                          {r.docs.have}/{r.docs.need}
                        </Badge>
                        {r.pendingDocs > 0 && <Badge tone="gold">{r.pendingDocs} шалгах</Badge>}
                        {r.anketMissing > 0 && <Badge tone="gray">анкет дутуу</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-brand">{LEVELS[r.user.level as LevelId]?.jlpt}</td>
                    <td className="px-5 py-3 text-right text-xs text-muted">{formatDate(r.user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Утас: карт */}
            <ul className="grid grid-cols-1 divide-y divide-line lg:hidden">
              {rows.map((r) => (
                <li key={r.user.id}>
                  <Link href={`${base}/hmuus/${r.user.id}`} className="block p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft font-extrabold text-brand">{r.user.name.slice(0, 1)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold">{nameOf(r)}</div>
                        <div className="truncate text-xs text-muted">
                          {r.user.phone} · {isCountry(r.a?.country) ? COUNTRIES[r.a.country].name : "—"} · {r.a?.jobType ?? "—"}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-brand">{LEVELS[r.user.level as LevelId]?.jlpt}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <StageDots stage={r.stage} />
                        <span className="truncate text-xs font-bold">{stageName(r.stage)}</span>
                        {owner && <span className={`truncate text-xs font-bold ${r.org ? "text-brand" : "text-muted"}`}>· {r.org?.name ?? "оноогоогүй"}</span>}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {r.pendingDocs > 0 && <Badge tone="gold">{r.pendingDocs} шалгах</Badge>}
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
        )}
      </div>
    </>
  );
}
