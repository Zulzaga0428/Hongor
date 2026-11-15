import { PAUSED, STAGES, stageIndex } from "@/content/programs";

/** Явцын шат — хэвтээ (EduTrack-ийн progress мэт), утсан дээр гүйлгэнэ. */
export function StageTrack({ stage }: { stage: string }) {
  const cur = stageIndex(stage);
  const paused = stage === PAUSED.id;
  return (
    <ol className="-mx-1 flex overflow-x-auto px-1 pb-1">
      {STAGES.map((s, i) => {
        const done = !paused && i < cur;
        const now = !paused && i === cur;
        return (
          <li key={s.id} className="flex min-w-[76px] flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={`h-1 flex-1 ${i === 0 ? "opacity-0" : done || now ? "bg-brand" : "bg-line"}`} />
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                  done ? "bg-brand text-white" : now ? "bg-white text-brand ring-[3px] ring-brand" : "bg-[#eef2f3] text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={`h-1 flex-1 ${i === STAGES.length - 1 ? "opacity-0" : done ? "bg-brand" : "bg-line"}`} />
            </div>
            <span className={`mt-1.5 px-1 text-center text-[11px] leading-tight ${now ? "font-extrabold text-brand" : done ? "font-bold" : "text-muted"}`}>{s.short}</span>
          </li>
        );
      })}
    </ol>
  );
}

