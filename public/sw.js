/*
 * Гарц — service worker.
 *
 * ЗОРИУДААР энгийн: хуудас, API, бичиг баримтыг КЭШЛЭХГҮЙ — хүмүүсийн
 * хувийн мэдээлэл (паспорт, анкет) утсанд хадгалагдах ёсгүй, бас ажилтан
 * хуучирсан мэдээлэл харах ёсгүй. Зөвхөн интернэт тасарсан үед хуудас руу
 * шилжих оролдлогод «Интернэт тасарсан» хуудсыг үзүүлнэ.
 *
 * Хувилбар солих бол CACHE-ийн дугаарыг нэмэгдүүл.
 */
const CACHE = "garts-shell-v1";
const OFFLINE = "/offline.html";
const PRECACHE = [OFFLINE, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Зөвхөн хуудас руу шилжих (navigate) хүсэлт; бусад нь хөтчийн ердийн замаар.
  if (req.mode !== "navigate" || req.method !== "GET") return;
  event.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
});
