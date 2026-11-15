import { listOrgs } from "@/server/applicant";
import type { Staff } from "@/server/auth";
import { AddPersonForm } from "./add-person-form";

export async function StaffAddPerson({ staff }: { staff: Staff }) {
  const orgs = staff.org ? [] : (await listOrgs()).filter((o) => o.active).map((o) => ({ id: o.id, name: o.name }));
  return (
    <>
      <h1 className="text-2xl font-bold lg:text-[28px]">Хүн нэмэх</h1>
      <p className="mt-1 text-sm text-muted">Оффис дээр ирсэн хүнийг бүртгэнэ. Нэвтрэх кодыг систем үүсгэж, танд нэг удаа харуулна.</p>
      <AddPersonForm base={staff.base} orgs={orgs} orgName={staff.org?.name ?? null} />
    </>
  );
}
