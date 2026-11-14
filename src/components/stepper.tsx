import { PAUSED, STAGES, stageIndex } from "@/content/programs";

/** Бүртгүүлснээс нисэх хүртэлх зам — босоо, утсанд тохиромжтой. */
export function Stepper({ stage }: { stage: string }) {
  const paused = stage === PAUSED.id;
  const cur = stageIndex(stage);
  return (
    <div>
      {paused && (
        <p className="mb-3 rounded-2xl bg-[#f3eeee] px-4 py-3 text-sm font-bold text-muted">⏸ Таны материал түр зогссон байна. Дэлгэрэнгүйг ажилтнаас асууна уу.</p>
      )}
      <ol className="grid grid-cols-1">
        {STAGES.map((s, i) => {
          const done = !paused && i < cur;
          const now = !paused && i === cur;
          return (
            <li key={s.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                    done ? "bg-red text-white" : now ? "bg-white text-red ring-4 ring-red" : "bg-pink text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                {i < STAGES.length - 1 && <span className={`w-1 flex-1 ${done ? "bg-red" : "bg-pink"}`} style={{ minHeight: 18 }} />}
              </div>
              <div className={`pb-4 pt-1 ${now ? "font-extrabold text-ink" : done ? "font-bold text-ink" : "text-muted"}`}>
                {s.name}
                {now && <span className="ml-2 rounded-full bg-pink px-2 py-0.5 text-[11px] font-bold text-red-deep">Одоо энд</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Нэг мөрөнд багтах жижиг шат — жагсаалтад. */
export function StageDots({ stage }: { stage: string }) {
  const cur = stageIndex(stage);
  return (
    <span className="flex gap-1" aria-hidden>
      {STAGES.map((s, i) => (
        <span key={s.id} className={`h-1.5 w-3 rounded-full ${stage === PAUSED.id ? "bg-[#e5dcdc]" : i <= cur ? "bg-red" : "bg-pink"}`} />
      ))}
    </span>
  );
}
