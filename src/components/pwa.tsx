"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

/** Service worker-ийг зөвхөн прод дээр бүртгэнэ (dev-д кэш саад болдог). */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// beforeinstallprompt нь хуудас ачаалагдах үед НЭГ л удаа ирдэг — компонент
// хожим mount болсон ч алдахгүйн тулд модулийн түвшинд барина.
let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

type Mode = "installed" | "prompt" | "ios" | "none";

function detect(): Mode {
  if (typeof window === "undefined") return "none";
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  if (deferred) return "prompt";
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
  // iOS дээр зөвхөн Safari-гаар суулгана
  if (ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) return "ios";
  return "none";
}

const DISMISS_KEY = "garts-install-dismissed";

/**
 * «Апп болгож суулгах». variant="banner" — нүүрэнд (хаах боломжтой),
 * "card" — профайлд (үргэлж). Суулгасан бол юу ч харуулахгүй.
 */
export function InstallApp({ variant = "card" }: { variant?: "banner" | "card" }) {
  const mode = useSyncExternalStore(subscribe, detect, () => "none" as Mode);
  const [iosHelp, setIosHelp] = useState(false);
  const [hidden, setHidden] = useState(() => {
    if (variant !== "banner" || typeof window === "undefined") return false;
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (mode === "installed" || mode === "none" || hidden) return null;

  const install = async () => {
    if (mode === "ios") return setIosHelp(true);
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    listeners.forEach((l) => l());
  };
  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div className={`rounded-xl border border-brand/30 bg-brand-soft p-4 ${variant === "banner" ? "mb-6" : ""}`} data-testid="install-app">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">Утсандаа апп болгож суулгах</div>
          <div className="text-xs text-muted">Нүүр дэлгэцээс нэг товшилтоор, бүтэн дэлгэцээр нээгдэнэ.</div>
        </div>
        <button type="button" onClick={install} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-bold text-white">
          <Download className="h-4 w-4" /> Суулгах
        </button>
        {variant === "banner" && (
          <button type="button" onClick={dismiss} aria-label="Хаах" className="shrink-0 text-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {iosHelp && (
        <ol className="mt-3 grid gap-2 rounded-lg bg-white p-3 text-sm">
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">1</span>
            Доод талын <Share className="h-4 w-4 text-[#2563eb]" /> <b>Хуваалцах</b> товчийг дар
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">2</span>
            <SquarePlus className="h-4 w-4" /> <b>Нүүр дэлгэцэд нэмэх</b> (Add to Home Screen)
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">3</span>
            Баруун дээд буланд <b>Нэмэх</b> гэж дар
          </li>
        </ol>
      )}
    </div>
  );
}
