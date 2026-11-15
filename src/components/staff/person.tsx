import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, BookOpen, Building2, FileText, GraduationCap, Phone, Target } from "lucide-react";
import { reviewDoc } from "@/app/material-actions";
import { COUNTRIES, DOC_KINDS, isCountry, stageName } from "@/content/programs";
import { LEVELS, lessonsFor, type LevelId } from "@/content/lessons";
import { anketMissing, docsOf, docsProgress, getApplicant, historyOf, listOrgs } from "@/server/applicant";
import { canSee, type Staff } from "@/server/auth";
import { getDb, schema } from "@/server/db";
import { progressOf } from "@/server/queries";
import { formatDate } from "@/components/ui";
import { AssignOrgForm, DeletePerson, NoteForm, ResetPin, StageForm } from "@/components/admin-forms";
import { Panel } from "./panel";
import { StageTrack } from "./stage-track";

function age(birth: string | null) {
  if (!birth) return null;
  const y = (Date.now() - new Date(birth).getTime()) / (365.25 * 86400000);
  return Number.isFinite(y) ? Math.floor(y) : null;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className={`mt-0.5 font-bold ${value ? "" : "text-[#c3ccd1]"}`}>{value || "—"}</dd>
    </div>
  );
}

const Tag = ({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "blue" | "amber" | "red" | "gray" }) => {
  const c = {
    brand: "bg-brand-soft text-brand",
    blue: "bg-[#e8f0fe] text-[#2563eb]",
    amber: "bg-[#fff5e0] text-[#b46d00]",
    red: "bg-[#fdecec] text-[#d93036]",
    gray: "bg-[#f0f3f4] text-muted",
  }[tone];
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${c}`}>{children}</span>;
};

export async function StaffPerson({ staff, id }: { staff: Staff; id: string }) {
  const db = await getDb();
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!u || u.role !== "student") notFound();

  const a = await getApplicant(u.id);
  // Өөр байгууллагын хүн — байгаа эсэхийг ч мэдэгдэхгүй.
  if (!canSee(staff, a.orgId)) notFound();
  const isOwner = staff.org === null;
  const orgs = isOwner ? await listOrgs() : [];
  const [docs, history, prog] = await Promise.all([docsOf(u.id), historyOf(u.id), progressOf(u.id)]);
  const lessons = lessonsFor(u.level as LevelId);
  const done = lessons.filter((l) => prog.has(l.id));
  const avg = done.length ? Math.round((done.reduce((s, l) => s + prog.get(l.id)!.score / prog.get(l.id)!.total, 0) / done.length) * 100) : null;
  const yrs = age(a.birthDate);
  const dp = docsProgress(docs);
  const missing = anketMissing(a);
  const fullName = a.lastName && a.firstName ? `${a.lastName} ${a.firstName}` : u.name;
  const photo = docs.find((d) => d.kind === "photo" && d.mime.startsWith("image/") && d.status !== "rejected");
  const myOrg = orgs.find((o) => o.id === a.orgId);
  const lvl = LEVELS[u.level as LevelId];
  const base = staff.base;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`${base}/hmuus`} className="mb-1 inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-brand">
            <ArrowLeft className="h-4 w-4" /> Хүмүүс
          </Link>
          <h1 className="text-2xl font-bold lg:text-[28px]">Хүний профайл</h1>
          <p className="mt-1 text-sm text-muted">Анкет, бичиг баримт, явц, хэлний сургалт — нэг дор.</p>
        </div>
      </div>

      {/* Толгой карт */}
      <section className="mt-6 rounded-xl border-t-[3px] border-brand bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] lg:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-[3px] border-brand bg-brand-soft lg:h-28 lg:w-28">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/barimt/${photo.id}`} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-brand">{fullName.slice(0, 1)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold">{fullName}</h2>
            <p className="mt-0.5 text-sm text-muted">
              {isCountry(a.country) ? COUNTRIES[a.country].name : "Улс сонгоогүй"}
              {a.program ? ` · ${a.program}` : ""}
              {a.jobType ? ` · ${a.jobType}` : ""}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Tag>{stageName(a.stage)}</Tag>
              <Tag tone="blue">
                {lvl?.name} · {lvl?.jlpt}
              </Tag>
              <Tag tone={dp.have >= dp.need ? "brand" : "amber"}>
                Баримт {dp.have}/{dp.need}
              </Tag>
              {missing > 0 ? <Tag tone="amber">Анкет {missing} дутуу</Tag> : a.submittedAt ? <Tag>Анкет бүрэн</Tag> : <Tag tone="gray">Анкет бөглөөгүй</Tag>}
              {isOwner && (myOrg ? <Tag tone="gray">{myOrg.name}</Tag> : <Tag tone="red">Оноогоогүй</Tag>)}
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2 sm:flex-col sm:items-end">
            <a href={`tel:${u.phone}`} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white">
              <Phone className="h-4 w-4" /> {u.phone}
            </a>
            <ResetPin userId={u.id} phone={u.phone} />
          </div>
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <StageTrack stage={a.stage} />
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ЗҮҮН: мэдээлэл */}
        <div className="grid grid-cols-1 content-start gap-6">
          <Panel title="Үндсэн мэдээлэл">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Овог, нэр" value={a.lastName && a.firstName ? fullName : null} />
              <Field label="Бүртгэлийн нэр" value={u.name} />
              <Field label="Утас" value={u.phone} />
              <Field label="Төрсөн огноо" value={a.birthDate ? `${a.birthDate}${yrs !== null ? ` (${yrs} нас)` : ""}` : null} />
              <Field label="Хүйс" value={a.gender} />
              <Field label="Бүртгүүлсэн" value={formatDate(u.createdAt)} />
            </dl>
          </Panel>

          <Panel title="Хөтөлбөр, боловсрол">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Улс" value={isCountry(a.country) ? COUNTRIES[a.country].name : null} />
              <Field label="Хөтөлбөр" value={a.program} />
              <Field label="Ажлын чиглэл" value={a.jobType} />
              <Field label="Боловсрол" value={a.education} />
              <Field label="Өндөр / жин" value={a.heightCm || a.weightKg ? `${a.heightCm ?? "—"} см / ${a.weightKg ?? "—"} кг` : null} />
            </dl>
            {a.experience && (
              <div className="mt-4">
                <Tag tone="gray">Ажлын туршлага</Tag>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{a.experience}</p>
              </div>
            )}
          </Panel>

          <Panel title="Холбоо барих, хаяг">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Tag tone="red">Гэрийн хаяг</Tag>
                <p className="mt-1.5 font-bold">{a.address || <span className="text-[#c3ccd1]">—</span>}</p>
              </div>
              <div>
                <Tag tone="amber">Яаралтай үед</Tag>
                <p className="mt-1.5 font-bold">{a.emergencyPhone ? `${a.emergencyName ?? ""} ${a.emergencyPhone}` : <span className="text-[#c3ccd1]">—</span>}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Ажилтны тэмдэглэл">
            <NoteForm userId={u.id} initial={a.staffNote ?? ""} />
          </Panel>
        </div>

        {/* БАРУУН: ажил */}
        <div className="grid grid-cols-1 content-start gap-6">
          {isOwner && (
            <Panel title="Хариуцах байгууллага" action={<Building2 className="h-5 w-5 text-muted" />}>
              <p className="mb-3 text-xs text-muted">
                {a.consentAt ? "Нэг удаад нэг байгууллага. Шилжүүлэхэд хуучин нь харахаа болино." : "Хүн зөвшөөрөл өгсний дараа оноох боломжтой."}
              </p>
              <AssignOrgForm userId={u.id} current={a.orgId ?? ""} orgs={orgs.filter((o) => o.active).map((o) => ({ id: o.id, name: o.name }))} disabled={!a.consentAt} />
            </Panel>
          )}

          <Panel title="Явц" action={<Target className="h-5 w-5 text-muted" />}>
            <StageForm userId={u.id} current={a.stage} />
          </Panel>

          <Panel title="Бичиг баримт" flush action={<FileText className="h-5 w-5 text-muted" />}>
            <div className="overflow-x-auto px-5 pb-5">
              <table className="w-full min-w-[520px] overflow-hidden rounded-lg text-left text-sm">
                <thead className="bg-brand text-white">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Баримт</th>
                    <th className="px-3 py-2.5 font-bold">Огноо</th>
                    <th className="px-3 py-2.5 font-bold">Төлөв</th>
                    <th className="px-3 py-2.5 text-right font-bold">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line border-x border-b border-line">
                  {DOC_KINDS.flatMap((k) => {
                    const mine = docs.filter((d) => d.kind === k.id);
                    if (!mine.length)
                      return [
                        <tr key={k.id}>
                          <td className="px-3 py-3 text-muted">{k.name}</td>
                          <td className="px-3 py-3 text-muted">—</td>
                          <td className="px-3 py-3">{k.required ? <Tag tone="amber">Хуулаагүй</Tag> : <span className="text-xs text-muted">заавал биш</span>}</td>
                          <td />
                        </tr>,
                      ];
                    return mine.map((d) => (
                      <tr key={d.id} className="align-top">
                        <td className="px-3 py-3">
                          <a href={`/api/barimt/${d.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                            {d.mime.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={`/api/barimt/${d.id}`} alt={k.name} className="h-11 w-11 rounded-lg object-cover" />
                            ) : (
                              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fdecec] text-[11px] font-extrabold text-[#d93036]">PDF</span>
                            )}
                            <span>
                              <span className="block font-bold hover:text-brand">{k.name}</span>
                              <span className="block text-xs text-muted">{Math.round(d.size / 1024)} KB</span>
                            </span>
                          </a>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted">{formatDate(d.uploadedAt)}</td>
                        <td className="px-3 py-3">
                          {d.status === "ok" && <Tag>Батлагдсан</Tag>}
                          {d.status === "pending" && <Tag tone="blue">Шалгах</Tag>}
                          {d.status === "rejected" && (
                            <span>
                              <Tag tone="red">Буцаасан</Tag>
                              <span className="mt-1 block text-xs text-muted">{d.note}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {d.status === "pending" && (
                            <div className="flex flex-col items-end gap-1.5">
                              <form action={reviewDoc}>
                                <input type="hidden" name="id" value={d.id} />
                                <input type="hidden" name="status" value="ok" />
                                <button className="w-24 rounded-md bg-brand py-1.5 text-xs font-bold text-white">✓ Зөв</button>
                              </form>
                              <form action={reviewDoc} className="flex flex-col items-end gap-1">
                                <input type="hidden" name="id" value={d.id} />
                                <input type="hidden" name="status" value="rejected" />
                                <input name="note" placeholder="Шалтгаан" className="w-24 rounded-md border border-line px-2 py-1 text-xs" />
                                <button className="w-24 rounded-md border border-line bg-white py-1.5 text-xs font-bold">Буцаах</button>
                              </form>
                            </div>
                          )}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Хэлний сургалт" action={<GraduationCap className="h-5 w-5 text-muted" />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: BookOpen, v: `${done.length}/${lessons.length}`, t: "Хичээл дууссан", pct: lessons.length ? (done.length / lessons.length) * 100 : 0, c: "#0f8a7e" },
                { icon: Target, v: avg === null ? "—" : `${avg}%`, t: "Тестийн дундаж", pct: avg ?? 0, c: "#f5a524" },
                { icon: GraduationCap, v: lvl?.jlpt ?? "—", t: lvl?.name ?? "Түвшин", pct: 0, c: "#2563eb" },
              ].map((x) => {
                const Icon = x.icon;
                return (
                  <div key={x.t} className="rounded-xl border border-line p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `${x.c}1a`, color: x.c }}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-xl font-extrabold leading-tight">{x.v}</div>
                        <div className="text-xs text-muted">{x.t}</div>
                      </div>
                    </div>
                    {x.pct > 0 && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef2f3]">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, x.pct)}%`, background: x.c }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Түүх" flush>
            {history.length === 0 ? (
              <p className="px-5 pb-6 text-sm text-muted">Түүх алга.</p>
            ) : (
              <div className="overflow-x-auto px-5 pb-5">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-brand text-white">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Шат</th>
                      <th className="px-3 py-2.5 font-bold">Тайлбар</th>
                      <th className="px-3 py-2.5 font-bold">Хэн</th>
                      <th className="px-3 py-2.5 text-right font-bold">Огноо</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line border-x border-b border-line">
                    {history.map((h) => {
                      // Байгууллага зөвхөн ӨӨРИЙН хийсэн мөрийн хэн/тайлбарыг харна —
                      // өмнөх (өрсөлдөгч) байгууллага болон платформын тэмдэглэл нуугдана.
                      const mine = staff.org === null || h.orgId === staff.org.id;
                      return (
                        <tr key={h.id}>
                          <td className="px-3 py-2.5 font-bold">{stageName(h.stage)}</td>
                          <td className="px-3 py-2.5 text-muted">{mine ? h.note || "—" : "—"}</td>
                          <td className="px-3 py-2.5 text-xs text-muted">{mine ? h.byName : "—"}</td>
                          <td className="px-3 py-2.5 text-right text-xs text-muted">{formatDate(h.at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {isOwner && <DeletePerson userId={u.id} name={fullName} />}
        </div>
      </div>
    </>
  );
}
