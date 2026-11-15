"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { submitQuiz, type QuizResult } from "@/app/actions";

type Q = { q: string; options: string[] };

export function Quiz({ lessonId, questions, nextHref }: { lessonId: string; questions: Q[]; nextHref: string }) {
  const [i, setI] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pending, start] = useTransition();

  const restart = () => {
    setI(0);
    setChoices([]);
    setResult(null);
  };

  if (result && "score" in result) {
    const pct = result.score / result.total;
    return (
      <div className="card p-5">
        <div className="text-center">
          <div className="text-5xl">{pct === 1 ? "🌸" : pct >= 0.6 ? "👏" : "💪"}</div>
          <div className="mt-2 text-3xl font-extrabold">
            {result.score}/{result.total}
          </div>
          <p className="jp mt-1 font-bold text-red">{pct === 1 ? "かんぺき！ Төгс!" : pct >= 0.6 ? "よくできました！ Сайн байна!" : "がんばって！ Дахиад оролдоё!"}</p>
        </div>
        <ul className="mt-5 grid grid-cols-1 gap-2">
          {questions.map((q, k) => {
            const ok = choices[k] === result.correct[k];
            return (
              <li key={k} className={`rounded-2xl p-3 text-sm ${ok ? "bg-[#dff5ea]" : "bg-pink"}`}>
                <div className="font-bold">
                  {ok ? "✓" : "✗"} {q.q}
                </div>
                {!ok && (
                  <div className="jp mt-1 text-muted">
                    Зөв хариулт: <b className="text-ink">{q.options[result.correct[k]]}</b>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-5 grid grid-cols-1 gap-3">
          <Link href={nextHref} className="btn btn-red">
            Үргэлжлүүлэх
          </Link>
          <button type="button" onClick={restart} className="btn btn-ghost">
            Дахин өгөх
          </button>
        </div>
      </div>
    );
  }

  const q = questions[i];
  const picked = choices[i];
  const last = i === questions.length - 1;

  const pick = (k: number) => {
    const c = [...choices];
    c[i] = k;
    setChoices(c);
  };

  const next = () => {
    if (!last) return setI(i + 1);
    start(async () => setResult(await submitQuiz(lessonId, choices)));
  };

  return (
    <div className="card p-5">
      <div className="mb-4 flex gap-1.5">
        {questions.map((_, k) => (
          <span key={k} className={`h-2 flex-1 rounded-full ${k < i ? "bg-red" : k === i ? "bg-sakura" : "bg-pink"}`} />
        ))}
      </div>
      <div className="text-xs font-bold text-muted">
        Асуулт {i + 1}/{questions.length}
      </div>
      <h3 className="jp mt-1 text-lg font-extrabold">{q.q}</h3>
      <div className="mt-4 grid grid-cols-1 gap-2.5">
        {q.options.map((o, k) => (
          <button
            key={k}
            type="button"
            onClick={() => pick(k)}
            className={`jp rounded-2xl border-2 px-4 py-3.5 text-left text-[17px] font-bold transition active:scale-[0.98] ${
              picked === k ? "border-red bg-pink text-red-deep" : "border-line bg-white"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {result && "error" in result && <p className="mt-3 text-sm font-bold text-danger">{result.error}</p>}
      <button type="button" onClick={next} disabled={picked === undefined || pending} className="btn btn-red mt-5">
        {pending ? "Шалгаж байна…" : last ? "Дуусгах" : "Дараах"}
      </button>
    </div>
  );
}
