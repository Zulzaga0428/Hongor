import { notFound } from "next/navigation";
import { getLesson, lessonsFor, type LevelId } from "@/content/lessons";
import { requireStudent } from "@/server/auth";
import { progressOf } from "@/server/queries";
import { Back, Badge } from "@/components/ui";
import { KanaCell, SpeakButton } from "@/components/speak";
import { Quiz } from "@/components/quiz";

export default async function LessonPage({ params }: PageProps<"/hicheel/[id]">) {
  const u = await requireStudent();
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  const prog = (await progressOf(u.id)).get(lesson.id);
  const siblings = lessonsFor(lesson.level as LevelId);
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const nextHref = siblings[idx + 1] ? `/hicheel/${siblings[idx + 1].id}` : "/hicheel";
  // Зөв хариултыг хөтөч рүү илгээхгүй.
  const questions = lesson.quiz.map(({ q, options }) => ({ q, options }));

  return (
    <>
      <Back href="/hicheel" label="Хичээлүүд" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-muted">
            Хичээл {idx + 1} · {lesson.minutes} мин
          </div>
          <h1 className="text-2xl font-extrabold">{lesson.title}</h1>
        </div>
        {prog && <Badge tone="green">✓ {prog.score}/{prog.total}</Badge>}
      </div>

      <div className="mt-5 grid gap-5">
        {lesson.sections.map((s, k) => {
          if (s.type === "note")
            return (
              <section key={k} className="rounded-3xl bg-pink p-5">
                <h2 className="mb-1.5 font-extrabold text-red-deep">💡 {s.title}</h2>
                <p className="jp text-[15px] leading-relaxed">{s.text}</p>
              </section>
            );
          if (s.type === "kana")
            return (
              <section key={k}>
                <h2 className="mb-1 font-extrabold">{s.title}</h2>
                <p className="mb-3 text-xs text-muted">Үсэг дээр дарж дуудлагыг сонс 🔊</p>
                <div className="grid grid-cols-1 gap-2">
                  {s.rows.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-5 gap-2">
                      {row.map(([kana, romaji]) => (
                        <KanaCell key={kana} kana={kana} romaji={romaji} />
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          return (
            <section key={k}>
              <h2 className="mb-3 font-extrabold">{s.title}</h2>
              <ul className="card divide-y divide-line">
                {s.items.map((w) => (
                  <li key={w.jp} className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="jp text-lg font-extrabold">{w.jp}</div>
                      <div className="text-xs font-bold text-red">{w.romaji}</div>
                      <div className="text-sm text-muted">{w.mn}</div>
                    </div>
                    <SpeakButton text={w.jp} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section>
          <h2 className="mb-3 text-lg font-extrabold">✏️ Шалгалт</h2>
          <Quiz lessonId={lesson.id} questions={questions} nextHref={nextHref} />
        </section>
      </div>
    </>
  );
}
