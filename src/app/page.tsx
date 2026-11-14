import Link from "next/link";
import { redirect } from "next/navigation";
import { LEVELS, LEVEL_IDS } from "@/content/lessons";
import { currentUser, homeFor } from "@/server/auth";
import { Hinomaru } from "@/components/ui";

const PETALS = [
  { left: "8%", delay: "0s", dur: "9s" },
  { left: "22%", delay: "3s", dur: "11s" },
  { left: "41%", delay: "1.5s", dur: "10s" },
  { left: "63%", delay: "5s", dur: "12s" },
  { left: "78%", delay: "2s", dur: "9.5s" },
  { left: "92%", delay: "6s", dur: "11.5s" },
];

export default async function Landing() {
  const u = await currentUser();
  if (u) redirect(homeFor(u.role));

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md overflow-hidden px-5 pb-10">
      {PETALS.map((p, i) => (
        <span key={i} className="petal" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }} />
      ))}

      <header className="flex items-center gap-2 pt-5">
        <Hinomaru size={34}>日</Hinomaru>
        <span className="text-sm font-extrabold">Хонгор Түрүү</span>
        <span className="ml-auto text-xs font-bold text-muted">日本語クラス</span>
      </header>

      <section className="pt-10 text-center">
        <div className="mx-auto flex w-fit">
          <Hinomaru size={128}>
            <span className="jp whitespace-nowrap text-[34px] leading-none">日本語</span>
          </Hinomaru>
        </div>
        <h1 className="mt-8 text-[2rem] font-extrabold leading-tight">
          Япон хэлээ
          <br />
          <span className="text-red">утсаараа</span> сур
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
          Японд ажиллахаар бэлдэж буй сурагчдад зориулсан хичээл, даалгавар, тест. Багш тань шалгаад оноо өгнө.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3">
        {LEVEL_IDS.map((id, i) => (
          <div key={id} className="card flex items-center gap-4 p-4">
            <div
              className={`jp flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold ${
                i === 0 ? "bg-pink text-red" : i === 1 ? "bg-[#fdf0dc] text-[#a86a12]" : "bg-red text-white"
              }`}
            >
              {LEVELS[id].jp}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold">{LEVELS[id].name}</span>
                <span className="text-xs font-bold text-muted">{LEVELS[id].jlpt}</span>
              </div>
              <p className="text-sm text-muted">{LEVELS[id].desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="sticky bottom-4 mt-8 grid gap-3">
        <Link href="/burtgel" className="btn btn-red">
          Бүртгүүлэх — үнэгүй
        </Link>
        <Link href="/nevtreh" className="btn btn-ghost">
          Нэвтрэх
        </Link>
      </section>

      <p className="mt-8 text-center text-xs text-muted">がんばって！ · Амжилт хүсье!</p>
    </div>
  );
}
