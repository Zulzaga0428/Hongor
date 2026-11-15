"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { Camera, CheckCircle2, RotateCcw, Save, UserRound } from "lucide-react";
import { createPerson } from "@/app/material-actions";
import { COUNTRIES, COUNTRY_IDS, EDUCATION, JOB_TYPES, type CountryId } from "@/content/programs";
import { LEVELS, LEVEL_IDS } from "@/content/lessons";

const EMPTY = {
  name: "",
  gender: "",
  phone: "",
  lastName: "",
  firstName: "",
  country: "",
  program: "",
  jobType: "",
  birthDate: "",
  education: "",
  level: "anhan",
  orgId: "",
  address: "",
  experience: "",
};
type V = typeof EMPTY;

/** EduTrack маягийн талбар: хүрээн дотор жижиг гарчиг. */
function Box({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block rounded-lg border border-line bg-white px-3.5 pb-2 pt-1.5 focus-within:border-brand ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
const input = "w-full bg-transparent py-1 text-[15px] outline-none";

export function AddPersonForm({ base, orgs, orgName }: { base: string; orgs: { id: string; name: string }[]; orgName: string | null }) {
  const [state, action, pending] = useActionState(createPerson, undefined);
  const [v, setV] = useState<V>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [dismissed, setDismissed] = useState<typeof state>(undefined);
  const set = (k: keyof V) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const country = v.country as CountryId | "";

  // Амжилттай бүртгэсний дараа: кодыг НЭГ УДАА харуулна
  if (state?.pin && state !== dismissed) {
    return (
      <section className="mx-auto mt-6 max-w-lg rounded-xl border-t-[3px] border-brand bg-white p-8 text-center shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{state.name} бүртгэгдлээ</h2>
        <p className="mt-1 text-sm text-muted">Доорх мэдээллийг тухайн хүнд өгнө үү. Код дахин харагдахгүй.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f4f6f7] p-4">
            <div className="text-xs text-muted">Утас</div>
            <div className="text-xl font-extrabold tracking-wider">{state.phone}</div>
          </div>
          <div className="rounded-xl bg-brand-soft p-4">
            <div className="text-xs text-brand">Нэвтрэх код</div>
            <div className="text-3xl font-extrabold tracking-[0.3em] text-brand" data-testid="new-pin">
              {state.pin}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`${base}/hmuus/${state.id}`} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white">
            Профайл руу
          </Link>
          <button
            type="button"
            onClick={() => {
              setDismissed(state);
              setV(EMPTY);
              setConsent(false);
            }}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-bold"
          >
            Дахин нэмэх
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,9fr)]"
    >
      {/* Зүүн карт */}
      <section className="rounded-xl border-t-[3px] border-brand bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <div className="relative mx-auto mb-5 h-24 w-24">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#8a969c] text-white">
            <UserRound className="h-14 w-14" />
          </span>
          <span className="absolute -right-1 bottom-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white" title="Цээж зургийг бүртгэсний дараа «Бичиг баримт»-аар хуулна">
            <Camera className="h-4 w-4" />
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Box label="Бүртгэлийн нэр *">
            <input name="name" value={v.name} onChange={set("name")} placeholder="Жишээ: Болд" className={input} />
          </Box>
          <Box label="Хүйс">
            <select name="gender" value={v.gender} onChange={set("gender")} className={input}>
              <option value="">Сонгох…</option>
              <option>Эрэгтэй</option>
              <option>Эмэгтэй</option>
            </select>
          </Box>
          <Box label="Утас *">
            <input
              name="phone"
              inputMode="numeric"
              maxLength={8}
              value={v.phone}
              onChange={(e) => setV((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 8) }))}
              placeholder="99112233"
              className={`${input} tracking-wider`}
            />
          </Box>
          <div className="rounded-lg border border-line bg-[#eef1f3] px-3.5 pb-2 pt-1.5">
            <span className="block text-xs text-muted">Нэвтрэх код — автоматаар</span>
            <span className="block py-1 text-[15px] text-ink/60">Хадгалахад үүснэ</span>
          </div>
          {orgName ? (
            <div className="rounded-lg border border-line bg-[#eef1f3] px-3.5 pb-2 pt-1.5">
              <span className="block text-xs text-muted">Байгууллага</span>
              <span className="block py-1 text-[15px] font-bold">{orgName}</span>
            </div>
          ) : (
            <Box label="Хариуцах байгууллага">
              <select name="orgId" value={v.orgId} onChange={set("orgId")} className={input}>
                <option value="">Дараа оноох</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Box>
          )}
        </div>
      </section>

      {/* Баруун карт */}
      <section className="rounded-xl border-t-[3px] border-brand bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <h2 className="mb-4 text-[17px] font-bold">Дэлгэрэнгүй</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Box label="Овог">
            <input name="lastName" value={v.lastName} onChange={set("lastName")} className={input} />
          </Box>
          <Box label="Нэр">
            <input name="firstName" value={v.firstName} onChange={set("firstName")} className={input} />
          </Box>
          <Box label="Явах улс">
            <select name="country" value={v.country} onChange={(e) => setV((p) => ({ ...p, country: e.target.value, program: "" }))} className={input}>
              <option value="">Сонгох…</option>
              {COUNTRY_IDS.map((c) => (
                <option key={c} value={c}>
                  {COUNTRIES[c].name}
                </option>
              ))}
            </select>
          </Box>
          <Box label="Хөтөлбөр">
            <select name="program" value={v.program} onChange={set("program")} disabled={!country} className={`${input} disabled:text-muted`}>
              <option value="">{country ? "Сонгох…" : "Эхлээд улсаа сонго"}</option>
              {country &&
                COUNTRIES[country].programs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
          </Box>
          <Box label="Ажлын чиглэл">
            <select name="jobType" value={v.jobType} onChange={set("jobType")} className={input}>
              <option value="">Сонгох…</option>
              {JOB_TYPES.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </Box>
          <Box label="Төрсөн огноо">
            <input type="date" name="birthDate" value={v.birthDate} onChange={set("birthDate")} className={input} />
          </Box>
          <Box label="Боловсрол">
            <select name="education" value={v.education} onChange={set("education")} className={input}>
              <option value="">Сонгох…</option>
              {EDUCATION.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Box>
          <Box label="Хэлний түвшин">
            <select name="level" value={v.level} onChange={set("level")} className={input}>
              {LEVEL_IDS.map((l) => (
                <option key={l} value={l}>
                  {LEVELS[l].name} ({LEVELS[l].jlpt})
                </option>
              ))}
            </select>
          </Box>
          <Box label="Гэрийн хаяг" full>
            <textarea name="address" rows={2} value={v.address} onChange={set("address")} className={`${input} resize-y`} />
          </Box>
          <Box label="Ажлын туршлага" full>
            <textarea name="experience" rows={2} value={v.experience} onChange={set("experience")} className={`${input} resize-y`} />
          </Box>
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-lg bg-[#f4f6f7] p-3.5 text-sm">
          <input type="checkbox" name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" />
          <span>Тухайн хүнээс хувийн мэдээллийг нь гадаадад ажилд зуучлах зорилгоор боловсруулах, хамтрагч байгууллагад дамжуулах зөвшөөрөл авсан.</span>
        </label>

        {state?.error && state !== dismissed && (
          <p role="alert" className="mt-3 rounded-lg bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#d93036]">
            {state.error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setV(EMPTY);
              setConsent(false);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#3f4a50] px-4 py-2.5 text-sm font-bold text-white"
          >
            <RotateCcw className="h-4 w-4" /> Цэвэрлэх
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60" disabled={pending}>
            <Save className="h-4 w-4" /> {pending ? "Хадгалж байна…" : "Бүртгэх"}
          </button>
        </div>
      </section>
    </form>
  );
}
