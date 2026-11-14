"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

const STUDENT: Item[] = [
  { href: "/home", label: "Нүүр", icon: "家" },
  { href: "/hicheel", label: "Хичээл", icon: "学" },
  { href: "/daalgavar", label: "Даалгавар", icon: "書" },
  { href: "/material", label: "Материал", icon: "履" },
  { href: "/profil", label: "Би", icon: "私" },
];

const ADMIN: Item[] = [
  { href: "/admin", label: "Самбар", icon: "家" },
  { href: "/admin/hmuus", label: "Хүмүүс", icon: "人" },
  { href: "/bagsh", label: "Сургалт", icon: "学" },
  { href: "/admin/profil", label: "Би", icon: "私" },
];

const TEACHER: Item[] = [
  { href: "/bagsh", label: "Самбар", icon: "家" },
  { href: "/bagsh/suragchid", label: "Сурагчид", icon: "人" },
  { href: "/bagsh/daalgavar", label: "Даалгавар", icon: "書" },
  { href: "/bagsh/profil", label: "Би", icon: "私" },
];

export function BottomNav({ role = "student" }: { role?: "student" | "teacher" | "admin" }) {
  const path = usePathname();
  const items = role === "admin" ? ADMIN : role === "teacher" ? TEACHER : STUDENT;
  const active = (href: string) => {
    if (href === "/bagsh") return path === "/bagsh" || path.startsWith("/bagsh/shalgah") || (role === "admin" && path.startsWith("/bagsh"));
    if (href === "/admin") return path === "/admin";
    return path === href || path.startsWith(href + "/");
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className={`mx-auto grid max-w-md ${items.length === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
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
