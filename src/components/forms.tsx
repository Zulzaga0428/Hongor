"use client";

import { useActionState, useState } from "react";
import { createAssignment, gradeSubmission, submitAssignment, type FormState } from "@/app/actions";
import { LEVELS, LEVEL_IDS } from "@/content/lessons";

function Msg({ state }: { state: FormState }) {
  if (state?.error) return <p role="alert" className="rounded-2xl bg-pink px-4 py-3 text-sm font-bold text-red-deep">{state.error}</p>;
  if (state?.ok) return <p role="status" className="rounded-2xl bg-[#dff5ea] px-4 py-3 text-sm font-bold text-green">{state.ok}</p>;
  return null;
}

export function AnswerForm({ assignmentId, initial }: { assignmentId: string; initial?: string }) {
  const [state, action, pending] = useActionState(submitAssignment, undefined);
  // Удирдлагатай: алдаа гарсан ч сурагчийн бичсэн хариулт арилахгүй.
  const [answer, setAnswer] = useState(initial ?? "");
  return (
    <form action={action} className="grid grid-cols-1 gap-3">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <textarea
        name="answer"
        required
        rows={7}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Хариултаа энд бичнэ үү… (япон эсвэл ромажигаар)"
        className="field jp resize-y text-base leading-relaxed"
      />
      <Msg state={state} />
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Илгээж байна…" : initial ? "Засаж илгээх" : "Илгээх"}
      </button>
    </form>
  );
}

export function GradeForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(gradeSubmission, undefined);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  return (
    <form action={action} className="grid grid-cols-1 gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Оноо (0–100)</span>
        <input name="score" type="number" inputMode="numeric" min={0} max={100} required value={score} onChange={(e) => setScore(e.target.value)} className="field text-center text-2xl font-extrabold" />
      </label>
      <div className="flex flex-wrap gap-2">
        {["よくできました！", "Маш сайн!", "Хирагана дахин давт", "Өгүүлбэрийн дараалал анхаар"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFeedback((f) => (f ? `${f} ${t}` : t))}
            className="jp rounded-full bg-pink px-3 py-1.5 text-xs font-bold text-red-deep"
          >
            + {t}
          </button>
        ))}
      </div>
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Сэтгэгдэл</span>
        <textarea name="feedback" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Сурагчид хэлэх зөвлөгөө…" className="field jp text-base" />
      </label>
      <Msg state={state} />
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Хадгалж байна…" : "Оноо өгөх"}
      </button>
    </form>
  );
}

export function NewAssignmentForm() {
  const [state, action, pending] = useActionState(createAssignment, undefined);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  // Амжилттай нэмсний дараа л хоосолно — алдаа гарвал багшийн бичсэн үлдэнэ.
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok) {
      setTitle("");
      setText("");
    }
  }
  return (
    <form action={action} className="grid grid-cols-1 gap-3">
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Түвшин</span>
        <select name="level" className="field" defaultValue="anhan">
          {LEVEL_IDS.map((id) => (
            <option key={id} value={id}>
              {LEVELS[id].name} ({LEVELS[id].jlpt})
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Гарчиг</span>
        <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Жишээ: Катакана бичих" className="field" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Даалгавар</span>
        <textarea name="instructions" required rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Сурагч юу хийх вэ?" className="field jp text-base" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Хугацаа (заавал биш)</span>
        <input name="due" type="date" className="field" />
      </label>
      <Msg state={state} />
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Нэмж байна…" : "Даалгавар өгөх"}
      </button>
    </form>
  );
}
