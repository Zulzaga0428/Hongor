"use server";

import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { COUNTRIES, EDUCATION, JOB_TYPES, isCountry, isStage, stageName } from "@/content/programs";
import { getApplicant } from "@/server/applicant";
import { requireAdmin, requireStudent } from "@/server/auth";
import { getDb, schema } from "@/server/db";
import type { FormState } from "@/app/actions";

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const int = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function saveAnket(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireStudent();
  const prev = await getApplicant(u.id);

  const country = clean(fd.get("country"));
  const program = clean(fd.get("program"));
  const jobType = clean(fd.get("jobType"));
  const lastName = clean(fd.get("lastName"), 60);
  const firstName = clean(fd.get("firstName"), 60);
  const birthDate = clean(fd.get("birthDate"), 10);
  const gender = clean(fd.get("gender"));
  const address = clean(fd.get("address"), 300);
  const education = clean(fd.get("education"));
  const experience = clean(fd.get("experience"), 2000);
  const heightCm = int(fd.get("heightCm"));
  const weightKg = int(fd.get("weightKg"));
  const emergencyName = clean(fd.get("emergencyName"), 80);
  const emergencyPhone = clean(fd.get("emergencyPhone")).replace(/\D/g, "");
  const consent = fd.get("consent") === "on";

  if (!isCountry(country)) return { error: "Явах улсаа сонгоно уу." };
  if (!(COUNTRIES[country].programs as readonly string[]).includes(program)) return { error: "Хөтөлбөрөө сонгоно уу." };
  if (!(JOB_TYPES as readonly string[]).includes(jobType)) return { error: "Ажлын чиглэлээ сонгоно уу." };
  if (lastName.length < 2 || firstName.length < 2) return { error: "Овог, нэрээ бүтэн бичнэ үү." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return { error: "Төрсөн огноогоо оруулна уу." };
  const age = (Date.now() - new Date(birthDate).getTime()) / (365.25 * 86400000);
  if (!(age >= 16 && age <= 70)) return { error: "Төрсөн огноо буруу байна." };
  if (gender !== "Эрэгтэй" && gender !== "Эмэгтэй") return { error: "Хүйсээ сонгоно уу." };
  if (!(EDUCATION as readonly string[]).includes(education)) return { error: "Боловсролоо сонгоно уу." };
  if (heightCm !== null && (heightCm < 120 || heightCm > 230)) return { error: "Өндрөө см-ээр бичнэ үү (жишээ нь 172)." };
  if (weightKg !== null && (weightKg < 35 || weightKg > 200)) return { error: "Жингээ кг-аар бичнэ үү." };
  if (!/^[0-9]{8}$/.test(emergencyPhone)) return { error: "Яаралтай үед холбогдох хүний 8 оронтой утас." };
  if (!prev.consentAt && !consent) return { error: "Хувийн мэдээлэл боловсруулахыг зөвшөөрөх шаардлагатай." };

  const db = await getDb();
  const now = new Date();
  await db
    .update(schema.applicants)
    .set({
      country,
      program,
      jobType,
      lastName,
      firstName,
      birthDate,
      gender,
      address: address || null,
      education,
      experience: experience || null,
      heightCm,
      weightKg,
      emergencyName: emergencyName || null,
      emergencyPhone,
      consentAt: prev.consentAt ?? now,
      submittedAt: prev.submittedAt ?? now,
      updatedAt: now,
    })
    .where(eq(schema.applicants.userId, u.id));
  revalidatePath("/material");
  revalidatePath("/home");
  return { ok: prev.submittedAt ? "Хадгаллаа." : "Анкет илгээгдлээ! Одоо бичиг баримтаа хуулаарай." };
}

/** Сурагч зөвхөн батлагдаагүй өөрийн баримтаа устгана. */
export async function deleteDoc(fd: FormData) {
  const u = await requireStudent();
  const id = clean(fd.get("id"));
  const db = await getDb();
  await db
    .delete(schema.documents)
    .where(and(eq(schema.documents.id, id), eq(schema.documents.userId, u.id), ne(schema.documents.status, "ok")));
  revalidatePath("/material/barimt");
}

// ---------------- Админ ----------------

export async function setStage(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const userId = clean(fd.get("userId"));
  const stage = clean(fd.get("stage"));
  const note = clean(fd.get("note"), 500);
  if (!isStage(stage)) return { error: "Шат буруу байна." };
  const a = await getApplicant(userId);
  if (a.stage === stage && !note) return { error: "Аль хэдийн энэ шатанд байна." };
  const db = await getDb();
  const now = new Date();
  await db.update(schema.applicants).set({ stage, stageAt: now, updatedAt: now }).where(eq(schema.applicants.userId, userId));
  await db.insert(schema.stageEvents).values({ id: randomUUID(), userId, stage, note: note || null, byName: admin.name, at: now });
  revalidatePath(`/admin/hmuus/${userId}`);
  revalidatePath("/admin");
  return { ok: `«${stageName(stage)}» болголоо.` };
}

export async function reviewDoc(fd: FormData) {
  await requireAdmin();
  const id = clean(fd.get("id"));
  const status = clean(fd.get("status"));
  const note = clean(fd.get("note"), 300);
  if (status !== "ok" && status !== "rejected") return;
  const db = await getDb();
  const [d] = await db
    .update(schema.documents)
    .set({ status, note: status === "rejected" ? note || "Тод биш эсвэл буруу баримт" : null })
    .where(eq(schema.documents.id, id))
    .returning({ userId: schema.documents.userId });
  if (d) revalidatePath(`/admin/hmuus/${d.userId}`);
  revalidatePath("/admin");
}

export async function saveStaffNote(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const userId = clean(fd.get("userId"));
  const note = clean(fd.get("note"), 3000);
  await getApplicant(userId);
  const db = await getDb();
  await db.update(schema.applicants).set({ staffNote: note || null }).where(eq(schema.applicants.userId, userId));
  revalidatePath(`/admin/hmuus/${userId}`);
  return { ok: "Тэмдэглэл хадгалагдлаа." };
}
