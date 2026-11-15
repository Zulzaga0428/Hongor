import Link from "next/link";
import { eq } from "drizzle-orm";
import { removeOrgStaff, toggleOrg } from "@/app/material-actions";
import { COUNTRIES, type CountrySlug } from "@/content/site";
import { listApplicants, listOrgs } from "@/server/applicant";
import { requireAdmin } from "@/server/auth";
import { getDb, schema } from "@/server/db";
import { Badge } from "@/components/ui";
import { CreateOrgForm, CreateStaffForm, ResetPin } from "@/components/admin-forms";

export default async function Orgs() {
  await requireAdmin();
  const db = await getDb();
  const [orgs, staff, people] = await Promise.all([
    listOrgs(),
    db.select({ id: schema.users.id, name: schema.users.name, phone: schema.users.phone, orgId: schema.users.orgId }).from(schema.users).where(eq(schema.users.role, "org")),
    listApplicants(),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold lg:text-[28px]">Хамтрагч байгууллагууд</h1>
      <p className="mt-1 text-sm text-muted">Байгууллага бүр өөрийн самбартай. Зөвхөн өөрт нь оноосон хүмүүсийг харна.</p>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
        <ul className="grid grid-cols-1 gap-4 lg:order-1">
          {orgs.length === 0 && <li className="rounded-xl bg-white p-8 text-center text-sm text-muted">Одоохондоо байгууллага алга. Эхнийхээ нэмээрэй →</li>}
          {orgs.map((o) => {
            const mine = staff.filter((s) => s.orgId === o.id);
            const n = people.filter((p) => p.a?.orgId === o.id).length;
            return (
              <li key={o.id} className={`rounded-xl border-t-[3px] border-brand bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ${o.active ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">{o.name}</h2>
                    <p className="text-xs text-muted">
                      {[o.contactName, o.phone].filter(Boolean).join(" · ") || "Холбоо барих мэдээлэлгүй"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {o.countries
                        .split(",")
                        .filter(Boolean)
                        .map((c) => (
                          <Badge key={c} tone="gray">
                            {COUNTRIES[c as CountrySlug]?.name ?? c}
                          </Badge>
                        ))}
                      {!o.active && <Badge tone="pink">Хаагдсан</Badge>}
                    </div>
                  </div>
                  <Link href={`/admin/hmuus?org=${o.id}`} className="rounded-2xl bg-brand-soft px-4 py-2 text-center">
                    <div className="text-xl font-extrabold text-brand">{n}</div>
                    <div className="text-[11px] font-bold text-brand">хүн</div>
                  </Link>
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <div className="mb-2 text-xs font-bold text-muted">Ажилтнууд ({mine.length})</div>
                  <ul className="mb-3 grid grid-cols-1 gap-1.5">
                    {mine.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-bg px-3 py-2 text-sm">
                        <span>
                          <b>{s.name}</b> <span className="text-muted">{s.phone}</span>
                        </span>
                        <span className="flex flex-wrap items-center justify-end gap-3">
                          <ResetPin userId={s.id} phone={s.phone} compact />
                          <form action={removeOrgStaff}>
                            <input type="hidden" name="id" value={s.id} />
                            <button className="text-xs font-bold text-muted underline">Эрх хаах</button>
                          </form>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {o.active ? <CreateStaffForm orgId={o.id} /> : null}
                  <form action={toggleOrg} className="mt-3 text-right">
                    <input type="hidden" name="id" value={o.id} />
                    <button className="text-xs font-bold text-muted underline">{o.active ? "Байгууллагыг түр хаах" : "Дахин нээх"}</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>

        <section className="mt-6 rounded-xl border-t-[3px] border-brand bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] lg:sticky lg:top-10 lg:order-2 lg:mt-0">
          <h2 className="mb-3 font-extrabold">+ Шинэ байгууллага</h2>
          <CreateOrgForm />
        </section>
      </div>
    </>
  );
}
