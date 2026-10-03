import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-2xl font-bold text-brand-900">Create a patient account</h1>
      <div className="card mt-6"><RegisterForm /></div>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
