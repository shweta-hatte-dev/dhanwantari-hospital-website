import type { Metadata } from "next";
import { hospital } from "@/lib/hospital";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Contact us</h1>
      <dl className="mt-6 space-y-4">
        <div><dt className="text-sm font-semibold text-slate-500">Address</dt><dd>{hospital.address}</dd></div>
        <div><dt className="text-sm font-semibold text-slate-500">Phone</dt><dd>{hospital.phone}</dd></div>
        <div><dt className="text-sm font-semibold text-slate-500">Email</dt><dd>{hospital.email}</dd></div>
      </dl>
      <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
        For medical emergencies do not use online booking. Call your local emergency number or go to the nearest emergency department.
      </p>
    </div>
  );
}
