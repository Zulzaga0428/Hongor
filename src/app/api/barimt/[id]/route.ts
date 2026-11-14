import { eq } from "drizzle-orm";
import { canSee, currentUser, type Staff } from "@/server/auth";
import { getDb, schema } from "@/server/db";

/**
 * Баримтыг харах эрхтэй: эзэн нь, платформын эзэн (admin), эсвэл тэр хүнийг
 * хариуцаж буй байгууллагын ажилтан. Бусад бүх хүнд 404 (байгаа эсэхийг ч мэдэгдэхгүй).
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/barimt/[id]">) {
  const u = await currentUser();
  if (!u) return new Response("Нэвтрээгүй", { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  const [d] = await db.select().from(schema.documents).where(eq(schema.documents.id, id)).limit(1);
  if (!d) return new Response("Олдсонгүй", { status: 404 });

  let allowed = d.userId === u.id || u.role === "admin";
  if (!allowed && u.role === "org" && u.orgId) {
    const [a] = await db.select({ orgId: schema.applicants.orgId }).from(schema.applicants).where(eq(schema.applicants.userId, d.userId)).limit(1);
    const [o] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, u.orgId)).limit(1);
    const staff: Staff | null = o && o.active ? { user: u, org: o, base: "/org" } : null;
    allowed = !!staff && canSee(staff, a?.orgId);
  }
  if (!allowed) return new Response("Олдсонгүй", { status: 404 });

  const body = d.data instanceof Uint8Array ? d.data : new Uint8Array(d.data as ArrayBufferLike);
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": d.mime,
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(d.filename)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
