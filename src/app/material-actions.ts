"use server";

import { randomInt, randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COUNTRIES, EDUCATION, JOB_TYPES, isCountry, isStage, stageName } from "@/content/programs";
import { getApplicant } from "@/server/applicant";
import { canSee, clearFails, hashPin, requireAdmin, requireStaff, requireStudent, type Staff } from "@/server/auth";
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

/**
 * Ажилтан энэ сурагч дээр ажиллах эрхтэй эсэх — бүх ажилтны үйлдэл эндээс эхэлнэ.
 * Сурагч биш, эсвэл өөр байгууллагад оноогдсон бол null (юу ч болоогүй мэт).
 */
async function staffFor(userId: string) {
  const staff = await requireStaff();
  const db = await getDb();
  const [u] = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!u || u.role !== "student") return null;
  const a = await getApplicant(userId);
  if (!canSee(staff, a.orgId)) return null;
  return { staff, a, db };
}

/** Түүхэнд «Хонгор Түрүү · Болд» гэж үлдэнэ — хэн хийснийг байгууллагатай нь. */
const byLabel = (s: Staff) => (s.org ? `${s.org.name} · ${s.user.name}` : s.user.name);

export async function setStage(_: FormState, fd: FormData): Promise<FormState> {
  const userId = clean(fd.get("userId"));
  const ctx = await staffFor(userId);
  if (!ctx) return { error: "Энэ хүн дээр ажиллах эрхгүй." };
  const { staff, a, db } = ctx;
  const stage = clean(fd.get("stage"));
  const note = clean(fd.get("note"), 500);
  if (!isStage(stage)) return { error: "Шат буруу байна." };
  if (a.stage === stage && !note) return { error: "Аль хэдийн энэ шатанд байна." };
  const now = new Date();
  await db.update(schema.applicants).set({ stage, stageAt: now, updatedAt: now }).where(eq(schema.applicants.userId, userId));
  await db.insert(schema.stageEvents).values({ id: randomUUID(), userId, stage, note: note || null, byName: byLabel(staff), orgId: staff.org?.id ?? null, at: now });
  revalidatePath(`${staff.base}/hmuus/${userId}`);
  revalidatePath(staff.base);
  return { ok: `«${stageName(stage)}» болголоо.` };
}

export async function reviewDoc(fd: FormData) {
  const id = clean(fd.get("id"));
  const status = clean(fd.get("status"));
  const note = clean(fd.get("note"), 300);
  if (status !== "ok" && status !== "rejected") return;
  const db = await getDb();
  const [doc] = await db.select({ userId: schema.documents.userId }).from(schema.documents).where(eq(schema.documents.id, id)).limit(1);
  if (!doc) return;
  const ctx = await staffFor(doc.userId);
  if (!ctx) return;
  await db
    .update(schema.documents)
    .set({ status, note: status === "rejected" ? note || "Тод биш эсвэл буруу баримт" : null })
    .where(eq(schema.documents.id, id));
  revalidatePath(`${ctx.staff.base}/hmuus/${doc.userId}`);
  revalidatePath(ctx.staff.base);
}

/**
 * Сурагчийг бүх мэдээлэлтэй нь (анкет, баримт, оноо, түүх) бүрмөсөн устгана —
 * хүсэлтээр эсвэл туршилтын бүртгэл. Батлахын тулд «УСТГАХ» гэж бичүүлнэ.
 */
export async function deletePerson(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const userId = clean(fd.get("userId"));
  if (clean(fd.get("confirm")) !== "УСТГАХ") return { error: "Батлахын тулд «УСТГАХ» гэж бичнэ үү." };
  const db = await getDb();
  // Зөвхөн сурагч — ажилтны бүртгэлийг эндээс устгах боломжгүй.
  const gone = await db
    .delete(schema.users)
    .where(and(eq(schema.users.id, userId), eq(schema.users.role, "student")))
    .returning({ id: schema.users.id });
  if (!gone.length) return { error: "Устгах хүн олдсонгүй." };
  revalidatePath("/admin");
  redirect("/admin/hmuus");
}

export async function saveStaffNote(_: FormState, fd: FormData): Promise<FormState> {
  const userId = clean(fd.get("userId"));
  const ctx = await staffFor(userId);
  if (!ctx) return { error: "Энэ хүн дээр ажиллах эрхгүй." };
  const note = clean(fd.get("note"), 3000);
  await ctx.db.update(schema.applicants).set({ staffNote: note || null }).where(eq(schema.applicants.userId, userId));
  revalidatePath(`${ctx.staff.base}/hmuus/${userId}`);
  return { ok: "Тэмдэглэл хадгалагдлаа." };
}

export type ResetPinState = (FormState & { pin?: string }) | undefined;

/**
 * Нууц кодоо мартсан хүнд шинэ 4 оронтой код. Систем үүсгээд НЭГ УДАА харуулна.
 * Сурагч: хариуцсан байгууллага эсвэл платформын эзэн (canSee). Байгууллагын
 * ажилтан: зөвхөн платформын эзэн. Түгжээг (буруу оролдлого) мөн тайлна.
 */
export async function resetPin(_: ResetPinState, fd: FormData): Promise<ResetPinState> {
  const userId = clean(fd.get("userId"));
  const db = await getDb();
  const [u] = await db.select({ role: schema.users.role, phone: schema.users.phone }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!u) return { error: "Хүн олдсонгүй." };

  let staff: Staff | null = null;
  if (u.role === "student") {
    const ctx = await staffFor(userId);
    if (!ctx) return { error: "Энэ хүн дээр ажиллах эрхгүй." };
    staff = ctx.staff;
  } else if (u.role === "org") {
    await requireAdmin();
  } else {
    return { error: "Энэ бүртгэлийн кодыг эндээс солих боломжгүй." };
  }

  const pin = String(randomInt(0, 10000)).padStart(4, "0");
  await db.update(schema.users).set({ pinHash: await hashPin(pin) }).where(eq(schema.users.id, userId));
  clearFails(u.phone);
  if (staff) {
    const a = await getApplicant(userId);
    await db.insert(schema.stageEvents).values({
      id: randomUUID(),
      userId,
      stage: a.stage,
      note: "Нэвтрэх код шинэчлэв",
      byName: byLabel(staff),
      orgId: staff.org?.id ?? null,
      at: new Date(),
    });
    revalidatePath(`${staff.base}/hmuus/${userId}`);
  }
  return { ok: "Шинэ код үүслээ.", pin };
}

export type CreatePersonState = (FormState & { pin?: string; id?: string; name?: string; phone?: string }) | undefined;

/**
 * Оффис дээр ирсэн хүнийг ажилтан бүртгэнэ. 4 оронтой нэвтрэх кодыг систем
 * үүсгэж ажилтанд НЭГ УДАА харуулна (сан-д зөвхөн hash). Байгууллагын ажилтан
 * бүртгэсэн бол тэр байгууллагад шууд оноогдоно; платформын эзэн сонгож болно.
 * Зөвшөөрлийг ажилтан тухайн хүнээс авсан гэдгээ баталгаажуулна.
 */
export async function createPerson(_: CreatePersonState, fd: FormData): Promise<CreatePersonState> {
  const staff = await requireStaff();
  const name = clean(fd.get("name"), 60);
  const phone = clean(fd.get("phone")).replace(/\D/g, "");
  const country = clean(fd.get("country"));
  const program = clean(fd.get("program"));
  const jobType = clean(fd.get("jobType"));
  const lastName = clean(fd.get("lastName"), 60);
  const firstName = clean(fd.get("firstName"), 60);
  const birthDate = clean(fd.get("birthDate"), 10);
  const gender = clean(fd.get("gender"));
  const education = clean(fd.get("education"));
  const address = clean(fd.get("address"), 300);
  const experience = clean(fd.get("experience"), 2000);
  const level = clean(fd.get("level")) || "anhan";
  const consent = fd.get("consent") === "on";
  const pickedOrg = clean(fd.get("orgId"));

  if (name.length < 2 && !(lastName && firstName)) return { error: "Нэрийг бичнэ үү." };
  if (!/^[0-9]{8}$/.test(phone)) return { error: "Утас 8 оронтой." };
  if (country && !isCountry(country)) return { error: "Улс буруу." };
  if (program && (!isCountry(country) || !(COUNTRIES[country].programs as readonly string[]).includes(program))) return { error: "Хөтөлбөр буруу." };
  if (jobType && !(JOB_TYPES as readonly string[]).includes(jobType)) return { error: "Ажлын чиглэл буруу." };
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return { error: "Төрсөн огноо буруу." };
  if (gender && gender !== "Эрэгтэй" && gender !== "Эмэгтэй") return { error: "Хүйс буруу." };
  if (education && !(EDUCATION as readonly string[]).includes(education)) return { error: "Боловсрол буруу." };
  if (!["anhan", "dund", "ahisan"].includes(level)) return { error: "Хэлний түвшин буруу." };
  if (!consent) return { error: "Хувийн мэдээлэл боловсруулах зөвшөөрлийг тухайн хүнээс авсан байх ёстой." };

  const db = await getDb();
  const [taken] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.phone, phone)).limit(1);
  if (taken) return { error: "Энэ дугаараар бүртгэл аль хэдийн байна." };

  let orgId: string | null = staff.org?.id ?? null;
  if (!staff.org && pickedOrg) {
    const [o] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, pickedOrg)).limit(1);
    if (!o || !o.active) return { error: "Байгууллага олдсонгүй." };
    orgId = o.id;
  }

  const pin = String(randomInt(0, 10000)).padStart(4, "0");
  const id = randomUUID();
  const now = new Date();
  const display = name || `${lastName} ${firstName}`;
  await db.insert(schema.users).values({ id, name: display, phone, pinHash: await hashPin(pin), role: "student", level });
  await db.insert(schema.applicants).values({
    userId: id,
    country: country || null,
    program: program || null,
    jobType: jobType || null,
    lastName: lastName || null,
    firstName: firstName || null,
    birthDate: birthDate || null,
    gender: gender || null,
    education: education || null,
    address: address || null,
    experience: experience || null,
    consentAt: now,
    orgId,
    assignedAt: orgId ? now : null,
  });
  await db.insert(schema.stageEvents).values({
    id: randomUUID(),
    userId: id,
    stage: "registered",
    note: "Оффис дээр ажилтан бүртгэв",
    byName: byLabel(staff),
    orgId: staff.org?.id ?? null,
    at: now,
  });
  revalidatePath(`${staff.base}/hmuus`);
  revalidatePath(staff.base);
  return { ok: "Бүртгэгдлээ.", pin, id, name: display, phone };
}

// ---------------- Платформын эзэн: байгууллага ----------------

/**
 * Хүнийг байгууллагад оноох / шилжүүлэх / буцааж авах. Нэг удаад нэг байгууллага.
 * Шилжүүлэхэд хуучин байгууллага нь тэр хүнийг харахаа шууд болино. Тэмдэглэл
 * (staffNote) өмнөх байгууллагынх тул шилжүүлэхэд арилгана.
 */
export async function assignOrg(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const userId = clean(fd.get("userId"));
  const orgId = clean(fd.get("orgId")) || null;
  const db = await getDb();
  const [u] = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!u || u.role !== "student") return { error: "Хүн олдсонгүй." };
  const a = await getApplicant(userId);
  if (!a.consentAt) return { error: "Хүн анкетаа бөглөж, мэдээлэл дамжуулахыг зөвшөөрөөгүй байна." };
  let orgName = "";
  if (orgId) {
    const [o] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId)).limit(1);
    if (!o || !o.active) return { error: "Байгууллага олдсонгүй." };
    orgName = o.name;
  }
  if ((a.orgId ?? null) === orgId) return { error: "Аль хэдийн тэнд оноогдсон байна." };
  const now = new Date();
  await db
    .update(schema.applicants)
    .set({ orgId, assignedAt: orgId ? now : null, staffNote: a.orgId && a.orgId !== orgId ? null : a.staffNote, updatedAt: now })
    .where(eq(schema.applicants.userId, userId));
  await db.insert(schema.stageEvents).values({
    id: randomUUID(),
    userId,
    stage: a.stage,
    note: orgId ? `«${orgName}» хариуцна` : "Байгууллагаас буцааж авав",
    byName: admin.name,
    at: now,
  });
  revalidatePath(`/admin/hmuus/${userId}`);
  revalidatePath("/admin");
  return { ok: orgId ? `«${orgName}»-д оноолоо.` : "Буцааж авлаа." };
}

const COUNTRY_KEYS = ["korea", "japan", "czech"];

export async function createOrg(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = clean(fd.get("name"), 120);
  const contactName = clean(fd.get("contactName"), 80);
  const phone = clean(fd.get("phone")).replace(/\D/g, "");
  const countries = fd.getAll("countries").map(String).filter((c) => COUNTRY_KEYS.includes(c));
  if (name.length < 2) return { error: "Байгууллагын нэр бичнэ үү." };
  if (phone && !/^[0-9]{8}$/.test(phone)) return { error: "Утас 8 оронтой." };
  const db = await getDb();
  await db.insert(schema.organizations).values({ id: randomUUID(), name, contactName: contactName || null, phone: phone || null, countries: countries.join(",") });
  revalidatePath("/admin/baiguullaga");
  return { ok: `«${name}» нэмэгдлээ.` };
}

/** Байгууллагын ажилтанд нэвтрэх эрх: утас + 4 оронтой код. Кодыг ажилтанд хэлж өгнө. */
export async function createOrgStaff(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const orgId = clean(fd.get("orgId"));
  const name = clean(fd.get("name"), 60);
  const phone = clean(fd.get("phone")).replace(/\D/g, "");
  const pin = clean(fd.get("pin")).replace(/\D/g, "");
  if (name.length < 2) return { error: "Ажилтны нэр бичнэ үү." };
  if (!/^[0-9]{8}$/.test(phone)) return { error: "Утас 8 оронтой." };
  if (!/^[0-9]{4}$/.test(pin)) return { error: "Код 4 оронтой." };
  const db = await getDb();
  const [o] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId)).limit(1);
  if (!o) return { error: "Байгууллага олдсонгүй." };
  const [taken] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.phone, phone)).limit(1);
  if (taken) return { error: "Энэ дугаар өөр бүртгэлд ашиглагдаж байна." };
  await db.insert(schema.users).values({ id: randomUUID(), name, phone, pinHash: await hashPin(pin), role: "org", orgId, level: "anhan" });
  revalidatePath("/admin/baiguullaga");
  return { ok: `${name} — ${phone} / ${pin} кодоор нэвтэрнэ.` };
}

export async function toggleOrg(fd: FormData) {
  await requireAdmin();
  const id = clean(fd.get("id"));
  const db = await getDb();
  const [o] = await db.select({ active: schema.organizations.active }).from(schema.organizations).where(eq(schema.organizations.id, id)).limit(1);
  if (!o) return;
  await db.update(schema.organizations).set({ active: o.active ? 0 : 1 }).where(eq(schema.organizations.id, id));
  revalidatePath("/admin/baiguullaga");
}

/** Ажилтны эрхийг хаах — бүртгэлийг устгана (горилогчийн өгөгдөлд нөлөөгүй). */
export async function removeOrgStaff(fd: FormData) {
  await requireAdmin();
  const id = clean(fd.get("id"));
  const db = await getDb();
  await db.delete(schema.users).where(and(eq(schema.users.id, id), eq(schema.users.role, "org")));
  revalidatePath("/admin/baiguullaga");
}
