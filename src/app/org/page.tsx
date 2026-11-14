import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth";
import { StaffDashboard } from "@/components/staff/dashboard";

export default async function OrgHome() {
  const s = await requireStaff();
  if (!s.org) redirect("/admin");
  return <StaffDashboard staff={s} />;
}
