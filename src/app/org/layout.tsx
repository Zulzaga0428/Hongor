import { BottomNav } from "@/components/bottom-nav";
import { Page } from "@/components/ui";
import { requireStaff } from "@/server/auth";

/** Хамтрагч байгууллагын самбар — зөвхөн role=org. */
export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const s = await requireStaff();
  return <Page nav={<BottomNav role={s.org ? "org" : "admin"} />}>{children}</Page>;
}
