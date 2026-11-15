"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Building2,
  Download,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/actions";
import { BRAND } from "@/content/site";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; external?: boolean };

/**
 * Ажилтны (платформын эзэн / байгууллага) самбарын хүрээ — EduTrack маягийн:
 * цагаан хажуугийн цэс + брэндийн өнгөт толгой, дээд мөрөнд хайлт, мэдэгдэл, хэрэглэгч.
 * Утсан дээр цэс зүүнээс гулсаж гарна.
 */
export function StaffChrome({
  base,
  userName,
  orgName,
  pendingDocs,
  children,
}: {
  base: "/admin" | "/org";
  userName: string;
  orgName: string | null;
  pendingDocs: number;
  children: React.ReactNode;
}) {
  const path = usePathname();
  // useSearchParams-ийг ЗОРИУДААР ашиглахгүй: Suspense шаарддаг тул хуудас урсгалаар
  // явж, notFound() 404 биш 200 буцаадаг болдог (бусад байгууллагын хүний URL).
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const items: Item[] = [
    { href: base, label: "Самбар", icon: LayoutDashboard },
    { href: `${base}/hmuus`, label: "Хүмүүс", icon: Users },
    { href: `${base}/hmuus?f=docs`, label: "Шалгах баримт", icon: FileCheck2, badge: pendingDocs },
    ...(base === "/admin"
      ? [
          { href: "/admin/baiguullaga", label: "Байгууллагууд", icon: Building2 },
          { href: "/bagsh", label: "Хэлний сургалт", icon: GraduationCap },
        ]
      : []),
    { href: "/api/export", label: "Excel татах", icon: Download, external: true },
    { href: `${base}/profil`, label: "Профайл", icon: UserCircle },
  ];

  const isActive = (href: string) => {
    const [p, qs] = href.split("?");
    if (qs) return false; // шүүлттэй холбоос — «Хүмүүс» идэвхтэй харагдана
    if (p === base) return path === base;
    return path === p || path.startsWith(p + "/");
  };

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="grid grid-cols-1 gap-1">
        {items.map((it) => {
          const on = isActive(it.href);
          const Icon = it.icon;
          const cls = `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition ${
            on ? "bg-brand-soft font-bold text-brand" : "text-ink/75 hover:bg-[#f2f5f6] hover:text-ink"
          }`;
          const inner = (
            <>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${on ? "bg-brand text-white" : "text-ink/60 group-hover:text-ink"}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1">{it.label}</span>
              {!!it.badge && <span className="rounded-full bg-[#e5484d] px-2 py-0.5 text-[11px] font-bold text-white">{it.badge}</span>}
            </>
          );
          return (
            <li key={it.href}>
              {it.external ? (
                <a href={it.href} className={cls}>
                  {inner}
                </a>
              ) : (
                <Link href={it.href} className={cls} onClick={() => setOpen(false)}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const brandHead = (
    <div className="flex h-16 shrink-0 items-center gap-3 bg-brand px-5 text-white">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg font-extrabold">{BRAND.name.slice(0, 1)}</span>
      <span className="text-lg font-extrabold">{BRAND.name}</span>
      <button type="button" className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Хаах">
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  const foot = (
    <form action={logout} className="border-t border-line p-3">
      <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-ink/70 hover:bg-[#f2f5f6]">
        <span className="flex h-9 w-9 items-center justify-center">
          <LogOut className="h-[18px] w-[18px]" />
        </span>
        Гарах
      </button>
    </form>
  );

  return (
    <div className="min-h-dvh bg-[#f4f6f7] text-ink">
      {/* Компьютер: байнгын цэс */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        {brandHead}
        {nav}
        {foot}
      </aside>

      {/* Утас: гулсдаг цэс */}
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        {brandHead}
        {nav}
        {foot}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white lg:hidden" aria-label="Цэс">
            <Menu className="h-5 w-5" />
          </button>
          <form
            className="relative hidden max-w-sm flex-1 sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`${base}/hmuus?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Нэр, утсаар хайх…"
              className="w-full rounded-lg border border-line bg-white py-2 pl-3 pr-10 text-sm outline-none focus:border-brand"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <Link href={`${base}/hmuus?f=docs`} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f5f6] text-ink/70" aria-label="Шалгах баримт">
              <Bell className="h-5 w-5" />
              {pendingDocs > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e5484d] px-1 text-[11px] font-bold text-white">
                  {pendingDocs}
                </span>
              )}
            </Link>
            <div className="hidden h-8 w-px bg-line sm:block" />
            <Link href={`${base}/profil`} className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">{userName.slice(0, 1)}</span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-bold">{userName}</span>
                <span className="block text-xs text-muted">{orgName ?? "Платформын удирдлага"}</span>
              </span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
