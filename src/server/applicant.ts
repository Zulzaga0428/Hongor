import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
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

/**
 * `orgId` өгвөл ЗӨВХӨН тэр байгууллагад оноогдсон хүмүүс — SQL түвшинд шүүнэ,
 * бусад байгууллагын мөр хэзээ ч санах ойд ч орохгүй.
 */
export async function listApplicants(orgId: string | null = null) {
  const db = await getDb();
  const where = orgId
    ? and(eq(schema.users.role, "student"), eq(schema.applicants.orgId, orgId))
    : eq(schema.users.role, "student");
  const rows = await db
    .select({ user: schema.users, a: schema.applicants, org: { id: schema.organizations.id, name: schema.organizations.name } })
    .from(schema.users)
    .leftJoin(schema.applicants, eq(schema.applicants.userId, schema.users.id))
    .leftJoin(schema.organizations, eq(schema.organizations.id, schema.applicants.orgId))
    .where(where)
    .orderBy(desc(schema.users.createdAt));
  const ids = rows.map((r) => r.user.id);
  const docs = ids.length
    ? await db
        .select({ userId: schema.documents.userId, kind: schema.documents.kind, status: schema.documents.status })
        .from(schema.documents)
        .where(inArray(schema.documents.userId, ids))
    : [];
  const byUser = new Map<string, { kind: string; status: string }[]>();
  for (const d of docs) byUser.set(d.userId, [...(byUser.get(d.userId) ?? []), d]);
  return rows.map(({ user, a, org }) => {
    const ds = byUser.get(user.id) ?? [];
    return {
      user,
      a,
      org: org?.id ? org : null,
      stage: a?.stage ?? "registered",
      docs: docsProgress(ds),
      pendingDocs: ds.filter((d) => d.status === "pending").length,
      anketMissing: a ? anketMissing(a) : ANKET_REQUIRED.length,
    };
  });
}

export type ApplicantRow = Awaited<ReturnType<typeof listApplicants>>[number];

export async function pendingDocCount(orgId: string | null = null) {
  const db = await getDb();
  if (!orgId) {
    const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.documents).where(eq(schema.documents.status, "pending"));
    return r?.n ?? 0;
  }
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.documents)
    .innerJoin(schema.applicants, eq(schema.applicants.userId, schema.documents.userId))
    .where(and(eq(schema.documents.status, "pending"), eq(schema.applicants.orgId, orgId)));
  return r?.n ?? 0;
}

/**
 * Сүүлийн үйл ажиллагаа. Байгууллагад: зөвхөн ӨӨРИЙН ажилтнуудын хийсэн, одоо ч
 * өөрт нь оноогдсон хүмүүсийн мөрүүд (өмнөх байгууллагын түүх орохгүй).
 */
export async function recentActivity(orgId: string | null, limit = 8) {
  const db = await getDb();
  const cols = {
    id: schema.stageEvents.id,
    stage: schema.stageEvents.stage,
    note: schema.stageEvents.note,
    byName: schema.stageEvents.byName,
    at: schema.stageEvents.at,
    userId: schema.users.id,
    name: schema.users.name,
    lastName: schema.applicants.lastName,
    firstName: schema.applicants.firstName,
  };
  const q = db
    .select(cols)
    .from(schema.stageEvents)
    .innerJoin(schema.users, eq(schema.users.id, schema.stageEvents.userId))
    .leftJoin(schema.applicants, eq(schema.applicants.userId, schema.stageEvents.userId));
  const rows = orgId
    ? await q.where(and(eq(schema.stageEvents.orgId, orgId), eq(schema.applicants.orgId, orgId))).orderBy(desc(schema.stageEvents.at)).limit(limit)
    : await q.orderBy(desc(schema.stageEvents.at)).limit(limit);
  return rows;
}

export async function listOrgs() {
  const db = await getDb();
  return db.select().from(schema.organizations).orderBy(schema.organizations.createdAt);
}
