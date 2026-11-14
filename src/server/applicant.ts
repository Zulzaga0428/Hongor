import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { DOC_KINDS } from "@/content/programs";
import { getDb, schema } from "@/server/db";
import type { Applicant } from "@/server/db/schema";

/** Анкет байхгүй бол үүсгэнэ — хуучин бүртгэлтэй сурагчдад ч ажиллана. */
export async function getApplicant(userId: string): Promise<Applicant> {
  const db = await getDb();
  const [a] = await db.select().from(schema.applicants).where(eq(schema.applicants.userId, userId)).limit(1);
  if (a) return a;
  await db.insert(schema.applicants).values({ userId }).onConflictDoNothing();
  const [b] = await db.select().from(schema.applicants).where(eq(schema.applicants.userId, userId)).limit(1);
  return b;
}

/** Файлын агуулгагүйгээр — жагсаалтад бүтэн зураг татахгүй. */
export async function docsOf(userId: string) {
  const db = await getDb();
  return db
    .select({
      id: schema.documents.id,
      kind: schema.documents.kind,
      filename: schema.documents.filename,
      mime: schema.documents.mime,
      size: schema.documents.size,
      status: schema.documents.status,
      note: schema.documents.note,
      uploadedAt: schema.documents.uploadedAt,
    })
    .from(schema.documents)
    .where(eq(schema.documents.userId, userId))
    .orderBy(desc(schema.documents.uploadedAt));
}

export type DocRow = Awaited<ReturnType<typeof docsOf>>[number];

/** Анкетын заавал бөглөх талбарууд. */
const ANKET_REQUIRED: (keyof Applicant)[] = ["country", "program", "jobType", "lastName", "firstName", "birthDate", "gender", "education", "emergencyPhone"];

export function anketMissing(a: Applicant): number {
  return ANKET_REQUIRED.filter((k) => !a[k]).length;
}

export function docsProgress(docs: { kind: string; status: string }[]) {
  const required = DOC_KINDS.filter((d) => d.required);
  // Татгалзсан баримтыг «байхгүй»-д тооцно — дахин илгээх ёстой.
  const have = required.filter((d) => docs.some((x) => x.kind === d.id && x.status !== "rejected"));
  return { have: have.length, need: required.length, rejected: docs.filter((d) => d.status === "rejected").length };
}

export async function historyOf(userId: string) {
  const db = await getDb();
  return db.select().from(schema.stageEvents).where(eq(schema.stageEvents.userId, userId)).orderBy(desc(schema.stageEvents.at));
}

// ---------------- Админ ----------------

export async function listApplicants() {
  const db = await getDb();
  const rows = await db
    .select({ user: schema.users, a: schema.applicants })
    .from(schema.users)
    .leftJoin(schema.applicants, eq(schema.applicants.userId, schema.users.id))
    .where(eq(schema.users.role, "student"))
    .orderBy(desc(schema.users.createdAt));
  const docs = await db
    .select({ userId: schema.documents.userId, kind: schema.documents.kind, status: schema.documents.status })
    .from(schema.documents);
  const byUser = new Map<string, { kind: string; status: string }[]>();
  for (const d of docs) byUser.set(d.userId, [...(byUser.get(d.userId) ?? []), d]);
  return rows.map(({ user, a }) => {
    const ds = byUser.get(user.id) ?? [];
    return {
      user,
      a,
      stage: a?.stage ?? "registered",
      docs: docsProgress(ds),
      pendingDocs: ds.filter((d) => d.status === "pending").length,
      anketMissing: a ? anketMissing(a) : ANKET_REQUIRED.length,
    };
  });
}

export type ApplicantRow = Awaited<ReturnType<typeof listApplicants>>[number];

export async function pendingDocCount() {
  const db = await getDb();
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.documents).where(eq(schema.documents.status, "pending"));
  return r?.n ?? 0;
}
