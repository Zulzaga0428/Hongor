"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLesson, isLevel } from "@/content/lessons";
import {
  clearFails,
  createSession,
  currentUser,
  destroySession,
  hashPin,
  lockedFor,
  recordFail,
  requireStudent,
  requireTeacher,
  verifyPin,
} from "@/server/auth";
import { getDb, schema } from "@/server/db";

export type FormState = { error?: string; ok?: string } | undefined;

const PHONE = /^[0-9]{8}$/;
const PIN = /^[0-9]{4}$/;

const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const digits = (v: FormDataEntryValue | null) => clean(v).replace(/\D/g, "");

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const name = clean(fd.get("name"));
  const phone = digits(fd.get("phone"));
  const pin = digits(fd.get("pin"));
  const pin2 = digits(fd.get("pin2"));
  const level = clean(fd.get("level"));

  if (name.length < 2) return { error: "Нэрээ бичнэ үү." };
  if (!PHONE.test(phone)) return { error: "Утасны дугаар 8 оронтой байна." };
  if (!PIN.test(pin)) return { error: "Нууц код 4 оронтой тоо байна." };
  if (pin !== pin2) return { error: "Нууц код хоёр удаа ижил биш байна." };
  if (!isLevel(level)) return { error: "Түвшнээ сонгоно уу." };

  const db = await getDb();
  const [taken] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.phone, phone)).limit(1);
  if (taken) return { error: "Энэ дугаар бүртгэлтэй байна. «Нэвтрэх» хэсгээр орно уу." };

  const id = randomUUID();
  await db.insert(schema.users).values({ id, name: name.slice(0, 60), phone, pinHash: await hashPin(pin), level });
  await createSession(id);
  redirect("/home");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const phone = digits(fd.get("phone"));
  const pin = digits(fd.get("pin"));
  if (!PHONE.test(phone) || !PIN.test(pin)) return { error: "Утасны дугаар (8) болон нууц код (4)-оо оруулна уу." };

  const wait = lockedFor(phone);
  if (wait) return { error: `Олон удаа буруу оруулсан. ${wait} минутын дараа дахин оролдоно уу.` };

  const db = await getDb();
  const [u] = await db.select().from(schema.users).where(eq(schema.users.phone, phone)).limit(1);
  if (!u || !(await verifyPin(pin, u.pinHash))) {
    recordFail(phone);
    return { error: "Дугаар эсвэл нууц код буруу байна." };
  }
  clearFails(phone);
  await createSession(u.id);
  redirect(u.role === "teacher" ? "/bagsh" : "/home");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function changeLevel(fd: FormData) {
  const u = await requireStudent();
  const level = clean(fd.get("level"));
  if (!isLevel(level)) return;
  const db = await getDb();
  await db.update(schema.users).set({ level }).where(eq(schema.users.id, u.id));
  revalidatePath("/", "layout");
  redirect("/home");
}

export type QuizResult = { score: number; total: number; correct: number[] } | { error: string };

/** Оноог серверт тооцно — зөв хариулт хөтөч рүү очдоггүй. */
export async function submitQuiz(lessonId: string, choices: number[]): Promise<QuizResult> {
  const u = await currentUser();
  if (!u) return { error: "Дахин нэвтэрнэ үү." };
  const lesson = getLesson(lessonId);
  if (!lesson) return { error: "Хичээл олдсонгүй." };

  const correct = lesson.quiz.map((q) => q.answer);
  const score = lesson.quiz.reduce((s, q, i) => s + (choices[i] === q.answer ? 1 : 0), 0);
  const total = lesson.quiz.length;

  const db = await getDb();
  const [prev] = await db
    .select()
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.userId, u.id), eq(schema.lessonProgress.lessonId, lessonId)))
    .limit(1);
  if (!prev) {
    await db.insert(schema.lessonProgress).values({ userId: u.id, lessonId, score, total });
  } else if (score > prev.score) {
    await db
      .update(schema.lessonProgress)
      .set({ score, total, completedAt: new Date() })
      .where(and(eq(schema.lessonProgress.userId, u.id), eq(schema.lessonProgress.lessonId, lessonId)));
  }
  revalidatePath("/home");
  revalidatePath("/hicheel");
  return { score, total, correct };
}

export async function submitAssignment(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireStudent();
  const assignmentId = clean(fd.get("assignmentId"));
  const answer = clean(fd.get("answer"));
  if (answer.length < 2) return { error: "Хариултаа бичнэ үү." };
  if (answer.length > 5000) return { error: "Хариулт хэт урт байна." };

  const db = await getDb();
  const [a] = await db.select().from(schema.assignments).where(eq(schema.assignments.id, assignmentId)).limit(1);
  if (!a || a.level !== u.level) return { error: "Даалгавар олдсонгүй." };

  const [prev] = await db
    .select()
    .from(schema.submissions)
    .where(and(eq(schema.submissions.assignmentId, a.id), eq(schema.submissions.userId, u.id)))
    .limit(1);
  if (prev?.gradedAt) return { error: "Багш аль хэдийн шалгасан тул засах боломжгүй." };
  if (prev) {
    await db.update(schema.submissions).set({ answer, submittedAt: new Date() }).where(eq(schema.submissions.id, prev.id));
  } else {
    await db.insert(schema.submissions).values({ id: randomUUID(), assignmentId: a.id, userId: u.id, answer });
  }
  revalidatePath(`/daalgavar/${a.id}`);
  revalidatePath("/home");
  return { ok: "Илгээлээ! Багш шалгаад оноо өгнө." };
}

export async function gradeSubmission(_: FormState, fd: FormData): Promise<FormState> {
  await requireTeacher();
  const id = clean(fd.get("id"));
  const score = Number(digits(fd.get("score")));
  const feedback = clean(fd.get("feedback")).slice(0, 2000);
  if (!Number.isInteger(score) || score < 0 || score > 100) return { error: "Оноо 0–100 хооронд байна." };
  const db = await getDb();
  await db.update(schema.submissions).set({ score, feedback: feedback || null, gradedAt: new Date() }).where(eq(schema.submissions.id, id));
  revalidatePath("/bagsh");
  redirect("/bagsh");
}

export async function createAssignment(_: FormState, fd: FormData): Promise<FormState> {
  await requireTeacher();
  const level = clean(fd.get("level"));
  const title = clean(fd.get("title"));
  const instructions = clean(fd.get("instructions"));
  const due = clean(fd.get("due"));
  if (!isLevel(level)) return { error: "Түвшнээ сонгоно уу." };
  if (title.length < 2) return { error: "Гарчиг бичнэ үү." };
  if (instructions.length < 5) return { error: "Даалгаврын тайлбар бичнэ үү." };
  // Огноог Улаанбаатарын цагаар өдрийн төгсгөл гэж үзнэ.
  const dueAt = due ? new Date(`${due}T23:59:00+08:00`) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) return { error: "Огноо буруу байна." };
  const db = await getDb();
  await db.insert(schema.assignments).values({ id: randomUUID(), level, title: title.slice(0, 120), instructions: instructions.slice(0, 3000), dueAt });
  revalidatePath("/bagsh");
  return { ok: "Даалгавар нэмэгдлээ." };
}
