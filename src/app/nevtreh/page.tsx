import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { Back, Hinomaru, Page } from "@/components/ui";

export const metadata = { title: "Нэвтрэх — Япон хэл" };

export default function LoginPage() {
  return (
    <Page>
      <Back href="/" />
      <div className="mb-6 flex items-center gap-3">
        <Hinomaru size={52} />
        <div>
          <h1 className="text-2xl font-extrabold">Тавтай морил</h1>
          <p className="text-sm text-muted">Утасны дугаар, нууц кодоороо нэвтэр</p>
        </div>
      </div>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">
        Бүртгэлгүй юу?{" "}
        <Link href="/burtgel" className="font-extrabold text-red">
          Бүртгүүлэх
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">Нууц кодоо мартсан бол багшдаа хандана уу.</p>
    </Page>
  );
}
