import { randomUUID, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Анхны ачаалалд: багшийн бүртгэл + түвшин бүрт даалгавар.
 * SEED_DEMO=1 (локалд анхдагч) үед жишээ сурагчид — багшийн самбар хоосон
 * харагдахгүйн тулд. Жинхэнэ хэрэглээнд SEED_DEMO-г унтраана.
 */

// Async scrypt — нэг hash ~300мс; sync хувилбар серверийг бүхэлд нь түр зогсоодог.
function derive(pin: string, salt: Buffer): Promise<Buffer> {
  return new Promise((res, rej) => scrypt(pin, salt, 32, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k))));
}

async function pinHash(pin: string) {
  const salt = randomBytes(16);
  const k = await derive(pin, salt);
  return `scrypt$${salt.toString("base64")}$${k.toString("base64")}`;
}

async function pinMatches(pin: string, stored: string) {
  const [alg, s, h] = stored.split("$");
  if (alg !== "scrypt" || !s || !h) return false;
  const want = Buffer.from(h, "base64");
  const got = await derive(pin, Buffer.from(s, "base64"));
  return got.length === want.length && timingSafeEqual(got, want);
}

/**
 * Ажилтны (багш, админ) бүртгэлийг Railway-гийн хувьсагчаас тааруулна —
 * сервер асах бүрд. Тиймээс *_PHONE/*_PIN-ийг хожим оруулсан ч, сольсон ч
 * хүчинтэй болно. ПРОД дээр хувьсагчгүй бол демо (1234) бүртгэл ХЭЗЭЭ Ч үүсэхгүй.
 */
async function syncStaff(
  db: NodePgDatabase<typeof schema>,
  role: "teacher" | "admin",
  prefix: "TEACHER" | "ADMIN",
  dev: { phone: string; name: string },
) {
  const prod = process.env.NODE_ENV === "production";
  const phone = process.env[`${prefix}_PHONE`]?.trim() ?? (prod ? undefined : dev.phone);
  const pin = process.env[`${prefix}_PIN`]?.trim() ?? (prod ? undefined : "1234");
  if (!phone || !pin) {
    console.warn(`${prefix}_PHONE / ${prefix}_PIN тохируулаагүй — ${role} бүртгэлийг өөрчлөхгүй.`);
    return;
  }
  if (!/^[0-9]{8}$/.test(phone) || !/^[0-9]{4}$/.test(pin)) {
    console.error(`${prefix}_PHONE 8 оронтой, ${prefix}_PIN 4 оронтой тоо байх ёстой.`);
    return;
  }
  const name = process.env[`${prefix}_NAME`]?.trim();
  const [t] = await db.select().from(schema.users).where(eq(schema.users.role, role)).limit(1);
  try {
    if (t) {
      // Өөрчлөгдсөн үед л бичнэ — асах бүрд дахин hash хийхгүй.
      const samePin = await pinMatches(pin, t.pinHash);
      if (t.phone === phone && samePin && (!name || t.name === name)) return;
      await db
        .update(schema.users)
        .set({ phone, ...(samePin ? {} : { pinHash: await pinHash(pin) }), ...(name ? { name } : {}) })
        .where(eq(schema.users.id, t.id));
    } else {
      await db.insert(schema.users).values({ id: randomUUID(), name: name || dev.name, phone, pinHash: await pinHash(pin), role, level: "anhan" });
    }
  } catch (e) {
    // Жишээ нь тэр дугаараар сурагч бүртгүүлчихсэн бол.
    console.error(`${role} бүртгэлийг тааруулж чадсангүй:`, (e as Error).message);
  }
}

export async function seedIfEmpty(db: NodePgDatabase<typeof schema>) {
  await syncStaff(db, "teacher", "TEACHER", { phone: "88888888", name: "Япон хэлний багш" });
  await syncStaff(db, "admin", "ADMIN", { phone: "99999999", name: "Удирдлага" });

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
    { name: "Тэмүүлэн (жишээ)", phone: "90000001", level: "anhan", stage: "training", country: "japan", job: "Барилга", done: [["anhan-1", 5, 5], ["anhan-2", 4, 5], ["anhan-3", 4, 4]] },
    { name: "Анужин (жишээ)", phone: "90000002", level: "anhan", stage: "registered", country: "japan", job: "Асаргаа", done: [["anhan-1", 3, 5]] },
    { name: "Билгүүн (жишээ)", phone: "90000003", level: "dund", stage: "interview", country: "japan", job: "Хөдөө аж ахуй", done: [["dund-1", 4, 4], ["dund-2", 3, 4]] },
    { name: "Номин (жишээ)", phone: "90000004", level: "ahisan", stage: "visa", country: "japan", job: "Хүнсний үйлдвэр", done: [["ahisan-1", 4, 4]] },
    { name: "Ганбат (жишээ)", phone: "90000005", level: "anhan", stage: "training", country: "korea", job: "Үйлдвэр", done: [] },
  ] as const;
  for (const s of students) {
    const id = randomUUID();
    await db.insert(schema.users).values({ id, name: s.name, phone: s.phone, pinHash: await pinHash("1111"), role: "student", level: s.level });
    const [last, first] = s.name.replace(" (жишээ)", "").split(" ");
    await db.insert(schema.applicants).values({
      userId: id,
      country: s.country,
      program: s.country === "japan" ? "Тусгай ур чадвар (特定技能)" : "EPS — хөдөлмөр эрхлэлтийн хөтөлбөр",
      jobType: s.job,
      lastName: "Жишээ",
      firstName: first ?? last,
      birthDate: "2001-05-12",
      gender: "Эрэгтэй",
      education: "Бүрэн дунд",
      consentAt: new Date(),
      submittedAt: s.stage === "registered" ? null : new Date(),
      stage: s.stage,
    });
    await db.insert(schema.stageEvents).values({ id: randomUUID(), userId: id, stage: s.stage, note: "Жишээ өгөгдөл", byName: "Систем" });
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
