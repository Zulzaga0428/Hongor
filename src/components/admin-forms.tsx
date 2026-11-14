"use client";

import { startTransition, useActionState, useState } from "react";
import { deletePerson, saveStaffNote, setStage } from "@/app/material-actions";
import { PAUSED, STAGES } from "@/content/programs";

export function StageForm({ userId, current }: { userId: string; current: string }) {
  const [state, action, pending] = useActionState(setStage, undefined);
  const [stage, setS] = useState(current);
  const [note, setNote] = useState("");
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok) setNote("");
  }
  return (
    // onSubmit: `action=` нь дууссаны дараа select-ийг эхний шат руу нь reset хийдэг.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid grid-cols-1 gap-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <select name="stage" value={stage} onChange={(e) => setS(e.target.value)} className="field">
        {[...STAGES, PAUSED].map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input name="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Тайлбар (сурагчид харагдана)" className="field" />
      {state?.error && <p className="text-sm font-bold text-red">{state.error}</p>}
      {state?.ok && <p className="text-sm font-bold text-green">{state.ok}</p>}
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Хадгалж байна…" : "Шат солих"}
      </button>
    </form>
  );
}

export function DeletePerson({ userId, name }: { userId: string; name: string }) {
  const [state, action, pending] = useActionState(deletePerson, undefined);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full py-3 text-sm font-bold text-muted underline">
        Бүртгэл устгах…
      </button>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid grid-cols-1 gap-3 rounded-3xl border-2 border-red bg-pink p-5"
    >
      <input type="hidden" name="userId" value={userId} />
      <p className="text-sm font-bold text-red-deep">
        «{name}»-ийн анкет, бичиг баримт, оноо, түүх бүгд бүрмөсөн устна. Буцаах боломжгүй.
      </p>
      <input name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="УСТГАХ гэж бичнэ үү" className="field" />
      {state?.error && <p className="text-sm font-bold text-red">{state.error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
          Болих
        </button>
        <button className="btn btn-red" disabled={pending || confirm !== "УСТГАХ"}>
          {pending ? "…" : "Устгах"}
        </button>
      </div>
    </form>
  );
}

export function NoteForm({ userId, initial }: { userId: string; initial: string }) {
  const [state, action, pending] = useActionState(saveStaffNote, undefined);
  const [note, setNote] = useState(initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-2">
      <input type="hidden" name="userId" value={userId} />
      <textarea name="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Зөвхөн ажилтнуудад харагдана" className="field text-base" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-green">{state?.ok}</span>
        <button className="rounded-full border-2 border-line bg-white px-4 py-2 text-sm font-bold" disabled={pending}>
          {pending ? "…" : "Хадгалах"}
        </button>
      </div>
    </form>
  );
}
