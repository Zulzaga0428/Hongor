import { changeLevel, logout } from "@/app/actions";
import { LEVELS, LEVEL_IDS } from "@/content/lessons";
import { requireStudent } from "@/server/auth";
import { Hinomaru } from "@/components/ui";
import { InstallApp } from "@/components/pwa";

export default async function Profile() {
  const u = await requireStudent();
  return (
    <>
      <div className="flex items-center gap-4">
        <Hinomaru size={64}>{u.name.slice(0, 1)}</Hinomaru>
        <div>
          <h1 className="text-2xl font-bold lg:text-[28px]">{u.name}</h1>
          <p className="text-sm text-muted">+976 {u.phone}</p>
        </div>
      </div>

      <section className="mt-7">
        <h2 className="mb-3 font-extrabold">Түвшин солих</h2>
        <div className="grid grid-cols-1 gap-2">
          {LEVEL_IDS.map((id) => {
            const on = u.level === id;
            return (
              <form key={id} action={changeLevel}>
                <input type="hidden" name="level" value={id} />
                <button
                  disabled={on}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left ${on ? "border-red bg-pink" : "border-line bg-white"}`}
                >
                  <span className={`jp flex h-11 w-11 items-center justify-center rounded-xl font-extrabold ${on ? "bg-red text-white" : "bg-pink text-red"}`}>
                    {LEVELS[id].jp}
                  </span>
                  <span className="flex-1">
                    <span className="block font-extrabold">{LEVELS[id].name}</span>
                    <span className="block text-xs text-muted">{LEVELS[id].desc}</span>
                  </span>
                  {on && <span className="text-xs font-bold text-red">Одоогийн</span>}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <div className="mt-7">
        <InstallApp />
      </div>
      <form action={logout} className="mt-8">
        <button className="btn btn-ghost">Гарах</button>
      </form>
    </>
  );
}
