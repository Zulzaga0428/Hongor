"use client";

import { useActionState, useState } from "react";
import { login, signup, type FormState } from "@/app/actions";
import { LEVELS, LEVEL_IDS, type LevelId } from "@/content/lessons";

function ErrorBox({ state }: { state: FormState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-2xl bg-pink px-4 py-3 text-sm font-bold text-red-deep">
      {state.error}
    </p>
  );
}

const onlyDigits = (e: React.FormEvent<HTMLInputElement>) => {
  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
};

/**
 * Удирдлагатай (controlled) талбар: React 19 нь form action-ын дараа
 * удирдлагагүй талбаруудыг хоосолдог тул буруу PIN оруулахад дугаар
 * арилчихдаг байсан.
 */
function PhoneField() {
  const [v, setV] = useState("");
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold">Утасны дугаар</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">+976</span>
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={8}
          required
          placeholder="99112233"
          value={v}
          onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, 8))}
          className="field pl-16 tracking-wider"
        />
      </div>
    </label>
  );
}

function PinField({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      <input
        name={name}
        type="password"
        inputMode="numeric"
        autoComplete={autoComplete}
        maxLength={4}
        required
        placeholder="• • • •"
        onInput={onlyDigits}
        className="field text-center text-2xl tracking-[0.6em]"
      />
    </label>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="grid grid-cols-1 gap-4">
      <PhoneField />
      <PinField name="pin" label="Нууц код (4 оронтой)" autoComplete="current-password" />
      <ErrorBox state={state} />
      <button className="btn btn-red mt-2" disabled={pending}>
        {pending ? "Түр хүлээнэ үү…" : "Нэвтрэх"}
      </button>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [level, setLevel] = useState<LevelId>("anhan");
  const [name, setName] = useState("");
  return (
    <form action={action} className="grid grid-cols-1 gap-4">
      <label className="grid gap-1.5">
        <span className="text-sm font-bold">Нэр</span>
        <input
          name="name"
          required
          autoComplete="given-name"
          placeholder="Жишээ нь: Анужин"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field"
        />
      </label>
      <PhoneField />
      <div className="grid grid-cols-2 gap-3">
        <PinField name="pin" label="Нууц код" autoComplete="new-password" />
        <PinField name="pin2" label="Дахин" autoComplete="new-password" />
      </div>

      <fieldset className="grid grid-cols-1 gap-2">
        <legend className="mb-1.5 text-sm font-bold">Түвшнээ сонго</legend>
        <input type="hidden" name="level" value={level} />
        {LEVEL_IDS.map((id) => {
          const on = level === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => setLevel(id)}
              aria-pressed={on}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                on ? "border-red bg-pink" : "border-line bg-white"
              }`}
            >
              <span
                className={`jp flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${
                  on ? "bg-red text-white" : "bg-pink text-red"
                }`}
              >
                {LEVELS[id].jp}
              </span>
              <span className="min-w-0">
                <span className="block font-extrabold">
                  {LEVELS[id].name} <span className="text-xs text-muted">{LEVELS[id].jlpt}</span>
                </span>
                <span className="block text-xs text-muted">{LEVELS[id].desc}</span>
              </span>
              <span className={`ml-auto h-5 w-5 shrink-0 rounded-full border-2 ${on ? "border-red bg-red shadow-[inset_0_0_0_3px_white]" : "border-line"}`} />
            </button>
          );
        })}
        <p className="text-xs text-muted">Мэдэхгүй бол «Анхан шат»-аас эхэл. Дараа нь сольж болно.</p>
      </fieldset>

      <ErrorBox state={state} />
      <button className="btn btn-red mt-2" disabled={pending}>
        {pending ? "Бүртгэж байна…" : "Бүртгүүлэх"}
      </button>
    </form>
  );
}
