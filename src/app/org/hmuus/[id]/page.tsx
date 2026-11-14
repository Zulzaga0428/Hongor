import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth";
import { StaffPerson } from "@/components/staff/person";

export default async function OrgPerson({ params }: PageProps<"/org/hmuus/[id]">) {
  const s = await requireStaff();
  const { id } = await params;
  if (!s.org) redirect(`/admin/hmuus/${id}`);
  return <StaffPerson staff={s} id={id} />;
}
