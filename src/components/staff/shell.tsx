import { pendingDocCount } from "@/server/applicant";
import type { Staff } from "@/server/auth";
import type { User } from "@/server/db/schema";
import { assignmentsFor } from "@/server/queries";
import { LEVELS, type LevelId } from "@/content/lessons";
import { StaffChrome } from "./chrome";

/**
 * Ажилтны хэсэгт улаан/ягаан (сурагчийн япон загвар) өнгийг брэндийн далайн
 * ногоон руу CSS хувьсагчаар дарна — доторх хуудсуудыг нэг бүрчлэн засахгүй.
 */
const STAFF_THEME = {
  "--red": "#0f8a7e",
  "--red-deep": "#0a675e",
  "--pink": "#e5f4f1",
  "--sakura": "#9fd8cf",
  "--bg": "#f4f6f7",
  "--line": "#e3e8eb",
  "--ink": "#1d2a31",
  "--muted": "#6a7a84",
} as React.CSSProperties;

/** Сурагчийн хүрээ — ажилтны самбартай нэг загвар, утсан дээр доод цэстэй. */
export async function StudentShell({ user, children }: { user: User; children: React.ReactNode }) {
  const todo = (await assignmentsFor(user)).filter((a) => !a.submission).length;
  const lvl = LEVELS[user.level as LevelId];
  return (
    <div style={STAFF_THEME}>
      <StaffChrome base="/home" userName={user.name} orgName={lvl ? `${lvl.name} · ${lvl.jlpt}` : "Сурагч"} pendingDocs={todo}>
        {children}
      </StaffChrome>
    </div>
  );
}

export async function StaffShell({ staff, children }: { staff: Staff; children: React.ReactNode }) {
  const pending = await pendingDocCount(staff.org?.id ?? null);
  return (
    <div style={STAFF_THEME}>
      {/* Suspense-гүй: хүүхэд хуудасны notFound() жинхэнэ 404 буцаах ёстой */}
      <StaffChrome base={staff.base} userName={staff.user.name} orgName={staff.org?.name ?? null} pendingDocs={pending}>
        {children}
      </StaffChrome>
    </div>
  );
}
