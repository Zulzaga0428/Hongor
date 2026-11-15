import Link from "next/link";
import { logout } from "@/app/actions";
import { requireAdmin } from "@/server/auth";
import { Hinomaru } from "@/components/ui";
import { InstallApp } from "@/components/pwa";

export default async function AdminProfile() {
  const me = await requireAdmin();
  return (
    <>
      <div className="flex items-center gap-4">
        <Hinomaru size={64}>{me.name.slice(0, 1)}</Hinomaru>
        <div>
          <h1 className="text-2xl font-extrabold">{me.name}</h1>
          <p className="text-sm text-muted">Удирдлага · +976 {me.phone}</p>
        </div>
      </div>
      <section className="mt-7 grid grid-cols-1 gap-3">
        <Link href="/bagsh/suragchid" className="card p-4 font-bold">
          学 Сургалтын сурагчид
        </Link>
        <Link href="/bagsh/daalgavar" className="card p-4 font-bold">
          書 Даалгавар өгөх
        </Link>
        <a href="/api/export" className="card p-4 font-bold">
          ⬇ Бүх хүнийг Excel-ээр татах
        </a>
      </section>
      <div className="mt-7">
        <InstallApp />
      </div>
      <form action={logout} className="mt-8">
        <button className="btn btn-ghost">Гарах</button>
      </form>
    </>
  );
}
