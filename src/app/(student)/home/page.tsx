import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle, ClipboardList, FileCheck2, PlayCircle, Target } from "lucide-react";
import { LEVELS, type LevelId } from "@/content/lessons";
import { requireStudent } from "@/server/auth";
import { assignmentsFor, levelStats } from "@/server/queries";
import { anketMissing, docsOf, docsProgress, getApplicant } from "@/server/applicant";
import { COUNTRIES, PAUSED, STAGES, isCountry, stageName } from "@/content/programs";
import { formatDate } from "@/components/ui";
import { Panel } from "@/components/staff/panel";
import { StageTrack } from "@/components/staff/stage-track";

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Ulaanbaatar", hour: "numeric", hour12: false }).format(new Date()));
  if (h < 11) return "Өглөөний мэнд";
  if (h < 18) return "Сайн байна уу";
  return "Оройн мэнд";
}

function Kpi({ icon: Icon, color, label, value, sub, href }: { icon: React.ComponentType<{ className?: string }>; color: string; label: string; value: string; sub: string; href: string }) {
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
        <div className="truncate text-xl font-extrabold leading-tight sm:text-2xl">{value}</div>
        <div className="truncate text-xs text-muted">{sub}</div>
      </div>
    </Link>
  );
}

export default async function Home() {
  // Layout шалгасан ч page бүр өөрөө шалгана — layout ба page зэрэг render болдог.
  const u = await requireStudent();
  const lvl = LEVELS[u.level as LevelId];
  const { lessons, prog, done, total } = await levelStats(u);
  const next = lessons.find((l) => !prog.has(l.id)) ?? lessons[0];
  const asg = (await assignmentsFor(u)).filter((a) => !a.submission);
  const app = await getApplicant(u.id);
  const dp = docsProgress(await docsOf(u.id));
  const missing = anketMissing(app);
  const first = u.name.split(" ")[0];

  // Хийх ажлын жагсаалт — дарааллаараа
  const tasks = [
    { done: !!app.submittedAt && missing === 0, t: "Анкетаа бөглөх", s: app.submittedAt ? (missing ? `${missing} талбар дутуу` : "Бүрэн") : "2–3 минут", href: "/material/anket" },
    {
      done: dp.have >= dp.need && dp.rejected === 0,
      t: dp.rejected ? "Буцаасан баримтаа дахин илгээх" : "Бичиг баримт хуулах",
      s: `${dp.have}/${dp.need} заавал баримт`,
      href: "/material/barimt",
    },
    { done: done === total && total > 0, t: "Хэлний хичээлээ үзэх", s: `${done}/${total} хичээл`, href: next ? `/hicheel/${next.id}` : "/hicheel" },
    { done: asg.length === 0, t: "Даалгавраа илгээх", s: asg.length ? `${asg.length} хийх` : "Бүгд илгээсэн", href: "/daalgavar" },
  ];
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold lg:text-[28px]">
          {greeting()}, {first} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isCountry(app.country) ? `${COUNTRIES[app.country].name} руу явах замдаа` : "Гадаадад ажиллах замдаа"} — өнөөдрийн ажлаа хийцгээе.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi icon={BookOpen} color="#0f8a7e" label="Хичээл" value={`${done}/${total}`} sub={`${lvl?.name} · ${lvl?.jlpt}`} href="/hicheel" />
        <Kpi icon={ClipboardList} color="#f5a524" label="Хийх даалгавар" value={String(asg.length)} sub={asg.length ? "Хугацаандаа илгээ" : "Бүгд илгээсэн"} href="/daalgavar" />
        <Kpi icon={FileCheck2} color={dp.rejected ? "#e5484d" : "#2563eb"} label="Бичиг баримт" value={`${dp.have}/${dp.need}`} sub={dp.rejected ? `${dp.rejected} буцаасан` : "Заавал баримт"} href="/material/barimt" />
        <Kpi icon={Target} color="#7c3aed" label="Миний шат" value={STAGES.find((s) => s.id === app.stage)?.short ?? PAUSED.short} sub={stageName(app.stage)} href="/material" />
      </section>

      <Panel
        title="Миний явц"
        className="mt-6"
        action={
          <Link href="/material" className="flex items-center gap-1 text-sm font-bold text-brand">
            Дэлгэрэнгүй <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <StageTrack stage={app.stage} />
      </Panel>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Хийх ажил" action={<span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand">{doneCount}/{tasks.length}</span>}>
          <ul className="grid grid-cols-1 divide-y divide-line">
            {tasks.map((t) => (
              <li key={t.t}>
                <Link href={t.href} className="flex items-center gap-3 py-3">
                  {t.done ? <CheckCircle2 className="h-6 w-6 shrink-0 text-brand" /> : <Circle className="h-6 w-6 shrink-0 text-[#c3ccd1]" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${t.done ? "text-muted line-through" : ""}`}>{t.t}</span>
                    <span className="block text-xs text-muted">{t.s}</span>
                  </span>
                  {!t.done && <ArrowRight className="h-4 w-4 shrink-0 text-muted" />}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={done === total ? "Давтах" : "Дараагийн хичээл"}>
          {next ? (
            <Link href={`/hicheel/${next.id}`} className="group block">
              <div className="flex h-32 items-center justify-center rounded-xl bg-brand-soft">
                <span className="jp text-5xl font-extrabold text-brand">{next.sections.find((s) => s.type === "kana")?.rows[0][0][0] ?? "あ"}</span>
              </div>
              <div className="mt-3 font-bold group-hover:text-brand">{next.title}</div>
              <div className="mt-0.5 text-xs text-muted">
                {next.minutes} минут · {next.quiz.length} асуулт
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef2f3]">
                <div className="h-full rounded-full bg-brand" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
              </div>
              <span className="mt-3 flex items-center justify-center gap-2 rounded-lg border-2 border-brand py-2 text-sm font-bold text-brand">
                <PlayCircle className="h-4 w-4" /> {prog.has(next.id) ? "Давтах" : "Эхлэх"}
              </span>
            </Link>
          ) : (
            <p className="py-6 text-center text-sm text-muted">Хичээл алга.</p>
          )}
        </Panel>

        <Panel
          title="Хийх даалгавар"
          action={
            <Link href="/daalgavar" className="text-sm font-bold text-brand">
              Бүгд
            </Link>
          }
        >
          {asg.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Бүх даалгавраа илгээсэн байна 🎉</p>
          ) : (
            <ul className="grid grid-cols-1 divide-y divide-line">
              {asg.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Link href={`/daalgavar/${a.id}`} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff5e0] text-[#c27c00]">
                      <ClipboardList className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{a.title}</span>
                      {a.dueAt && <span className="block text-xs text-muted">Хугацаа: {formatDate(a.dueAt)}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
