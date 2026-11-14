import { requireAdmin } from "@/server/auth";
import { StaffPeople } from "@/components/staff/people";

export default async function AdminPeople({ searchParams }: PageProps<"/admin/hmuus">) {
  const u = await requireAdmin();
  return <StaffPeople staff={{ user: u, org: null, base: "/admin" }} searchParams={searchParams} />;
}
