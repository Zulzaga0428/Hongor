import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth";
import { StaffAddPerson } from "@/components/staff/add-person";

export default async function OrgAddPerson() {
  const s = await requireStaff();
  if (!s.org) redirect("/admin/hmuus/shine");
  return <StaffAddPerson staff={s} />;
}
