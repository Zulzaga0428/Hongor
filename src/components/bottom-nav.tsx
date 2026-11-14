"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

const STUDENT: Item[] = [
  { href: "/home", label: "Нүүр", icon: "家" },
  { href: "/hicheel", label: "Хичээл", icon: "学" },
  { href: "/daalgavar", label: "Даалгавар", icon: "書" },
  { href: "/profil", label: "Би", icon: "私" },
];

const TEACHER: Item[] = [
  { href: "/bagsh", label: "Самбар", icon: "家" },
  { href: "/bagsh/suragchid", label: "Сурагчид", icon: "人" },
  { href: "/bagsh/daalgavar", label: "Даалгавар", icon: "書" },
  { href: "/bagsh/profil", label: "Би", icon: "私" },
];

export function BottomNav({ teacher = false }: { teacher?: boolean }) {
  const path = usePathname();
  const items = teacher ? TEACHER : STUDENT;
  const active = (href: string) =>
    href === "/bagsh" ? path === "/bagsh" || path.startsWith("/bagsh/shalgah") : path === href || path.startsWith(href + "/");
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map((it) => {
          const on = active(it.href);
          return (
            <li key={it.href}>
              <Link href={it.href} className="flex flex-col items-center gap-0.5 py-2.5">
                <span
                  className={`jp flex h-8 w-8 items-center justify-center rounded-full text-base font-extrabold transition ${
                    on ? "bg-red text-white" : "text-muted"
                  }`}
                >
                  {it.icon}
                </span>
                <span className={`text-[11px] font-bold ${on ? "text-red" : "text-muted"}`}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
