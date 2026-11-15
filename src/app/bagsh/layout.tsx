import { requireTeacher } from "@/server/auth";
import { StaffShell, TeacherShell } from "@/components/staff/shell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const u = await requireTeacher();
  // Платформын эзэн хэлний сургалтыг өөрийн самбарын хүрээн дотроос удирдана.
  if (u.role === "admin") return <StaffShell staff={{ user: u, org: null, base: "/admin" }}>{children}</StaffShell>;
  return <TeacherShell user={u}>{children}</TeacherShell>;
}
