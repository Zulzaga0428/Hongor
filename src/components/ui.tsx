import Link from "next/link";
import type { ReactNode } from "react";

export function Hinomaru({ size = 56, children }: { size?: number; children?: ReactNode }) {
  return (
    <div
      className="jp flex items-center justify-center rounded-full bg-red font-extrabold text-white shadow-[0_6px_0_var(--red-deep)]"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {children ?? "日"}
    </div>
  );
}

/**
 * Утас: нэг багана (max-w-md) + доод цэс.
 * Компьютер (lg+): зүүн талд цэс, контент max-w-5xl. Цэсгүй (нэвтрэх г.м.)
 * хуудас компьютер дээр төвд карт болж харагдана.
 */
export function Page({ children, nav }: { children: ReactNode; nav?: ReactNode }) {
  if (!nav)
    return (
      <div className="flex min-h-dvh w-full items-start justify-center lg:items-center lg:py-12">
        <main className="w-full max-w-md px-4 pb-10 pt-5 lg:rounded-[2rem] lg:border lg:border-line lg:bg-white lg:px-10 lg:py-10 lg:shadow-[0_8px_40px_rgba(168,27,47,0.08)]">
          {children}
        </main>
      </div>
    );
  return (
    <div className="min-h-dvh w-full lg:pl-64">
      {nav}
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-5 lg:max-w-5xl lg:px-10 lg:pb-16 lg:pt-10">{children}</main>
    </div>
  );
}

/** Компьютер дээр хоёр багана — утсан дээр нэг. */
export const listGrid = "grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4";

export function Back({ href, label = "Буцах" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted">
      <span aria-hidden>‹</span> {label}
    </Link>
  );
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-pink" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-red transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Ring({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const c = 2 * Math.PI * 30;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r="30" fill="none" stroke="var(--pink)" strokeWidth="9" />
        <circle cx="36" cy="36" r="30" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-lg font-extrabold leading-none">{Math.round(v)}%</span>
        {label && <span className="text-[10px] opacity-90">{label}</span>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "pink" }: { children: ReactNode; tone?: "pink" | "green" | "gold" | "gray" }) {
  const cls = {
    pink: "bg-pink text-red-deep",
    green: "bg-[#dff5ea] text-green",
    gold: "bg-[#fdf0dc] text-[#a86a12]",
    gray: "bg-[#f3eeee] text-muted",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{children}</span>;
}

export function formatDate(d: Date | null) {
  if (!d) return "";
  const p = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Ulaanbaatar", month: "numeric", day: "numeric" }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value;
  return `${get("month")}-р сарын ${get("day")}`;
}
