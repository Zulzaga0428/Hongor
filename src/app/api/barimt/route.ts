import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDocKind } from "@/content/programs";
import { currentUser } from "@/server/auth";
import { getDb, schema } from "@/server/db";

const MAX = 4 * 1024 * 1024;
const MAX_OTHER = 5;

/** Файлын эхний байтаар төрлийг шалгана — нэрийн өргөтгөлд итгэхгүй. */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  return null;
}

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "student") return fail("Дахин нэвтэрнэ үү.", 401);
  if (Number(req.headers.get("content-length") ?? 0) > MAX + 64 * 1024) return fail("Файл 4MB-аас их байна.", 413);

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return fail("Файл уншиж чадсангүй.");
  }
  const kind = String(fd.get("kind") ?? "");
  const file = fd.get("file");
  if (!isDocKind(kind)) return fail("Баримтын төрөл буруу.");
  if (!(file instanceof File) || file.size === 0) return fail("Файл сонгоно уу.");
  if (file.size > MAX) return fail("Файл 4MB-аас их байна.", 413);

  const data = new Uint8Array(await file.arrayBuffer());
  const mime = sniff(data);
  if (!mime) return fail("Зөвхөн зураг (JPG, PNG) эсвэл PDF хуулна уу.");

  const db = await getDb();
  const same = await db
    .select({ id: schema.documents.id, status: schema.documents.status })
    .from(schema.documents)
    .where(and(eq(schema.documents.userId, u.id), eq(schema.documents.kind, kind)));

  if (kind === "other") {
    if (same.length >= MAX_OTHER) return fail(`«Бусад» хэсэгт ${MAX_OTHER}-аас олныг хуулах боломжгүй.`);
  } else {
    if (same.some((d) => d.status === "ok")) return fail("Энэ баримт аль хэдийн батлагдсан.");
    // Батлагдаагүй хуучныг шинээр солино.
    for (const d of same) await db.delete(schema.documents).where(eq(schema.documents.id, d.id));
  }

  const filename = (file.name || "file").replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 80);
  await db.insert(schema.documents).values({ id: randomUUID(), userId: u.id, kind, filename, mime, size: data.length, data });
  revalidatePath("/material/barimt");
  revalidatePath("/material");
  return Response.json({ ok: true });
}
