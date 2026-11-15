import Link from "next/link";
import { SignupForm } from "@/components/auth-forms";
import { AuthLayout } from "@/components/site/auth-layout";
import { BRAND } from "@/content/site";

export const metadata = { title: `Бүртгүүлэх — ${BRAND.name}` };

export default function SignupPage() {
  return (
    <AuthLayout
      title="Бүртгүүлэх"
      subtitle="1 минут л болно. Үнэгүй."
      footer={
        <>
          Бүртгэлтэй юу?{" "}
          <Link href="/nevtreh" className="font-bold text-brand">
            Нэвтрэх
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
