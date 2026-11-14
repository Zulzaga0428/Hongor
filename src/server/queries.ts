import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { lessonsFor, type LevelId } from "@/content/lessons";
import { getDb, schema } from "@/server/db";
import type { User } from "@/server/db/schema";

export async function progressOf(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId));
  return new Map(rows.map((r) => [r.lessonId, r]));
}

export async function assignmentsFor(user: User) {
  const db = await getDb();
  const list = await db
    .select()
    .from(schema.assignments)
    .where(eq(schema.assignments.level, user.level))
    .orderBy(schema.assignments.dueAt);
  const subs = await db.select().from(schema.submissions).where(eq(schema.submissions.userId, user.id));
  const byA = new Map(subs.map((s) => [s.assignmentId, s]));
  return list.map((a) => ({ ...a, submission: byA.get(a.id) ?? null }));
}

export async function levelStats(user: User) {
  const lessons = lessonsFor(user.level as LevelId);
  const prog = await progressOf(user.id);
  const done = lessons.filter((l) => prog.has(l.id)).length;
  return { lessons, prog, done, total: lessons.length, pct: lessons.length ? (done / lessons.length) * 100 : 0 };
}

export async function pendingSubmissions() {
  const db = await getDb();
  return db
    .select({
      id: schema.submissions.id,
      submittedAt: schema.submissions.submittedAt,
      studentName: schema.users.name,
      level: schema.assignments.level,
      title: schema.assignments.title,
    })
    .from(schema.submissions)
    .innerJoin(schema.users, eq(schema.users.id, schema.submissions.userId))
    .innerJoin(schema.assignments, eq(schema.assignments.id, schema.submissions.assignmentId))
    .where(isNull(schema.submissions.gradedAt))
    .orderBy(schema.submissions.submittedAt);
}

export async function allStudents() {
  const db = await getDb();
  const students = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.role, "student"))
    .orderBy(desc(schema.users.createdAt));
  const prog = await db.select().from(schema.lessonProgress);
  const by = new Map<string, typeof prog>();
  for (const p of prog) by.set(p.userId, [...(by.get(p.userId) ?? []), p]);
  return students.map((s) => {
    const ps = by.get(s.id) ?? [];
    const lessons = lessonsFor(s.level as LevelId);
    const mine = ps.filter((p) => lessons.some((l) => l.id === p.lessonId));
    const avg = mine.length ? Math.round((mine.reduce((a, p) => a + p.score / p.total, 0) / mine.length) * 100) : null;
    return { ...s, done: mine.length, total: lessons.length, avg };
  });
}

export async function submissionDetail(id: string) {
  const db = await getDb();
  const [row] = await db
    .select({
      sub: schema.submissions,
      student: { name: schema.users.name, phone: schema.users.phone, level: schema.users.level },
      asg: schema.assignments,
    })
    .from(schema.submissions)
    .innerJoin(schema.users, eq(schema.users.id, schema.submissions.userId))
    .innerJoin(schema.assignments, eq(schema.assignments.id, schema.submissions.assignmentId))
    .where(eq(schema.submissions.id, id))
    .limit(1);
  return row ?? null;
}

export async function assignmentWithSubmission(user: User, id: string) {
  const db = await getDb();
  const [a] = await db
    .select()
    .from(schema.assignments)
    .where(and(eq(schema.assignments.id, id), eq(schema.assignments.level, user.level)))
    .limit(1);
  if (!a) return null;
  const [s] = await db
    .select()
    .from(schema.submissions)
    .where(and(eq(schema.submissions.assignmentId, id), eq(schema.submissions.userId, user.id)))
    .limit(1);
  return { ...a, submission: s ?? null };
}
