"use client";

import { startTransition, useActionState, useState } from "react";
import { assignOrg, createOrg, createOrgStaff, deletePerson, saveStaffNote, setStage } from "@/app/material-actions";
import type { FormState } from "@/app/actions";

/** Action дууссаны дараа формыг reset хийлгэхгүй (React 19) — select буцахаас сэргийлнэ. */
function submitKeep(action: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
}

function Msg({ state }: { state: FormState }) {
  if (state?.error) return <p className="text-sm font-bold text-danger">{state.error}</p>;
  if (state?.ok) return <p className="text-sm font-bold text-green">{state.ok}</p>;
  return null;
}

export function AssignOrgForm({ userId, current, orgs, disabled }: { userId: string; current: string; orgs: { id: string; name: string }[]; disabled?: boolean }) {
  const [state, action, pending] = useActionState(assignOrg, undefined);
  const [orgId, setOrgId] = useState(current);
  return (
    <form onSubmit={submitKeep(action)} className="grid grid-cols-1 gap-3">
      <input type="hidden" name="userId" value={userId} />
      <select name="orgId" value={orgId} onChange={(e) => setOrgId(e.target.value)} disabled={disabled} className="field">
        <option value="">— Оноогоогүй —</option>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <Msg state={state} />
      <button className="rounded-2xl bg-brand py-3 font-extrabold text-white disabled:opacity-50" disabled={pending || disabled || orgId === current}>
        {pending ? "…" : orgId ? "Оноох" : "Буцааж авах"}
      </button>
    </form>
  );
}

/** Хүснэгтийн мөрөнд шууд оноох — хүний хуудсыг нэг бүрчлэн нээхгүй. */
export function QuickAssign({ userId, orgs }: { userId: string; orgs: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(assignOrg, undefined);
  const [orgId, setOrgId] = useState("");
  if (state?.ok) return <span className="text-xs font-bold text-green">✓ {state.ok}</span>;
  return (
    <form onSubmit={submitKeep(action)} className="flex items-center gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="orgId"
        value={orgId}
        onChange={(e) => setOrgId(e.target.value)}
        aria-label="Байгууллага сонгох"
        className="w-40 rounded-lg border border-line bg-white px-2 py-1.5 text-xs outline-none focus:border-brand"
      >
        <option value="">Байгууллага…</option>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <button className="rounded-lg bg-brand px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-40" disabled={!orgId || pending}>
        {pending ? "…" : "Оноох"}
      </button>
      {state?.error && <span className="text-xs font-bold text-danger">{state.error}</span>}
    </form>
  );
}

const COUNTRY_OPTS = [
  { id: "korea", name: "Солонгос" },
  { id: "japan", name: "Япон" },
  { id: "czech", name: "Чех" },
];

export function CreateOrgForm() {
  const [state, action, pending] = useActionState(createOrg, undefined);
  const [v, setV] = useState({ name: "", contactName: "", phone: "" });
  const [c, setC] = useState<string[]>([]);
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok) {
      setV({ name: "", contactName: "", phone: "" });
      setC([]);
    }
  }
  return (
    <form onSubmit={submitKeep(action)} className="grid grid-cols-1 gap-3">
      <input name="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Байгууллагын нэр" className="field" />
      <div className="grid grid-cols-2 gap-3">
        <input name="contactName" value={v.contactName} onChange={(e) => setV({ ...v, contactName: e.target.value })} placeholder="Холбоо барих хүн" className="field" />
        <input name="phone" inputMode="numeric" maxLength={8} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value.replace(/\D/g, "") })} placeholder="Утас" className="field" />
      </div>
      <div className="flex flex-wrap gap-2">
        {COUNTRY_OPTS.map((o) => {
          const on = c.includes(o.id);
          return (
            <label key={o.id} className={`cursor-pointer rounded-full border-2 px-3.5 py-2 text-sm font-bold ${on ? "border-brand bg-brand-soft text-brand" : "border-line bg-white"}`}>
              <input type="checkbox" name="countries" value={o.id} checked={on} onChange={() => setC(on ? c.filter((x) => x !== o.id) : [...c, o.id])} className="sr-only" />
              {o.name}
            </label>
          );
        })}
      </div>
      <Msg state={state} />
      <button className="btn rounded-2xl bg-brand text-white" disabled={pending}>
        {pending ? "…" : "Байгууллага нэмэх"}
      </button>
    </form>
  );
}

export function CreateStaffForm({ orgId }: { orgId: string }) {
  const [state, action, pending] = useActionState(createOrgStaff, undefined);
  const [v, setV] = useState({ name: "", phone: "", pin: "" });
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok) setV({ name: "", phone: "", pin: "" });
  }
  return (
    <form onSubmit={submitKeep(action)} className="grid grid-cols-1 gap-2">
      <input type="hidden" name="orgId" value={orgId} />
      <div className="grid grid-cols-[1.4fr_1fr_0.7fr] gap-2">
        <input name="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Ажилтны нэр" className="field py-2.5 text-sm" />
        <input name="phone" inputMode="numeric" maxLength={8} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value.replace(/\D/g, "") })} placeholder="Утас" className="field py-2.5 text-sm" />
        <input name="pin" inputMode="numeric" maxLength={4} value={v.pin} onChange={(e) => setV({ ...v, pin: e.target.value.replace(/\D/g, "") })} placeholder="Код" className="field py-2.5 text-sm" />
      </div>
      <Msg state={state} />
      <button className="rounded-xl border-2 border-line bg-white py-2 text-sm font-extrabold" disabled={pending}>
        {pending ? "…" : "+ Ажилтанд эрх нээх"}
      </button>
    </form>
  );
}
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
      {state?.error && <p className="text-sm font-bold text-danger">{state.error}</p>}
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
      className="grid grid-cols-1 gap-3 rounded-xl border-2 border-danger bg-danger-soft p-5"
    >
      <input type="hidden" name="userId" value={userId} />
      <p className="text-sm font-bold text-danger">
        «{name}»-ийн анкет, бичиг баримт, оноо, түүх бүгд бүрмөсөн устна. Буцаах боломжгүй.
      </p>
      <input name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="УСТГАХ гэж бичнэ үү" className="field" />
      {state?.error && <p className="text-sm font-bold text-danger">{state.error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
          Болих
        </button>
        <button className="btn bg-danger text-white" disabled={pending || confirm !== "УСТГАХ"}>
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
