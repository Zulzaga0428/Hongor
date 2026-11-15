import { requireStudent } from "@/server/auth";
import { StudentShell } from "@/components/staff/shell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const u = await requireStudent();
  return <StudentShell user={u}>{children}</StudentShell>;
}
