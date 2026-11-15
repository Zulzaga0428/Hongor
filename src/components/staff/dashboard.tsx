import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Download,
  FileCheck2,
  MessagesSquare,
  Plane,
  Stamp,
  UserPlus,
  Users,
} from "lucide-react";
import { COUNTRIES, COUNTRY_IDS, PAUSED, STAGES, isCountry, stageName } from "@/content/programs";
import { listApplicants, listOrgs, pendingDocCount, recentActivity } from "@/server/applicant";
import type { Staff } from "@/server/auth";
import { formatDate } from "@/components/ui";
import { Panel } from "./panel";

/** Серверт хүсэлт бүрд тооцно — render-ийн цэвэр байдлын дүрмээс гадуур. */
function isWithinDays(d: Date, days: number) {
  return Date.now() - d.getTime() < days * 86400000;
}

function ago(d: Date) {
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "дөнгөж сая";
  if (m < 60) return `${m} мин өмнө`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} цагийн өмнө`;
  return formatDate(d);
}


function Kpi({ icon: Icon, color, label, value, sub, subTone = "muted", href }: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  value: number;
  sub: string;
  subTone?: "muted" | "good" | "bad";
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col items-start gap-3 rounded-xl border-t-[3px] border-brand bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white sm:h-14 sm:w-14" style={{ background: color }}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <div className="w-full min-w-0">
        <div className="truncate text-sm text-muted">{label}</div>
        <div className="text-2xl font-extrabold leading-tight">{value}</div>
        <div className={`truncate text-xs ${subTone === "good" ? "text-[#12a150]" : subTone === "bad" ? "text-[#e5484d]" : "text-muted"}`}>{sub}</div>
      </div>
    </Link>
  );
}

export async function StaffDashboard({ staff }: { staff: Staff }) {
  const orgId = staff.org?.id ?? null;
  const owner = staff.org === null;
  const [rows, pendingDocs, activity, orgs] = await Promise.all([
    listApplicants(orgId),
    pendingDocCount(orgId),
    recentActivity(orgId),
    owner ? listOrgs() : Promise.resolve([]),
  ]);
  const IN_PROGRESS = ["training", "exam_passed", "interview", "selected", "visa"];
  const orgRows = orgs.map((o) => {
    const mine = rows.filter((r) => r.a?.orgId === o.id);
    return {
      o,
      total: mine.length,
      progress: mine.filter((r) => IN_PROGRESS.includes(r.stage)).length,
      departed: mine.filter((r) => r.stage === "departed").length,
      pending: mine.reduce((s, r) => s + r.pendingDocs, 0),
    };
  });
  const by = (stage: string) => rows.filter((r) => r.stage === stage).length;
  const newThisWeek = rows.filter((r) => isWithinDays(r.user.createdAt, 7)).length;
  const assignedThisWeek = rows.filter((r) => r.a?.assignedAt && isWithinDays(r.a.assignedAt, 7)).length;
  const unassigned = rows.filter((r) => !r.a?.orgId && r.a?.consentAt).length;
  const docPeople = rows.filter((r) => r.pendingDocs > 0);
  // Баримт шалгуулж буй хүнийг «дутуу»-д давхар харуулахгүй — Анхаарах-д нэг хүн нэг мөр.
  const incomplete = rows.filter((r) => r.pendingDocs === 0 && (r.anketMissing > 0 || r.docs.have < r.docs.need));
  const base = staff.base;
  const nameOf = (r: { a?: { lastName: string | null; firstName: string | null } | null; user: { name: string } }) =>
    r.a?.lastName && r.a?.firstName ? `${r.a.lastName} ${r.a.firstName}` : r.user.name;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold lg:text-[28px]">Самбар</h1>
          <p className="mt-1 text-sm text-muted">
            {owner ? "Бүх байгууллага, бүх хүний ерөнхий байдал." : `${staff.org!.name} — танд оноогдсон хүмүүсийн явц, шалгах ажил.`}
          </p>
        </div>
        <a href="/api/export" className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold hover:border-brand">
          <Download className="h-4 w-4" /> Excel
        </a>
      </div>

      {/* 4 гол тоо */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi
          icon={Users}
          color="#0f8a7e"
          label={owner ? "Нийт бүртгэл" : "Манай хүмүүс"}
          value={rows.length}
          sub={owner ? `+${newThisWeek} энэ 7 хоногт` : `+${assignedThisWeek} энэ 7 хоногт оноогдсон`}
          subTone={(owner ? newThisWeek : assignedThisWeek) > 0 ? "good" : "muted"}
          href={`${base}/hmuus`}
        />
        <Kpi
          icon={FileCheck2}
          color="#e5484d"
          label="Шалгах баримт"
          value={pendingDocs}
          sub={docPeople.length ? `${docPeople.length} хүн хүлээж байна` : "Бүгд шалгагдсан"}
          subTone={pendingDocs ? "bad" : "good"}
          href={`${base}/hmuus?f=docs`}
        />
        {owner ? (
          <Kpi icon={Building2} color="#f5a524" label="Оноогоогүй" value={unassigned} sub="Зөвшөөрөлтэй, байгууллагагүй" subTone={unassigned ? "bad" : "good"} href={`${base}/hmuus?f=unassigned`} />
        ) : (
          <Kpi icon={MessagesSquare} color="#f5a524" label="Ярилцлагад" value={by("interview")} sub={`${by("selected")} сонгогдсон`} href={`${base}/hmuus?stage=interview`} />
        )}
        <Kpi icon={Stamp} color="#2563eb" label="Виз хүлээж буй" value={by("visa")} sub={`${by("departed")} нисэв`} subTone={by("departed") ? "good" : "muted"} href={`${base}/hmuus?stage=visa`} />
      </section>

      {/* Шатны мөр */}
      <Panel
        title="Явцын шат"
        className="mt-6"
        action={
          <Link href={`${base}/hmuus`} className="flex items-center gap-1 text-sm font-bold text-brand">
            Бүгд <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        {/* Утсан дээр хажуу тийш гүйлгэнэ, компьютер дээр 7 багана */}
        <ol className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0">
          {STAGES.map((s, i) => {
            const n = by(s.id);
            return (
              <li key={s.id} className="w-32 shrink-0 lg:w-auto">
                <Link
                  href={`${base}/hmuus?stage=${s.id}`}
                  className={`block rounded-xl border p-4 transition hover:border-brand ${n ? "border-line bg-white" : "border-dashed border-line bg-[#fafbfb]"}`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-muted">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {s.id === "departed" && <Plane className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`mt-2 text-2xl font-extrabold ${n ? "text-ink" : "text-[#c3ccd1]"}`}>{n}</div>
                  <div className="mt-0.5 truncate text-[13px] font-bold">{s.name}</div>
                </Link>
              </li>
            );
          })}
        </ol>
        {by(PAUSED.id) > 0 && (
          <Link href={`${base}/hmuus?stage=${PAUSED.id}`} className="mt-3 inline-block text-sm text-muted underline">
            {PAUSED.name}: {by(PAUSED.id)}
          </Link>
        )}
      </Panel>

      {/* Платформын эзэнд: байгууллагуудын харьцуулалт */}
      {owner && (
        <Panel
          title="Байгууллагууд"
          className="mt-6"
          flush
          action={
            <Link href="/admin/baiguullaga" className="flex items-center gap-1 text-sm font-bold text-brand">
              Удирдах <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {orgRows.length === 0 ? (
            <p className="px-5 pb-6 pt-2 text-sm text-muted">
              Хамтрагч байгууллага алга.{" "}
              <Link href="/admin/baiguullaga" className="font-bold text-brand underline">
                Эхнийхээ нэмэх
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-bold">Байгууллага</th>
                    <th className="px-3 py-3 text-right font-bold">Нийт</th>
                    <th className="px-3 py-3 text-right font-bold">Явцад</th>
                    <th className="px-3 py-3 text-right font-bold">Нисэв</th>
                    <th className="px-5 py-3 text-right font-bold">Шалгах баримт</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orgRows.map(({ o, total, progress, departed, pending }) => (
                    <tr key={o.id} className="hover:bg-[#f7faf9]">
                      <td className="px-5 py-3">
                        <Link href={`/admin/hmuus?org=${o.id}`} className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                            <Building2 className="h-[18px] w-[18px]" />
                          </span>
                          <span>
                            <span className="block font-bold hover:text-brand">{o.name}</span>
                            {!o.active && <span className="text-xs font-bold text-[#e5484d]">хаагдсан</span>}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right font-extrabold">{total}</td>
                      <td className="px-3 py-3 text-right">{progress}</td>
                      <td className="px-3 py-3 text-right">{departed ? <span className="font-bold text-[#12a150]">{departed}</span> : 0}</td>
                      <td className="px-5 py-3 text-right">{pending ? <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-xs font-bold text-[#e5484d]">{pending}</span> : <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#fafbfb]">
                    <td className="px-5 py-3">
                      <Link href="/admin/hmuus?f=unassigned" className="font-bold text-[#c27c00] hover:underline">
                        Оноогоогүй (зөвшөөрөлтэй)
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right font-extrabold">{unassigned}</td>
                    <td colSpan={3} className="px-5 py-3 text-right text-xs text-muted">
                      {unassigned ? "Хүмүүс → «Оноогоогүй» хэсгээс шууд оноож болно" : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Анхаарах */}
        <Panel title="Анхаарах" action={<span className="rounded-full bg-[#fdecec] px-2.5 py-0.5 text-xs font-bold text-[#e5484d]">{docPeople.length + incomplete.length}</span>}>
          {docPeople.length + incomplete.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Анхаарах зүйл алга 🎉</p>
          ) : (
            <ul className="grid grid-cols-1 divide-y divide-line">
              {docPeople.slice(0, 4).map((r) => (
                <li key={`d-${r.user.id}`}>
                  <Link href={`${base}/hmuus/${r.user.id}`} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdecec] text-[#e5484d]">
                      <FileCheck2 className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{nameOf(r)}</span>
                      <span className="block text-xs text-muted">{r.pendingDocs} баримт шалгуулахаар хүлээж байна</span>
                    </span>
                  </Link>
                </li>
              ))}
              {incomplete.slice(0, Math.max(0, 5 - Math.min(4, docPeople.length))).map((r) => (
                <li key={`i-${r.user.id}`}>
                  <Link href={`${base}/hmuus/${r.user.id}`} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff5e0] text-[#c27c00]">
                      <UserPlus className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{nameOf(r)}</span>
                      <span className="block text-xs text-muted">
                        {r.anketMissing ? "Анкет дутуу" : ""}
                        {r.anketMissing && r.docs.have < r.docs.need ? " · " : ""}
                        {r.docs.have < r.docs.need ? `Баримт ${r.docs.have}/${r.docs.need}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Сүүлийн үйл ажиллагаа */}
        <Panel title="Сүүлийн үйл ажиллагаа">
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Одоохондоо үйл ажиллагаа алга.</p>
          ) : (
            <ul className="grid grid-cols-1 divide-y divide-line">
              {activity.map((e) => (
                <li key={e.id} className="flex gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-extrabold text-brand">{e.name.slice(0, 1)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <Link href={`${base}/hmuus/${e.userId}`} className="truncate text-sm font-bold hover:text-brand">
                        {e.lastName && e.firstName ? `${e.lastName} ${e.firstName}` : e.name}
                      </Link>
                      <span className="shrink-0 text-xs text-muted">{ago(e.at)}</span>
                    </div>
                    {e.note && <p className="mt-0.5 line-clamp-2 text-sm text-ink/80">{e.note}</p>}
                    <span className="mt-1 inline-block rounded border border-brand/40 px-1.5 py-px text-[11px] font-bold text-brand">{stageName(e.stage)}</span>
                    {e.byName && <span className="ml-2 text-[11px] text-muted">{e.byName}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Улс + шуурхай үйлдэл */}
        <div className="grid grid-cols-1 gap-6">
          <Panel title="Улсаар">
            <div className="grid grid-cols-3 gap-3">
              {COUNTRY_IDS.map((c) => (
                <Link key={c} href={`${base}/hmuus?country=${c}`} className="rounded-xl border border-line p-3 text-center hover:border-brand">
                  <div className="text-xs font-extrabold text-brand">{COUNTRIES[c].code}</div>
                  <div className="text-xl font-extrabold">{rows.filter((r) => r.a?.country === c).length}</div>
                  <div className="text-xs text-muted">{COUNTRIES[c].name}</div>
                </Link>
              ))}
            </div>
            {rows.some((r) => !isCountry(r.a?.country)) && (
              <p className="mt-3 text-xs text-muted">Улс сонгоогүй: {rows.filter((r) => !isCountry(r.a?.country)).length}</p>
            )}
          </Panel>
          <Panel title="Шуурхай">
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: `${base}/hmuus?f=docs`, icon: FileCheck2, t: "Баримт шалгах", s: `${pendingDocs} хүлээгдэж буй`, c: "#e5484d" },
                { href: `${base}/hmuus`, icon: Users, t: "Хүмүүс", s: "Хайх, шүүх", c: "#0f8a7e" },
                ...(owner
                  ? [{ href: "/admin/baiguullaga", icon: Building2, t: "Байгууллагууд", s: "Нэмэх, эрх нээх", c: "#f5a524" }]
                  : [{ href: `${base}/hmuus?stage=interview`, icon: MessagesSquare, t: "Ярилцлага", s: `${by("interview")} хүн`, c: "#f5a524" }]),
                { href: "/api/export", icon: Download, t: "Excel", s: "Жагсаалт татах", c: "#2563eb", ext: true },
              ].map((x) => {
                const Icon = x.icon;
                const body = (
                  <>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${x.c}1a`, color: x.c }}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="mt-2 block text-sm font-bold" style={{ color: x.c }}>
                      {x.t}
                    </span>
                    <span className="block text-xs text-muted">{x.s}</span>
                  </>
                );
                const cls = "block rounded-xl border border-line p-3 transition hover:shadow-sm";
                return "ext" in x ? (
                  <a key={x.t} href={x.href} className={cls}>
                    {body}
                  </a>
                ) : (
                  <Link key={x.t} href={x.href} className={cls}>
                    {body}
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
