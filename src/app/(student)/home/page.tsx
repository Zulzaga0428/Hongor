import Link from "next/link";
import { LEVELS, type LevelId } from "@/content/lessons";
import { requireStudent } from "@/server/auth";
import { assignmentsFor, levelStats } from "@/server/queries";
import { Badge, formatDate, Ring } from "@/components/ui";

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Ulaanbaatar", hour: "numeric", hour12: false }).format(new Date()));
  if (h < 11) return "おはよう";
  if (h < 18) return "こんにちは";
  return "こんばんは";
}

export default async function Home() {
  // Layout шалгасан ч page бүр өөрөө шалгана — layout ба page зэрэг render болдог.
  const u = await requireStudent();
  const lvl = LEVELS[u.level as LevelId];
  const { lessons, prog, done, total, pct } = await levelStats(u);
  const next = lessons.find((l) => !prog.has(l.id)) ?? lessons[0];
  const asg = (await assignmentsFor(u)).filter((a) => !a.submission);

  return (
    <>
      <p className="jp text-sm font-bold text-red">{greeting()}、</p>
      <h1 className="text-2xl font-extrabold">{u.name.split(" ")[0]} 👋</h1>

      <section className="mt-5 flex items-center gap-4 rounded-3xl bg-red p-5 text-white shadow-[0_8px_0_var(--red-deep)]">
        <Ring value={pct} label="ахиц" />
        <div className="min-w-0">
          <div className="jp text-xs font-bold opacity-90">
            {lvl.jp} · {lvl.jlpt}
          </div>
          <div className="text-xl font-extrabold">{lvl.name}</div>
          <div className="text-sm opacity-90">
            {done}/{total} хичээл дууссан
          </div>
        </div>
      </section>

      {next && (
        <section className="mt-7">
          <h2 className="mb-3 text-lg font-extrabold">{done === total ? "Давтах" : "Дараагийн хичээл"}</h2>
          <Link href={`/hicheel/${next.id}`} className="card flex items-center gap-4 p-4">
            <div className="jp flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink text-2xl font-extrabold text-red">
              {next.sections.find((s) => s.type === "kana")?.rows[0][0][0] ?? "あ"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold">{next.title}</div>
              <div className="text-sm text-muted">
                {next.minutes} минут · {next.quiz.length} асуулт
              </div>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red text-lg font-extrabold text-white">›</span>
          </Link>
        </section>
      )}

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Хийх даалгавар</h2>
          <Link href="/daalgavar" className="text-sm font-bold text-red">
            Бүгд
          </Link>
        </div>
        {asg.length === 0 ? (
          <div className="card p-5 text-center text-sm text-muted">Бүх даалгавраа илгээсэн байна. すごい！ 🎉</div>
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            {asg.slice(0, 3).map((a) => (
              <li key={a.id}>
                <Link href={`/daalgavar/${a.id}`} className="card flex items-center gap-3 p-4">
                  <span className="jp flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fdf0dc] font-extrabold text-[#a86a12]">書</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{a.title}</div>
                    {a.dueAt && <div className="text-xs text-muted">Хугацаа: {formatDate(a.dueAt)}</div>}
                  </div>
                  <Badge tone="gold">Хийх</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
