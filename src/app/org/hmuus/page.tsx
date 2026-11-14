import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth";
import { StaffPeople } from "@/components/staff/people";

export default async function OrgPeople({ searchParams }: PageProps<"/org/hmuus">) {
  const s = await requireStaff();
  if (!s.org) redirect("/admin/hmuus");
  return <StaffPeople staff={s} searchParams={searchParams} />;
}
