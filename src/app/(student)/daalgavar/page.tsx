import Link from "next/link";
import { requireStudent } from "@/server/auth";
import { assignmentsFor } from "@/server/queries";
import { Badge, formatDate } from "@/components/ui";

export default async function Assignments() {
  const u = await requireStudent();
  const list = await assignmentsFor(u);

  return (
    <>
      <h1 className="text-2xl font-extrabold">Даалгавар</h1>
      <p className="mt-1 text-sm text-muted">Багшаас ирсэн даалгавраа хийгээд илгээ</p>
      {list.length === 0 ? (
        <div className="card mt-6 p-6 text-center text-sm text-muted">Одоохондоо даалгавар алга.</div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
          {list.map((a) => {
            const s = a.submission;
            const status = s?.gradedAt ? (
              <Badge tone="green">{s.score} оноо</Badge>
            ) : s ? (
              <Badge tone="pink">Шалгуулж байна</Badge>
            ) : (
              <Badge tone="gold">Хийх</Badge>
            );
            return (
              <li key={a.id}>
                <Link href={`/daalgavar/${a.id}`} className="card block p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-extrabold">{a.title}</div>
                    {status}
                  </div>
                  <p className="jp mt-1 line-clamp-2 text-sm text-muted">{a.instructions}</p>
                  {a.dueAt && <div className="mt-2 text-xs font-bold text-muted">⏰ {formatDate(a.dueAt)} хүртэл</div>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
