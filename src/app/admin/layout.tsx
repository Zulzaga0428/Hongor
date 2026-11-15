import { requireAdmin } from "@/server/auth";
import { StaffShell } from "@/components/staff/shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await requireAdmin();
  return <StaffShell staff={{ user: u, org: null, base: "/admin" }}>{children}</StaffShell>;
}
