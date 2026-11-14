import { BottomNav } from "@/components/bottom-nav";
import { Page } from "@/components/ui";
import { requireStudent } from "@/server/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireStudent();
  return <Page nav={<BottomNav />}>{children}</Page>;
}
