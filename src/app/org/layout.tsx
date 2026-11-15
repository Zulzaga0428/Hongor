import { requireStaff } from "@/server/auth";
import { StaffShell } from "@/components/staff/shell";

/** Хамтрагч байгууллагын самбар. */
export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const s = await requireStaff();
  return <StaffShell staff={s}>{children}</StaffShell>;
}
