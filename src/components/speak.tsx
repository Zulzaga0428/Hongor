"use client";

/** Утасны өөрийнх нь япон дуу хоолойгоор уншина — сервер, төлбөр хэрэггүй. */
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const clean = text.split("→").pop()!.replace(/（.*?）|\(.*?\)/g, "").trim();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "ja-JP";
  u.rate = 0.85;
  const ja = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ja"));
  if (ja) u.voice = ja;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function KanaCell({ kana, romaji }: { kana: string; romaji: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(kana)}
      className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-line bg-white transition active:scale-95 active:bg-pink"
    >
      <span className="jp text-2xl font-extrabold leading-none">{kana}</span>
      <span className="mt-1 text-[11px] font-bold text-muted">{romaji}</span>
    </button>
  );
}

export function SpeakButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label="Сонсох"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink text-red transition active:scale-90"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
      </svg>
    </button>
  );
}
