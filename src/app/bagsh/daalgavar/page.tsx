import { desc } from "drizzle-orm";
import { LEVELS, type LevelId } from "@/content/lessons";
import { requireTeacher } from "@/server/auth";
import { getDb, schema } from "@/server/db";
import { Badge, formatDate } from "@/components/ui";
import { NewAssignmentForm } from "@/components/forms";

export default async function TeacherAssignments() {
  await requireTeacher();
  const db = await getDb();
  const list = await db.select().from(schema.assignments).orderBy(desc(schema.assignments.createdAt));
  const subs = await db.select({ a: schema.submissions.assignmentId }).from(schema.submissions);
  const n = (id: string) => subs.filter((s) => s.a === id).length;

  return (
    <>
      <h1 className="text-2xl font-bold lg:text-[28px]">Даалгавар</h1>
      <section className="card mt-5 p-5">
        <h2 className="mb-3 font-extrabold">➕ Шинэ даалгавар</h2>
        <NewAssignmentForm />
      </section>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Өгсөн даалгаврууд</h2>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        {list.map((a) => (
          <li key={a.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="font-bold">{a.title}</div>
              <Badge>{LEVELS[a.level as LevelId]?.jlpt}</Badge>
            </div>
            <p className="jp mt-1 line-clamp-2 text-sm text-muted">{a.instructions}</p>
            <div className="mt-2 flex gap-3 text-xs font-bold text-muted">
              <span>📥 {n(a.id)} илгээсэн</span>
              {a.dueAt && <span>⏰ {formatDate(a.dueAt)}</span>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
