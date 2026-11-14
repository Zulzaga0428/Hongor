import Link from "next/link";
import { COUNTRIES, isCountry, stageName } from "@/content/programs";
import { anketMissing, docsOf, docsProgress, getApplicant, historyOf } from "@/server/applicant";
import { requireStudent } from "@/server/auth";
import { Badge, formatDate } from "@/components/ui";
import { Stepper } from "@/components/stepper";

export default async function Material() {
  const u = await requireStudent();
  const a = await getApplicant(u.id);
  const [docs, history] = await Promise.all([docsOf(u.id), historyOf(u.id)]);
  const missing = anketMissing(a);
  const dp = docsProgress(docs);

  return (
    <>
      <h1 className="text-2xl font-extrabold">Миний материал</h1>
      <p className="mt-1 text-sm text-muted">
        {isCountry(a.country) ? `${COUNTRIES[a.country].name} · ${a.program ?? ""}` : "Анкетаа бөглөөд явах улсаа сонго"}
      </p>

      <section className="mt-5 grid grid-cols-1 gap-3">
        <Link href="/material/anket" className="card flex items-center gap-4 p-4">
          <span className="jp flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink text-xl font-extrabold text-red">履</span>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold">Анкет</div>
            <div className="text-xs text-muted">{a.submittedAt ? "Хувийн мэдээлэл, боловсрол, туршлага" : "2–3 минут л болно"}</div>
          </div>
          {!a.submittedAt ? <Badge tone="gold">Бөглөх</Badge> : missing ? <Badge tone="gold">{missing} дутуу</Badge> : <Badge tone="green">✓ Бүрэн</Badge>}
        </Link>
        <Link href="/material/barimt" className="card flex items-center gap-4 p-4">
          <span className="jp flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fdf0dc] text-xl font-extrabold text-[#a86a12]">証</span>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold">Бичиг баримт</div>
            <div className="text-xs text-muted">Үнэмлэх, зураг, диплом, паспорт</div>
          </div>
          {dp.rejected ? (
            <Badge tone="pink">{dp.rejected} дахин</Badge>
          ) : dp.have >= dp.need ? (
            <Badge tone="green">✓ {dp.have}/{dp.need}</Badge>
          ) : (
            <Badge tone="gold">
              {dp.have}/{dp.need}
            </Badge>
          )}
        </Link>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-extrabold">Миний явц</h2>
        <Stepper stage={a.stage} />
      </section>

      {history.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-extrabold">Түүх</h2>
          <ul className="grid grid-cols-1 gap-2">
            {history.map((h) => (
              <li key={h.id} className="rounded-2xl bg-white p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <b>{stageName(h.stage)}</b>
                  <span className="shrink-0 text-xs text-muted">{formatDate(h.at)}</span>
                </div>
                {h.note && <p className="mt-1 text-muted">{h.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
