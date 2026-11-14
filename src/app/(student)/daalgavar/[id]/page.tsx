import { notFound } from "next/navigation";
import { requireStudent } from "@/server/auth";
import { assignmentWithSubmission } from "@/server/queries";
import { Back, Badge, formatDate } from "@/components/ui";
import { AnswerForm } from "@/components/forms";

export default async function AssignmentPage({ params }: PageProps<"/daalgavar/[id]">) {
  const u = await requireStudent();
  const { id } = await params;
  const a = await assignmentWithSubmission(u, id);
  if (!a) notFound();
  const s = a.submission;

  return (
    <>
      <Back href="/daalgavar" label="Даалгаврууд" />
      <h1 className="text-2xl font-extrabold">{a.title}</h1>
      {a.dueAt && <p className="mt-1 text-sm font-bold text-muted">⏰ {formatDate(a.dueAt)} хүртэл</p>}

      <section className="mt-5 rounded-3xl bg-pink p-5">
        <h2 className="mb-1.5 font-extrabold text-red-deep">📝 Даалгавар</h2>
        <p className="jp whitespace-pre-line text-[15px] leading-relaxed">{a.instructions}</p>
      </section>

      {s?.gradedAt ? (
        <section className="mt-5 grid grid-cols-1 gap-4">
          <div className="card p-5 text-center">
            <div className="text-xs font-bold text-muted">Багшийн оноо</div>
            <div className="text-5xl font-extrabold text-red">{s.score}</div>
            {s.feedback && <p className="jp mt-3 rounded-2xl bg-bg p-3 text-left text-[15px]">💬 {s.feedback}</p>}
          </div>
          <div className="card p-4">
            <div className="mb-1 text-xs font-bold text-muted">Миний хариулт</div>
            <p className="jp whitespace-pre-line">{s.answer}</p>
          </div>
        </section>
      ) : (
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold">Миний хариулт</h2>
            {s && <Badge tone="pink">Илгээсэн · шалгуулж байна</Badge>}
          </div>
          <AnswerForm assignmentId={a.id} initial={s?.answer} />
        </section>
      )}
    </>
  );
}
