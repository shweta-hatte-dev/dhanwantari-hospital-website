import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const departments = await db.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { doctors: true } } },
  });
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Departments</h1>
      {departments.length === 0 && <p className="mt-6 text-slate-600">No departments yet. Run the seed script (see README).</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <div key={d.id} className="card">
            <h2 className="text-lg font-semibold text-brand-700">{d.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{d.description}</p>
            <p className="mt-3 text-xs text-slate-500">{d._count.doctors} doctor(s)</p>
            <Link href={`/doctors?department=${d.slug}`} className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
              View doctors
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
