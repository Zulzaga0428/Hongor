import { BottomNav } from "@/components/bottom-nav";
import { Page } from "@/components/ui";
import { requireTeacher } from "@/server/auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireTeacher();
  return <Page nav={<BottomNav teacher />}>{children}</Page>;
}
