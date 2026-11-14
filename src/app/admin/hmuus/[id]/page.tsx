import { requireAdmin } from "@/server/auth";
import { StaffPerson } from "@/components/staff/person";

export default async function AdminPerson({ params }: PageProps<"/admin/hmuus/[id]">) {
  const u = await requireAdmin();
  const { id } = await params;
  return <StaffPerson staff={{ user: u, org: null, base: "/admin" }} id={id} />;
}
