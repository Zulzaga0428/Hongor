import Link from "next/link";
import { LEVELS, LEVEL_IDS, type LevelId } from "@/content/lessons";
import { requireTeacher } from "@/server/auth";
import { allStudents, pendingSubmissions } from "@/server/queries";
import { Badge, formatDate } from "@/components/ui";

export default async function TeacherHome() {
  const t = await requireTeacher();
  const [students, pending] = await Promise.all([allStudents(), pendingSubmissions()]);
  const count = (l: LevelId) => students.filter((s) => s.level === l).length;

  return (
    <>
      <p className="jp text-sm font-bold text-red">先生、こんにちは</p>
      <h1 className="text-2xl font-extrabold">{t.name}</h1>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-red p-4 text-white shadow-[0_6px_0_var(--red-deep)]">
          <div className="text-3xl font-extrabold">{students.length}</div>
          <div className="text-sm opacity-90">сурагч</div>
        </div>
        <div className="card p-4">
          <div className="text-3xl font-extrabold text-red">{pending.length}</div>
          <div className="text-sm text-muted">шалгах даалгавар</div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-3 gap-2">
        {LEVEL_IDS.map((l) => (
          <Link key={l} href={`/bagsh/suragchid?level=${l}`} className="card p-3 text-center">
            <div className="jp text-sm font-extrabold text-red">{LEVELS[l].jp}</div>
            <div className="text-xl font-extrabold">{count(l)}</div>
            <div className="text-[11px] text-muted">{LEVELS[l].name}</div>
          </Link>
        ))}
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">Шалгах даалгавар</h2>
        {pending.length === 0 ? (
          <div className="card p-5 text-center text-sm text-muted">Бүгдийг шалгачихсан байна 🎉</div>
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            {pending.map((p) => (
              <li key={p.id}>
                <Link href={`/bagsh/shalgah/${p.id}`} className="card flex items-center gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink font-extrabold text-red">
                    {p.studentName.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{p.studentName}</div>
                    <div className="truncate text-xs text-muted">
                      {p.title} · {formatDate(p.submittedAt)}
                    </div>
                  </div>
                  <Badge tone="gold">{LEVELS[p.level as LevelId]?.jlpt}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
