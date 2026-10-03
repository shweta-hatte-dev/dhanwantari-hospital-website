import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-2xl font-bold text-brand-900">Sign in</h1>
      <div className="card mt-6"><LoginForm /></div>
      <p className="mt-4 text-sm text-slate-600">
        New patient? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
