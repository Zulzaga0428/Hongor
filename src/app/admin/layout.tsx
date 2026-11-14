import { BottomNav } from "@/components/bottom-nav";
import { Page } from "@/components/ui";
import { requireAdmin } from "@/server/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <Page nav={<BottomNav role="admin" />}>{children}</Page>;
}
