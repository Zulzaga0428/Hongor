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

const FEATURES = [
  { icon: "学", title: "Хичээл, тест", text: "Хирагана, мэндчилгээнээс ярилцлагын бэлтгэл хүртэл. Дуудлагыг нь сонсоно." },
  { icon: "書", title: "Багшийн даалгавар", text: "Даалгавраа илгээгээд багшийн оноо, зөвлөгөөг авна." },
  { icon: "履", title: "Материалаа хянах", text: "Анкет, бичиг баримт, визийн явцаа өөрөө харна." },
];

export default async function Landing() {
  const u = await currentUser();
  if (u) redirect(homeFor(u.role));

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md overflow-hidden px-5 pb-10 lg:max-w-6xl lg:px-10">
      {PETALS.map((p, i) => (
        <span key={i} className="petal" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }} />
      ))}

      <header className="flex items-center gap-2 pt-5 lg:pt-8">
        <Hinomaru size={34}>日</Hinomaru>
        <span className="text-sm font-extrabold lg:text-base">Хонгор Түрүү</span>
        <span className="ml-auto text-xs font-bold text-muted lg:hidden">日本語クラス</span>
        <nav className="ml-auto hidden items-center gap-3 lg:flex">
          <Link href="/nevtreh" className="rounded-full px-5 py-2.5 font-bold text-ink hover:bg-pink">
            Нэвтрэх
          </Link>
          <Link href="/burtgel" className="rounded-full bg-red px-5 py-2.5 font-extrabold text-white shadow-[0_4px_0_var(--red-deep)]">
            Бүртгүүлэх
          </Link>
        </nav>
      </header>

      <div className="lg:grid lg:min-h-[78vh] lg:grid-cols-2 lg:items-center lg:gap-16">
        <section className="pt-10 text-center lg:pt-0 lg:text-left">
          <div className="mx-auto flex w-fit lg:hidden">
            <Hinomaru size={128}>
              <span className="jp whitespace-nowrap text-[34px] leading-none">日本語</span>
            </Hinomaru>
          </div>
          <p className="jp hidden text-lg font-extrabold text-red lg:block">日本語クラス · Япон хэлний сургалт</p>
          <h1 className="mt-8 text-[2rem] font-extrabold leading-tight lg:mt-3 lg:text-6xl lg:leading-[1.1]">
            Япон хэлээ
            <br />
            <span className="text-red lg:hidden">утсаараа</span>
            <span className="hidden text-red lg:inline">хаанаас ч</span> сур
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-muted lg:mx-0 lg:mt-6 lg:max-w-lg lg:text-lg">
            Японд ажиллахаар бэлдэж буй сурагчдад зориулсан хичээл, даалгавар, тест. Багш тань шалгаад оноо өгнө.
          </p>
          <div className="mt-8 hidden max-w-lg grid-cols-[1.4fr_1fr] gap-3 lg:grid">
            <Link href="/burtgel" className="btn btn-red whitespace-nowrap">
              Бүртгүүлэх — үнэгүй
            </Link>
            <Link href="/nevtreh" className="btn btn-ghost">
              Нэвтрэх
            </Link>
          </div>
        </section>

        <section className="relative mt-8 lg:mt-0">
          <div className="absolute -right-6 -top-10 hidden lg:block" aria-hidden>
            <Hinomaru size={150}>
              <span className="jp whitespace-nowrap text-[40px] leading-none">日本語</span>
            </Hinomaru>
          </div>
          <div className="relative grid grid-cols-1 gap-3 lg:gap-4 lg:pt-24">
            {LEVEL_IDS.map((id, i) => (
              <div key={id} className="card flex items-center gap-4 p-4 lg:p-6">
                <div
                  className={`jp flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold lg:h-16 lg:w-16 ${
                    i === 0 ? "bg-pink text-red" : i === 1 ? "bg-[#fdf0dc] text-[#a86a12]" : "bg-red text-white"
                  }`}
                >
                  {LEVELS[id].jp}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold lg:text-lg">{LEVELS[id].name}</span>
                    <span className="text-xs font-bold text-muted">{LEVELS[id].jlpt}</span>
                  </div>
                  <p className="text-sm text-muted">{LEVELS[id].desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 hidden grid-cols-3 gap-4 pb-6 lg:grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-6">
            <span className="jp flex h-12 w-12 items-center justify-center rounded-2xl bg-pink text-xl font-extrabold text-red">{f.icon}</span>
            <h2 className="mt-4 text-lg font-extrabold">{f.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="sticky bottom-4 mt-8 grid gap-3 lg:hidden">
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
