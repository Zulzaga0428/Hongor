import Link from "next/link";
import { LEVELS, type LevelId } from "@/content/lessons";
import { requireStudent } from "@/server/auth";
import { levelStats } from "@/server/queries";
import { Badge, Progress } from "@/components/ui";

export default async function Lessons() {
  const u = await requireStudent();
  const lvl = LEVELS[u.level as LevelId];
  const { lessons, prog, done, total, pct } = await levelStats(u);

  return (
    <>
      <h1 className="text-2xl font-extrabold">Хичээл</h1>
      <p className="jp mt-1 text-sm text-muted">
        {lvl.name} · {lvl.jp} · {lvl.jlpt}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={pct} />
        <span className="shrink-0 text-sm font-bold text-muted">
          {done}/{total}
        </span>
      </div>

      <ol className="relative mt-6 grid grid-cols-1 gap-4">
        {lessons.map((l, i) => {
          const p = prog.get(l.id);
          const perfect = p && p.score === p.total;
          return (
            <li key={l.id}>
              <Link href={`/hicheel/${l.id}`} className="card flex items-center gap-4 p-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${
                    p ? "bg-red text-white" : "border-2 border-dashed border-sakura text-red"
                  }`}
                >
                  {p ? "✓" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold">{l.title}</div>
                  <div className="text-xs text-muted">
                    {l.minutes} мин · {l.quiz.length} асуулт
                  </div>
                </div>
                {p ? <Badge tone={perfect ? "green" : "pink"}>{p.score}/{p.total}</Badge> : <Badge tone="gray">Шинэ</Badge>}
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-center text-xs text-muted">Түвшнээ «Би» хэсгээс сольж болно.</p>
    </>
  );
}
