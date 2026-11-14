import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { reviewDoc } from "@/app/material-actions";
import { COUNTRIES, DOC_KINDS, isCountry, stageName } from "@/content/programs";
import { LEVELS, lessonsFor, type LevelId } from "@/content/lessons";
import { docsOf, getApplicant, historyOf } from "@/server/applicant";
import { requireAdmin } from "@/server/auth";
import { getDb, schema } from "@/server/db";
import { progressOf } from "@/server/queries";
import { Back, Badge, Progress, formatDate } from "@/components/ui";
import { Stepper } from "@/components/stepper";
import { DeletePerson, NoteForm, StageForm } from "@/components/admin-forms";

function age(birth: string | null) {
  if (!birth) return null;
  const y = (Date.now() - new Date(birth).getTime()) / (365.25 * 86400000);
  return Number.isFinite(y) ? Math.floor(y) : null;
}

export default async function Person({ params }: PageProps<"/admin/hmuus/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const db = await getDb();
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!u || u.role !== "student") notFound();

  const a = await getApplicant(u.id);
  const [docs, history, prog] = await Promise.all([docsOf(u.id), historyOf(u.id), progressOf(u.id)]);
  const lessons = lessonsFor(u.level as LevelId);
  const done = lessons.filter((l) => prog.has(l.id));
  const avg = done.length ? Math.round((done.reduce((s, l) => s + prog.get(l.id)!.score / prog.get(l.id)!.total, 0) / done.length) * 100) : null;
  const yrs = age(a.birthDate);

  const rows: [string, string | number | null | undefined][] = [
    ["Улс", isCountry(a.country) ? COUNTRIES[a.country].name : null],
    ["Хөтөлбөр", a.program],
    ["Ажлын чиглэл", a.jobType],
    ["Төрсөн", a.birthDate ? `${a.birthDate}${yrs !== null ? ` (${yrs} нас)` : ""}` : null],
    ["Хүйс", a.gender],
    ["Өндөр / жин", a.heightCm || a.weightKg ? `${a.heightCm ?? "—"} см / ${a.weightKg ?? "—"} кг` : null],
    ["Хаяг", a.address],
    ["Боловсрол", a.education],
    ["Яаралтай үед", a.emergencyPhone ? `${a.emergencyName ?? ""} ${a.emergencyPhone}` : null],
  ];

  return (
    <>
      <Back href="/admin/hmuus" label="Хүмүүс" />
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red text-xl font-extrabold text-white">{u.name.slice(0, 1)}</span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">{a.lastName && a.firstName ? `${a.lastName} ${a.firstName}` : u.name}</h1>
          <a href={`tel:${u.phone}`} className="text-sm font-bold text-red">
            📞 {u.phone}
          </a>
          <div className="text-xs text-muted">Бүртгүүлсэн {formatDate(u.createdAt)}</div>
        </div>
      </div>

      {/* Утас: явц эхэнд. Компьютер: зүүнд анкет/баримт, баруунд явц (наалттай). */}
      <div className="mt-5 flex flex-col lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
      <div className="lg:sticky lg:top-10 lg:order-2">
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-extrabold">Явц</h2>
          <Badge>{stageName(a.stage)}</Badge>
        </div>
        <StageForm userId={u.id} current={a.stage} />
      </section>

      <section className="card mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-extrabold">Хэлний сургалт</h2>
          <span className="jp text-sm font-bold text-red">
            {LEVELS[u.level as LevelId]?.name} · {LEVELS[u.level as LevelId]?.jlpt}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={lessons.length ? (done.length / lessons.length) * 100 : 0} />
          <span className="shrink-0 text-xs font-bold text-muted">
            {done.length}/{lessons.length}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">Тестийн дундаж: {avg === null ? "—" : `${avg}%`}</p>
      </section>
      </div>

      <div className="lg:order-1">
      <section className="card mt-4 p-5 lg:mt-0">
        <h2 className="mb-3 font-extrabold">Анкет {!a.submittedAt && <span className="text-xs font-bold text-muted">· бөглөөгүй</span>}</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-2">
              <dt className="text-muted">{k}</dt>
              <dd className={`jp font-bold ${v ? "" : "text-[#c9b8b8]"}`}>{v || "—"}</dd>
            </div>
          ))}
        </dl>
        {a.experience && (
          <div className="mt-3 rounded-2xl bg-bg p-3 text-sm">
            <div className="mb-1 text-xs font-bold text-muted">Ажлын туршлага</div>
            <p className="whitespace-pre-line">{a.experience}</p>
          </div>
        )}
      </section>

      <section className="card mt-4 p-5">
        <h2 className="mb-3 font-extrabold">Бичиг баримт</h2>
        <ul className="grid grid-cols-1 gap-3">
          {DOC_KINDS.map((k) => {
            const mine = docs.filter((d) => d.kind === k.id);
            if (!mine.length)
              return (
                <li key={k.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{k.name}</span>
                  {k.required ? <Badge tone="gold">Хуулаагүй</Badge> : <span className="text-xs text-[#c9b8b8]">—</span>}
                </li>
              );
            return mine.map((d) => (
              <li key={d.id} className="rounded-2xl border border-line p-3">
                <div className="flex items-center gap-3">
                  <a href={`/api/barimt/${d.id}`} target="_blank" rel="noreferrer" className="shrink-0">
                    {d.mime.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/barimt/${d.id}`} alt={k.name} className="h-16 w-16 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-pink text-xs font-extrabold text-red">PDF</span>
                    )}
                  </a>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{k.name}</div>
                    <div className="truncate text-xs text-muted">{formatDate(d.uploadedAt)} · {Math.round(d.size / 1024)} KB</div>
                    {d.status === "ok" && <Badge tone="green">✓ Батлагдсан</Badge>}
                    {d.status === "rejected" && <Badge tone="pink">Буцаасан: {d.note}</Badge>}
                  </div>
                </div>
                {d.status === "pending" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <form action={reviewDoc}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="ok" />
                      <button className="w-full rounded-xl bg-green py-2.5 text-sm font-extrabold text-white">✓ Зөв</button>
                    </form>
                    <form action={reviewDoc} className="grid grid-cols-1 gap-1">
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="w-full rounded-xl border-2 border-line bg-white py-2 text-sm font-extrabold">Буцаах</button>
                      <input name="note" placeholder="Шалтгаан" className="rounded-lg border border-line px-2 py-1 text-xs" />
                    </form>
                  </div>
                )}
              </li>
            ));
          })}
        </ul>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="mb-3 font-extrabold">Ажилтны тэмдэглэл</h2>
        <NoteForm userId={u.id} initial={a.staffNote ?? ""} />
      </section>

      <section className="card mt-4 p-5">
        <h2 className="mb-4 font-extrabold">Түүх</h2>
        <Stepper stage={a.stage} />
        {history.length > 0 && (
          <ul className="mt-2 grid grid-cols-1 gap-2 border-t border-line pt-3 text-sm">
            {history.map((h) => (
              <li key={h.id}>
                <div className="flex justify-between gap-2">
                  <b>{stageName(h.stage)}</b>
                  <span className="text-xs text-muted">{formatDate(h.at)}</span>
                </div>
                <div className="text-xs text-muted">
                  {h.byName}
                  {h.note ? ` — ${h.note}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <DeletePerson userId={u.id} name={a.lastName && a.firstName ? `${a.lastName} ${a.firstName}` : u.name} />
      </section>
      </div>
      </div>
    </>
  );
}
