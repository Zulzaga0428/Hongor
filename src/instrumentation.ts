/**
 * Сервер асахад санг урьдчилан бэлдэнэ (хүснэгт, ажилтны бүртгэл) —
 * эхний хэрэглэгч үүнийг хүлээхгүй. Хүлээлгэхгүй: алдаа гарвал эхний
 * хүсэлт дахин оролдоно (getDb алдаатай promise-ийг хаядаг).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getDb } = await import("./server/db");
  const t = Date.now();
  getDb()
    .then(() => console.log(`Сан бэлэн (${Date.now() - t}мс)`))
    .catch((e) => console.error("Санг бэлдэж чадсангүй:", (e as Error).message));
}
