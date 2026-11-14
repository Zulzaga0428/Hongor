"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { saveAnket } from "@/app/material-actions";
import { COUNTRIES, COUNTRY_IDS, EDUCATION, JOB_TYPES, type CountryId } from "@/content/programs";

type Values = Record<
  | "country" | "program" | "jobType" | "lastName" | "firstName" | "birthDate" | "gender" | "address"
  | "education" | "experience" | "heightCm" | "weightKg" | "emergencyName" | "emergencyPhone",
  string
>;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="card grid grid-cols-1 gap-4 p-5">
      <h2 className="flex items-center gap-2 font-extrabold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Chips({ options, value, onPick }: { options: readonly string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onPick(o)}
          className={`rounded-full border-2 px-3.5 py-2 text-sm font-bold transition ${value === o ? "border-red bg-pink text-red-deep" : "border-line bg-white"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

const L = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <label className="grid gap-1.5">
    <span className="text-sm font-bold">{t}</span>
    {children}
  </label>
);

export function AnketForm({ initial, consented, submitted }: { initial: Values; consented: boolean; submitted: boolean }) {
  const [state, action, pending] = useActionState(saveAnket, undefined);
  // Удирдлагатай: алдаа гарахад React 19 талбаруудыг хоосолдог тул бүгдийг state-д.
  const [v, setV] = useState<Values>(initial);
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const pick = (k: keyof Values) => (x: string) => setV((p) => ({ ...p, [k]: x }));
  const country = v.country as CountryId | "";

  return (
    // `action=` биш onSubmit: React 19 action-ын дараа формыг reset хийж,
    // select-ийг (хөтөлбөр) эхний сонголт руу нь харагдуулдаг байсан.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid grid-cols-1 gap-4"
    >
      {(Object.keys(v) as (keyof Values)[]).map((k) => (
        <input key={k} type="hidden" name={k} value={v[k]} />
      ))}

      <Section n={1} title="Хаана, ямар ажилд">
        <div className="grid grid-cols-3 gap-2">
          {COUNTRY_IDS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={country === id}
              onClick={() => setV((p) => ({ ...p, country: id, program: p.country === id ? p.program : "" }))}
              className={`rounded-2xl border-2 p-3 text-center transition ${country === id ? "border-red bg-pink" : "border-line bg-white"}`}
            >
              <div className={`mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold ${country === id ? "bg-red text-white" : "bg-pink text-red"}`}>
                {COUNTRIES[id].code}
              </div>
              <div className="text-sm font-extrabold">{COUNTRIES[id].name}</div>
            </button>
          ))}
        </div>
        {country && (
          <L t="Хөтөлбөр">
            <select value={v.program} onChange={set("program")} className="field jp">
              <option value="">— Сонгох —</option>
              {COUNTRIES[country].programs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </L>
        )}
        <div className="grid gap-1.5">
          <span className="text-sm font-bold">Ажлын чиглэл</span>
          <Chips options={JOB_TYPES} value={v.jobType} onPick={pick("jobType")} />
        </div>
      </Section>

      <Section n={2} title="Хувийн мэдээлэл">
        <div className="grid grid-cols-2 gap-3">
          <L t="Овог">
            <input value={v.lastName} onChange={set("lastName")} autoComplete="family-name" className="field" />
          </L>
          <L t="Нэр">
            <input value={v.firstName} onChange={set("firstName")} autoComplete="given-name" className="field" />
          </L>
        </div>
        <L t="Төрсөн огноо">
          <input type="date" value={v.birthDate} onChange={set("birthDate")} className="field" />
        </L>
        <div className="grid gap-1.5">
          <span className="text-sm font-bold">Хүйс</span>
          <Chips options={["Эрэгтэй", "Эмэгтэй"]} value={v.gender} onPick={pick("gender")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <L t="Өндөр (см)">
            <input inputMode="numeric" value={v.heightCm} onChange={set("heightCm")} placeholder="172" className="field" />
          </L>
          <L t="Жин (кг)">
            <input inputMode="numeric" value={v.weightKg} onChange={set("weightKg")} placeholder="68" className="field" />
          </L>
        </div>
        <L t="Гэрийн хаяг">
          <input value={v.address} onChange={set("address")} placeholder="Аймаг/дүүрэг, сум/хороо" className="field" />
        </L>
      </Section>

      <Section n={3} title="Боловсрол, туршлага">
        <div className="grid gap-1.5">
          <span className="text-sm font-bold">Боловсрол</span>
          <Chips options={EDUCATION} value={v.education} onPick={pick("education")} />
        </div>
        <L t="Ажлын туршлага">
          <textarea
            rows={4}
            value={v.experience}
            onChange={set("experience")}
            placeholder="Жишээ: 2021–2023 барилгын туслах ажилтан, 2 жил"
            className="field text-base"
          />
        </L>
      </Section>

      <Section n={4} title="Яаралтай үед холбогдох хүн">
        <L t="Нэр, хамаарал">
          <input value={v.emergencyName} onChange={set("emergencyName")} placeholder="Жишээ: Дулмаа (ээж)" className="field" />
        </L>
        <L t="Утас">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={8}
            value={v.emergencyPhone}
            onChange={(e) => setV((p) => ({ ...p, emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 8) }))}
            placeholder="99112233"
            className="field tracking-wider"
          />
        </L>
      </Section>

      {!consented && (
        <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm">
          <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--red)]" />
          <span>
            Миний хувийн мэдээллийг гадаадад ажилд зуучлах зорилгоор боловсруулж, албан ёсны эрхтэй хамтрагч зуучлалын байгууллага болон ажил
            олгогчид дамжуулахыг зөвшөөрч байна.{" "}
            <Link href="/nuutslal" className="font-bold text-red underline">
              Нууцлалын бодлого
            </Link>
          </span>
        </label>
      )}

      {state?.error && <p role="alert" className="rounded-2xl bg-pink px-4 py-3 text-sm font-bold text-red-deep">{state.error}</p>}
      {state?.ok && (
        <p role="status" className="rounded-2xl bg-[#dff5ea] px-4 py-3 text-sm font-bold text-green">
          {state.ok}{" "}
          <Link href="/material/barimt" className="underline">
            Баримт хуулах →
          </Link>
        </p>
      )}
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Хадгалж байна…" : submitted ? "Хадгалах" : "Анкет илгээх"}
      </button>
    </form>
  );
}
