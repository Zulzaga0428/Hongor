import { notFound } from "next/navigation";
import { LEVELS, type LevelId } from "@/content/lessons";
import { requireTeacher } from "@/server/auth";
import { submissionDetail } from "@/server/queries";
import { Back, Badge, formatDate } from "@/components/ui";
import { GradeForm } from "@/components/forms";

export default async function Grade({ params }: PageProps<"/bagsh/shalgah/[id]">) {
  await requireTeacher();
  const { id } = await params;
  const d = await submissionDetail(id);
  if (!d) notFound();

  return (
    <>
      <Back href="/bagsh" label="Самбар" />
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink text-lg font-extrabold text-red">{d.student.name.slice(0, 1)}</span>
        <div>
          <h1 className="text-xl font-extrabold">{d.student.name}</h1>
          <p className="text-xs text-muted">
            {LEVELS[d.student.level as LevelId]?.name} · {formatDate(d.sub.submittedAt)}
          </p>
        </div>
        {d.sub.gradedAt && <Badge tone="green">{d.sub.score} оноо</Badge>}
      </div>

      <section className="mt-5 rounded-3xl bg-pink p-4">
        <div className="text-xs font-bold text-red-deep">{d.asg.title}</div>
        <p className="jp mt-1 text-sm">{d.asg.instructions}</p>
      </section>

      <section className="card mt-4 p-5">
        <div className="mb-2 text-xs font-bold text-muted">Сурагчийн хариулт</div>
        <p className="jp whitespace-pre-line text-lg leading-relaxed">{d.sub.answer}</p>
      </section>

      <section className="mt-5">
        <GradeForm id={d.sub.id} />
      </section>
    </>
  );
}
