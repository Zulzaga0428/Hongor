import { BottomNav } from "@/components/bottom-nav";
import { Page } from "@/components/ui";
import { requireTeacher } from "@/server/auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const u = await requireTeacher();
  return <Page nav={<BottomNav role={u.role === "admin" ? "admin" : "teacher"} />}>{children}</Page>;
}
