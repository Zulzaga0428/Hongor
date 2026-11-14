import { logout } from "@/app/actions";
import { requireStaff } from "@/server/auth";
import { Hinomaru } from "@/components/ui";

export default async function OrgProfile() {
  const s = await requireStaff();
  return (
    <div className="lg:max-w-3xl">
      <div className="flex items-center gap-4">
        <Hinomaru size={64}>{s.user.name.slice(0, 1)}</Hinomaru>
        <div>
          <h1 className="text-2xl font-extrabold">{s.user.name}</h1>
          <p className="text-sm text-muted">
            {s.org?.name ?? "Платформ"} · +976 {s.user.phone}
          </p>
        </div>
      </div>
      <section className="card mt-7 p-5 text-sm leading-relaxed text-muted">
        Та зөвхөн <b className="text-ink">{s.org?.name}</b>-д оноогдсон хүмүүсийн мэдээллийг харна. Хувийн мэдээллийг зөвхөн ажилд зуучлах
        зорилгоор ашиглана.
      </section>
      <a href="/api/export" className="card mt-3 block p-4 font-bold">
        ⬇ Манай хүмүүсийг Excel-ээр татах
      </a>
      <form action={logout} className="mt-8">
        <button className="btn btn-ghost">Гарах</button>
      </form>
    </div>
  );
}
