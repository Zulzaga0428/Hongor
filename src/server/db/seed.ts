import "server-only";
import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Анхны ачаалалд: багшийн бүртгэл + түвшин бүрт даалгавар.
 * SEED_DEMO=1 (локалд анхдагч) үед жишээ сурагчид — багшийн самбар хоосон
 * харагдахгүйн тулд. Жинхэнэ хэрэглээнд SEED_DEMO-г унтраана.
 */

function pinHash(pin: string) {
  const salt = randomBytes(16);
  const k = scryptSync(pin, salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${k.toString("base64")}`;
}

/**
 * Багшийн бүртгэлийг Railway-гийн хувьсагчаас тааруулна — сервер асах бүрд.
 * Тиймээс TEACHER_PHONE/PIN-ийг хожим оруулсан ч, сольсон ч хүчинтэй болно.
 * ПРОД дээр хувьсагчгүй бол 88888888/1234 демо багшийг ХЭЗЭЭ Ч үүсгэхгүй.
 */
async function syncTeacher(db: NodePgDatabase<typeof schema>) {
  const prod = process.env.NODE_ENV === "production";
  const phone = process.env.TEACHER_PHONE?.trim() ?? (prod ? undefined : "88888888");
  const pin = process.env.TEACHER_PIN?.trim() ?? (prod ? undefined : "1234");
  if (!phone || !pin) {
    console.warn("TEACHER_PHONE / TEACHER_PIN тохируулаагүй — багшийн бүртгэлийг өөрчлөхгүй.");
    return;
  }
  if (!/^[0-9]{8}$/.test(phone) || !/^[0-9]{4}$/.test(pin)) {
    console.error("TEACHER_PHONE 8 оронтой, TEACHER_PIN 4 оронтой тоо байх ёстой.");
    return;
  }
  const name = process.env.TEACHER_NAME?.trim();
  const [t] = await db.select().from(schema.users).where(eq(schema.users.role, "teacher")).limit(1);
  try {
    if (t) {
      await db
        .update(schema.users)
        .set({ phone, pinHash: pinHash(pin), ...(name ? { name } : {}) })
        .where(eq(schema.users.id, t.id));
    } else {
      await db.insert(schema.users).values({
        id: randomUUID(),
        name: name || "Япон хэлний багш",
        phone,
        pinHash: pinHash(pin),
        role: "teacher",
        level: "anhan",
      });
    }
  } catch (e) {
    // Жишээ нь тэр дугаараар сурагч бүртгүүлчихсэн бол.
    console.error("Багшийн бүртгэлийг тааруулж чадсангүй:", (e as Error).message);
  }
}

export async function seedIfEmpty(db: NodePgDatabase<typeof schema>) {
  await syncTeacher(db);

  const existing = await db.select({ id: schema.assignments.id }).from(schema.assignments).limit(1);
  if (existing.length) return;

  const week = (d: number) => new Date(Date.now() + d * 86400000);
  const asg = [
    { level: "anhan", title: "Хирагана бичих дасгал", instructions: "あ〜の хүртэлх 25 үсгийг 3 удаа бичээд, өөрийн нэрийг ромажигаар бичнэ үү.", dueAt: week(3) },
    { level: "anhan", title: "Өөрийгөө танилцуул", instructions: "«はじめまして。わたしは ＿ です。» гэж эхлээд 4 өгүүлбэрээр өөрийгөө танилцуулна уу.", dueAt: week(5) },
    { level: "dund", title: "て хэлбэрийн 10 өгүүлбэр", instructions: "て хэлбэр ашигласан «～てください» өгүүлбэрийг 10-ыг бичнэ үү. Ажлын байранд хэрэглэгдэх өгүүлбэр байвал сайн.", dueAt: week(4) },
    { level: "dund", title: "Туршлагаа бич", instructions: "«～たことが あります» ашиглаж өөрийн ажлын туршлагын тухай 5 өгүүлбэр бичнэ үү.", dueAt: week(6) },
    { level: "ahisan", title: "Ярилцлагын хариулт", instructions: "«志望動機は なんですか» гэсэн асуултад 敬語 ашиглан 5–6 өгүүлбэрээр хариулна уу.", dueAt: week(4) },
  ];
  const asgIds: string[] = [];
  for (const a of asg) {
    const id = randomUUID();
    asgIds.push(id);
    await db.insert(schema.assignments).values({ id, ...a });
  }

  const demo = process.env.SEED_DEMO ?? (process.env.NODE_ENV === "production" ? "0" : "1");
  if (demo !== "1") return;

  const students = [
    { name: "Тэмүүлэн (жишээ)", phone: "90000001", level: "anhan", done: [["anhan-1", 5, 5], ["anhan-2", 4, 5], ["anhan-3", 4, 4]] },
    { name: "Анужин (жишээ)", phone: "90000002", level: "anhan", done: [["anhan-1", 3, 5]] },
    { name: "Билгүүн (жишээ)", phone: "90000003", level: "dund", done: [["dund-1", 4, 4], ["dund-2", 3, 4]] },
  ] as const;
  for (const s of students) {
    const id = randomUUID();
    await db.insert(schema.users).values({ id, name: s.name, phone: s.phone, pinHash: pinHash("1111"), role: "student", level: s.level });
    for (const [lessonId, score, total] of s.done) {
      await db.insert(schema.lessonProgress).values({ userId: id, lessonId, score, total });
    }
    if (s.phone === "90000001") {
      await db.insert(schema.submissions).values({
        id: randomUUID(),
        assignmentId: asgIds[1],
        userId: id,
        answer: "はじめまして。わたしは テムーレン です。モンゴルじん です。にじゅういっさい です。よろしく おねがいします。",
      });
    }
  }
}
