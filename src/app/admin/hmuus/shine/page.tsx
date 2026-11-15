import { requireAdmin } from "@/server/auth";
import { StaffAddPerson } from "@/components/staff/add-person";

export default async function AdminAddPerson() {
  const u = await requireAdmin();
  return <StaffAddPerson staff={{ user: u, org: null, base: "/admin" }} />;
}
