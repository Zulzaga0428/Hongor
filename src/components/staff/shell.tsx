import { BRAND_THEME } from "@/components/theme";
import { pendingDocCount } from "@/server/applicant";
import type { Staff } from "@/server/auth";
import type { User } from "@/server/db/schema";
import { assignmentsFor, pendingSubmissions } from "@/server/queries";
import { LEVELS, type LevelId } from "@/content/lessons";
import { StaffChrome } from "./chrome";

const STAFF_THEME = BRAND_THEME;

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

/** Хэлний багшийн хүрээ. Хонх = шалгах даалгавар. */
export async function TeacherShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pending = (await pendingSubmissions()).length;
  return (
    <div style={STAFF_THEME}>
      <StaffChrome base="/bagsh" userName={user.name} orgName="Хэлний багш" pendingDocs={pending}>
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
