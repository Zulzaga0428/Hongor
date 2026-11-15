import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { AuthLayout } from "@/components/site/auth-layout";
import { BRAND } from "@/content/site";

export const metadata = { title: `Нэвтрэх — ${BRAND.name}` };

export default function LoginPage() {
  return (
    <AuthLayout
      title="Тавтай морил 👋"
      subtitle="Утасны дугаар, 4 оронтой нууц кодоороо нэвтэрнэ үү."
      footer={
        <>
          Бүртгэлгүй юу?{" "}
          <Link href="/burtgel" className="font-bold text-brand">
            Бүртгүүлэх
          </Link>
          <p className="mt-2 text-xs">Нууц кодоо мартсан бол хариуцсан ажилтандаа хандана уу.</p>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
