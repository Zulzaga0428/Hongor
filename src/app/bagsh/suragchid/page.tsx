import Link from "next/link";
import { LEVELS, LEVEL_IDS, isLevel } from "@/content/lessons";
import { requireTeacher } from "@/server/auth";
import { allStudents } from "@/server/queries";
import { Progress } from "@/components/ui";

export default async function Students({ searchParams }: PageProps<"/bagsh/suragchid">) {
  await requireTeacher();
  const { level } = await searchParams;
  const filter = isLevel(level) ? level : null;
  const all = await allStudents();
  const list = filter ? all.filter((s) => s.level === filter) : all;

  const tab = (href: string, on: boolean, label: string) => (
    <Link href={href} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${on ? "bg-red text-white" : "bg-white text-muted border border-line"}`}>
      {label}
    </Link>
  );

  return (
    <>
      <h1 className="text-2xl font-extrabold">Сурагчид</h1>
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {tab("/bagsh/suragchid", !filter, `Бүгд ${all.length}`)}
        {LEVEL_IDS.map((l) => tab(`/bagsh/suragchid?level=${l}`, filter === l, `${LEVELS[l].name}`))}
      </div>

      {list.length === 0 ? (
        <div className="card mt-5 p-6 text-center text-sm text-muted">Энэ түвшинд сурагч алга.</div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
          {list.map((s) => (
            <li key={s.id} className="card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink font-extrabold text-red">{s.name.slice(0, 1)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{s.name}</div>
                  <a href={`tel:${s.phone}`} className="text-xs text-muted">
                    {s.phone}
                  </a>
                </div>
                <div className="text-right">
                  <div className="jp text-xs font-bold text-red">{LEVELS[s.level as keyof typeof LEVELS]?.jlpt}</div>
                  <div className="text-xs text-muted">{s.avg === null ? "—" : `дундаж ${s.avg}%`}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={s.total ? (s.done / s.total) * 100 : 0} />
                <span className="shrink-0 text-xs font-bold text-muted">
                  {s.done}/{s.total}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
