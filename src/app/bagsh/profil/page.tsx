import { logout } from "@/app/actions";
import { requireTeacher } from "@/server/auth";
import { Hinomaru } from "@/components/ui";
import { InstallApp } from "@/components/pwa";

export default async function TeacherProfile() {
  const t = await requireTeacher();
  return (
    <>
      <div className="flex items-center gap-4">
        <Hinomaru size={64}>先</Hinomaru>
        <div>
          <h1 className="text-2xl font-bold lg:text-[28px]">{t.name}</h1>
          <p className="text-sm text-muted">Багш · +976 {t.phone}</p>
        </div>
      </div>
      <div className="mt-7">
        <InstallApp />
      </div>
      <form action={logout} className="mt-8">
        <button className="btn btn-ghost">Гарах</button>
      </form>
    </>
  );
}
