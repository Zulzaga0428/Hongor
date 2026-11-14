import Link from "next/link";
import { SignupForm } from "@/components/auth-forms";
import { Back, Page } from "@/components/ui";

export const metadata = { title: "Бүртгүүлэх — Япон хэл" };

export default function SignupPage() {
  return (
    <Page>
      <Back href="/" />
      <h1 className="text-2xl font-extrabold">Бүртгүүлэх</h1>
      <p className="mb-6 mt-1 text-sm text-muted">1 минут л болно. はじめまして！</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted">
        Бүртгэлтэй юу?{" "}
        <Link href="/nevtreh" className="font-extrabold text-red">
          Нэвтрэх
        </Link>
      </p>
    </Page>
  );
}
