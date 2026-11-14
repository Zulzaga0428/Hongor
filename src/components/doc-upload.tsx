"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/**
 * Утасны зураг 4–8MB байдаг. Илгээхээс өмнө 1800px болгож JPEG-ээр шахна —
 * баримт уншигдахуйц хэвээр, ~300KB болно. PDF-г тэр чигээр нь.
 */
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // HEIC г.м. уншиж чадахгүй бол сервер шийднэ
  }
}

export function DocUpload({ kind, label = "Хуулах" }: { kind: string; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setErr(null);
    setBusy(true);
    try {
      const blob = await shrink(f);
      const name = blob === f ? f.name : f.name.replace(/\.[^.]+$/, "") + ".jpg";
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("file", blob, name);
      const res = await fetch("/api/barimt", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setErr(j.error ?? "Хуулж чадсангүй. Дахин оролдоно уу.");
      else router.refresh();
    } catch {
      setErr("Интернэт тасарсан байж магадгүй. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="grid gap-1.5">
      <input ref={input} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="rounded-full bg-red px-4 py-2 text-sm font-extrabold text-white shadow-[0_3px_0_var(--red-deep)] active:translate-y-0.5 disabled:opacity-60"
      >
        {busy ? "Хуулж байна…" : label}
      </button>
      {err && <p className="text-xs font-bold text-red">{err}</p>}
    </div>
  );
}
