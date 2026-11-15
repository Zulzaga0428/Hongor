import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, ClipboardList, GraduationCap, Plus, Users } from "lucide-react";
import { desc } from "drizzle-orm";
import { LEVELS, LEVEL_IDS, type LevelId } from "@/content/lessons";
import { requireTeacher } from "@/server/auth";
import { getDb, schema } from "@/server/db";
import { allStudents, pendingSubmissions } from "@/server/queries";
import { formatDate } from "@/components/ui";
import { Panel } from "@/components/staff/panel";

function Kpi({ icon: Icon, color, label, value, sub, href }: { icon: React.ComponentType<{ className?: string }>; color: string; label: string; value: string | number; sub: string; href: string }) {
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

export default async function TeacherHome() {
  const t = await requireTeacher();
  const db = await getDb();
  const [students, pending, asg] = await Promise.all([
    allStudents(),
    pendingSubmissions(),
    db.select().from(schema.assignments).orderBy(desc(schema.assignments.createdAt)),
  ]);
  const withScores = students.filter((s) => s.avg !== null);
  const avg = withScores.length ? Math.round(withScores.reduce((a, s) => a + (s.avg ?? 0), 0) / withScores.length) : null;
  const behind = students.filter((s) => s.total > 0 && s.done === 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold lg:text-[28px]">Сайн байна уу, {t.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-muted">Хэлний сургалт — сурагчдын ахиц, шалгах даалгавар.</p>
        </div>
        <Link href="/bagsh/daalgavar" className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> Даалгавар өгөх
        </Link>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi icon={Users} color="#0f8a7e" label="Сурагч" value={students.length} sub={`${LEVEL_IDS.map((l) => students.filter((s) => s.level === l).length).join(" · ")} (N5·N4·N3)`} href="/bagsh/suragchid" />
        <Kpi icon={ClipboardCheck} color="#e5484d" label="Шалгах даалгавар" value={pending.length} sub={pending.length ? "Хүлээгдэж байна" : "Бүгд шалгагдсан"} href="#shalgah" />
        <Kpi icon={ClipboardList} color="#f5a524" label="Өгсөн даалгавар" value={asg.length} sub="Бүх түвшинд" href="/bagsh/daalgavar" />
        <Kpi icon={GraduationCap} color="#2563eb" label="Тестийн дундаж" value={avg === null ? "—" : `${avg}%`} sub={`${withScores.length} сурагчаар`} href="/bagsh/suragchid" />
      </section>

      <Panel title="Түвшнээр" className="mt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEVEL_IDS.map((l) => {
            const list = students.filter((s) => s.level === l);
            const done = list.reduce((a, s) => a + s.done, 0);
            const total = list.reduce((a, s) => a + s.total, 0);
            return (
              <Link key={l} href={`/bagsh/suragchid?level=${l}`} className="flex items-center gap-4 rounded-xl border border-line p-4 hover:border-brand">
                <span className="jp flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-extrabold text-brand">{LEVELS[l as LevelId].jp}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold">{LEVELS[l as LevelId].name}</span>
                    <span className="text-xl font-extrabold">{list.length}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eef2f3]">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {LEVELS[l as LevelId].jlpt} · хичээлийн {total ? Math.round((done / total) * 100) : 0}% дууссан
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div id="shalgah" className="xl:col-span-2">
          <Panel title="Шалгах даалгавар" action={<span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-bold text-danger">{pending.length}</span>}>
            {pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Бүгдийг шалгачихсан байна 🎉</p>
            ) : (
              <ul className="grid grid-cols-1 divide-y divide-line">
                {pending.map((p) => (
                  <li key={p.id}>
                    <Link href={`/bagsh/shalgah/${p.id}`} className="flex items-center gap-3 py-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-extrabold text-brand">{p.studentName.slice(0, 1)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{p.studentName}</span>
                        <span className="block truncate text-xs text-muted">
                          {p.title} · {formatDate(p.submittedAt)}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">{LEVELS[p.level as LevelId]?.jlpt}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title="Эхлээгүй сурагчид" action={<BookOpen className="h-5 w-5 text-muted" />}>
          {behind.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Бүгд хичээлээ эхэлсэн 👍</p>
          ) : (
            <ul className="grid grid-cols-1 divide-y divide-line">
              {behind.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff5e0] text-sm font-extrabold text-[#c27c00]">{s.name.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{s.name}</span>
                    <span className="block text-xs text-muted">{LEVELS[s.level as LevelId]?.name} · 0 хичээл</span>
                  </span>
                  <a href={`tel:${s.phone}`} className="text-xs font-bold text-brand">
                    Залгах
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
