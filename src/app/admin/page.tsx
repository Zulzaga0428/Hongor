import { requireAdmin } from "@/server/auth";
import { StaffDashboard } from "@/components/staff/dashboard";

export default async function AdminHome() {
  const u = await requireAdmin();
  return <StaffDashboard staff={{ user: u, org: null, base: "/admin" }} />;
}
