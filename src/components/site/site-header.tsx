"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND, COUNTRIES, COUNTRY_ORDER } from "@/content/site";

/**
 * Дээд цэс. `overHero` үед эхлээд тунгалаг (цагаан бичиг), гүйлгэхэд цагаан
 * дэвсгэртэй болно. Утсан дээр ☰ цэс.
 */
export function SiteHeader({ overHero = false, home }: { overHero?: boolean; home?: string | null }) {
  const [scrolled, setScrolled] = useState(!overHero);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [overHero]);

  const solid = scrolled || open;
  const links = [...COUNTRY_ORDER.map((s) => ({ href: `/${s}`, label: COUNTRIES[s].name })), { href: "/#surgalt", label: "Сургалт" }, { href: "/#bidnii-tuhai", label: "Бидний тухай" }];

  return (
    <header className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${solid ? "bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur" : "bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 lg:h-20 lg:px-10">
        <Link href="/" className={`flex items-center gap-2.5 font-extrabold ${solid ? "text-ink" : "text-white"}`} onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg text-white">{BRAND.name.slice(0, 1)}</span>
          <span className="text-lg">{BRAND.name}</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`rounded-full px-4 py-2 text-sm font-bold transition ${solid ? "text-ink/80 hover:bg-bg" : "text-white/90 hover:bg-white/10"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          {home ? (
            <Link href={home} className="rounded-full bg-brand px-5 py-2.5 text-sm font-extrabold text-white">
              Миний самбар
            </Link>
          ) : (
            <>
              <Link href="/nevtreh" className={`hidden rounded-full px-4 py-2.5 text-sm font-bold sm:block ${solid ? "text-ink" : "text-white"}`}>
                Нэвтрэх
              </Link>
              <Link href="/burtgel" className="rounded-full bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_3px_0_var(--brand-deep)]">
                Бүртгүүлэх
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Цэс"
            aria-expanded={open}
            className={`flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${solid ? "text-ink" : "text-white"}`}
          >
            <span className="text-2xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-white px-5 pb-5 pt-2 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-3.5 font-bold text-ink">
              {l.label}
            </Link>
          ))}
          {!home && (
            <Link href="/nevtreh" onClick={() => setOpen(false)} className="block py-3.5 font-bold text-brand">
              Нэвтрэх
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
