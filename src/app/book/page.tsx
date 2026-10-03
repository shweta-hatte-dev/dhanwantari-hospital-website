import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import BookingForm from "@/components/BookingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Book an appointment" };

export default async function BookPage({ searchParams }: { searchParams: { doctorId?: string } }) {
  const session = await getSession();
  const role = session?.user?.role;

  const doctors = await db.doctor.findMany({
    include: { user: { select: { name: true } }, department: true },
    orderBy: { user: { name: "asc" } },
  });
  const options = doctors.map((d) => ({ id: d.id, name: d.user.name, department: d.department.name }));

  const patients =
    role === "RECEPTIONIST" || role === "ADMIN"
      ? await db.user.findMany({ where: { role: "PATIENT" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" }, take: 500 })
      : undefined;

  const canBook = !session?.user || role === "PATIENT" || role === "RECEPTIONIST" || role === "ADMIN";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Book an appointment</h1>
      {!session?.user && (
        <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm">
          You can browse available times now. You will need to <Link href="/login" className="font-semibold underline">sign in</Link> or{" "}
          <Link href="/register" className="font-semibold underline">register</Link> to confirm.
        </p>
      )}
      {!canBook ? (
        <p className="mt-6 text-slate-600">Doctors cannot book appointments for themselves. Use your dashboard.</p>
      ) : options.length === 0 ? (
        <p className="mt-6 text-slate-600">No doctors are available yet. Run the seed script (see README).</p>
      ) : (
        <div className="card mt-6">
          <BookingForm doctors={options} initialDoctorId={searchParams.doctorId} patients={patients} />
        </div>
      )}
    </div>
  );
}
