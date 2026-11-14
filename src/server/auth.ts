import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { getDb, schema } from "@/server/db";
import type { Organization, User } from "@/server/db/schema";

const COOKIE = "kt_session";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 хоног — сурагч утсандаа дахин дахин нэвтрэхгүй

function key(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET тохируулагдаагүй.");
    return new TextEncoder().encode("dev-only-secret-not-for-production-use");
  }
  return new TextEncoder().encode(s);
}

// ---- PIN ----

function scryptAsync(pin: string, salt: Buffer): Promise<Buffer> {
  return new Promise((res, rej) =>
    scrypt(pin, salt, 32, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k))),
  );
}

export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const k = await scryptAsync(pin, salt);
  return `scrypt$${salt.toString("base64")}$${k.toString("base64")}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [alg, s, h] = stored.split("$");
  if (alg !== "scrypt" || !s || !h) return false;
  const expected = Buffer.from(h, "base64");
  const got = await scryptAsync(pin, Buffer.from(s, "base64"));
  return got.length === expected.length && timingSafeEqual(got, expected);
}

// ---- Буруу оролдлого: 4 оронтой PIN-ийг таахаас хамгаална ----

const fails = new Map<string, { n: number; until: number }>();
const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;

export function lockedFor(phone: string): number {
  const f = fails.get(phone);
  if (!f || f.until < Date.now()) return 0;
  return Math.ceil((f.until - Date.now()) / 60000);
}
export function recordFail(phone: string) {
  const f = fails.get(phone) ?? { n: 0, until: 0 };
  if (f.until && f.until < Date.now()) f.until = 0;
  f.n += 1;
  if (f.n >= MAX_FAILS) {
    f.n = 0;
    f.until = Date.now() + LOCK_MS;
  }
  fails.set(phone, f);
}
export function clearFails(phone: string) {
  fails.delete(phone);
}

// ---- Сесс ----

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Cookie-г шалгаад сангаас хэрэглэгчийг уншина — устгагдсан хүн нэвтэрсэн хэвээр үлдэхгүй. */
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "string") return null;
    const db = await getDb();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, payload.uid)).limit(1);
    return u ?? null;
  } catch {
    return null;
  }
}

/** Дүр бүрийн нүүр хуудас. */
export function homeFor(role: string): string {
  return role === "admin" ? "/admin" : role === "org" ? "/org" : role === "teacher" ? "/bagsh" : "/home";
}

/**
 * Горилогчдыг удирддаг ажилтан. `org === null` → платформын эзэн (бүгдийг харна).
 * `org` байвал ЗӨВХӨН applicants.org_id = org.id хүмүүсийг харна — энэ бол
 * байгууллагуудын хоорондох хана. Шалгалтыг дуудагч бүр `canSee`-ээр хийнэ.
 */
export type Staff = { user: User; org: Organization | null; base: "/admin" | "/org" };

export async function requireStaff(): Promise<Staff> {
  const u = await currentUser();
  if (!u) redirect("/nevtreh");
  if (u.role === "admin") return { user: u, org: null, base: "/admin" };
  if (u.role === "org" && u.orgId) {
    const db = await getDb();
    const [o] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, u.orgId)).limit(1);
    if (o && o.active) return { user: u, org: o, base: "/org" };
    // Байгууллага хаагдсан — /org руу буцаавал эцэс төгсгөлгүй redirect болно.
    redirect("/?haagdsan=1");
  }
  redirect(homeFor(u.role));
}

/** Тухайн ажилтан энэ горилогчийг харах эрхтэй юу. */
export function canSee(staff: Staff, applicantOrgId: string | null | undefined): boolean {
  return staff.org === null || (!!applicantOrgId && applicantOrgId === staff.org.id);
}

export async function requireStudent(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/nevtreh");
  if (u.role !== "student") redirect(homeFor(u.role));
  return u;
}

/** Багш болон админ (админ хичээлийн хэсгийг ч удирдана). */
export async function requireTeacher(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/nevtreh");
  if (u.role !== "teacher" && u.role !== "admin") redirect(homeFor(u.role));
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/nevtreh");
  if (u.role !== "admin") redirect(homeFor(u.role));
  return u;
}
