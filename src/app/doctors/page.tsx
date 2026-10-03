import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Doctors" };

export default async function DoctorsPage({ searchParams }: { searchParams: { department?: string } }) {
  const departments = await db.department.findMany({ orderBy: { name: "asc" } });
  const doctors = await db.doctor.findMany({
    where: searchParams.department ? { department: { slug: searchParams.department } } : undefined,
    include: { user: { select: { name: true } }, department: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Our doctors</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/doctors" className={`rounded-full border px-3 py-1 ${!searchParams.department ? "bg-brand-600 text-white" : ""}`}>All</Link>
        {departments.map((d) => (
          <Link key={d.id} href={`/doctors?department=${d.slug}`} className={`rounded-full border px-3 py-1 ${searchParams.department === d.slug ? "bg-brand-600 text-white" : ""}`}>
            {d.name}
          </Link>
        ))}
      </div>
      {doctors.length === 0 && <p className="mt-8 text-slate-600">No doctors found.</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((d) => (
          <div key={d.id} className="card">
            <h2 className="text-lg font-semibold text-brand-700">{d.user.name}</h2>
            <p className="text-sm text-slate-500">{d.department.name}</p>
            <p className="mt-2 text-sm">{d.qualification}</p>
            <p className="mt-2 text-sm text-slate-600">{d.bio}</p>
            <p className="mt-2 text-sm font-medium">Consultation fee: ₹{d.consultationFee}</p>
            <Link href={`/book?doctorId=${d.id}`} className="btn mt-4">Book appointment</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
