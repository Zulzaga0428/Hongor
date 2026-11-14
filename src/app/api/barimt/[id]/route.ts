import { eq } from "drizzle-orm";
import { currentUser } from "@/server/auth";
import { getDb, schema } from "@/server/db";

/** Баримтыг зөвхөн эзэн нь болон админ харна. Хэзээ ч кэшлэхгүй. */
export async function GET(_req: Request, ctx: RouteContext<"/api/barimt/[id]">) {
  const u = await currentUser();
  if (!u) return new Response("Нэвтрээгүй", { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  const [d] = await db.select().from(schema.documents).where(eq(schema.documents.id, id)).limit(1);
  if (!d || (d.userId !== u.id && u.role !== "admin")) return new Response("Олдсонгүй", { status: 404 });

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
