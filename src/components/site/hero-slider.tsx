"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COUNTRIES, COUNTRY_ORDER } from "@/content/site";
import { CountryArt } from "./country-art";

const INTERVAL = 6000;

/** Бүтэн дэлгэцийн hero — 3 улс ээлжлэн, зөөлөн солигдоно. */
export function HeroSlider() {
  const slides = COUNTRY_ORDER.map((s) => COUNTRIES[s]);
  const [i, setI] = useState(1); // Япон эхэнд — сургалт нь бэлэн
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <section
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((c, k) => (
        <div
          key={c.slug}
          className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? "opacity-100" : "opacity-0"}`}
          aria-hidden={k !== i}
        >
          <CountryArt c={c} priority={k === 1} />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-5 pb-28 lg:px-10 lg:pb-40">
            <p className="text-sm font-bold tracking-wide text-white/80 lg:text-base">
              {c.hello} · {c.city}
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-[1.1] lg:text-6xl">{c.heroTitle}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 lg:text-lg">{c.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/burtgel" tabIndex={k === i ? 0 : -1} className="rounded-full bg-white px-6 py-3.5 font-extrabold shadow-lg transition hover:scale-[1.02]" style={{ color: c.primary }}>
                Бүртгүүлэх
              </Link>
              <Link href={`/${c.slug}`} tabIndex={k === i ? 0 : -1} className="rounded-full border-2 border-white/70 px-6 py-3.5 font-extrabold text-white transition hover:bg-white/10">
                {c.name} хөтөлбөр →
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-36 z-10 mx-auto flex max-w-6xl gap-2 px-5 lg:bottom-48 lg:px-10">
        {slides.map((c, k) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setI(k)}
            aria-label={`${c.name} харах`}
            aria-current={k === i}
            className={`h-1.5 rounded-full transition-all ${k === i ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
}
