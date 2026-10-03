import Link from "next/link";
import Hero3D from "@/components/Hero3D";
import { hospital } from "@/lib/hospital";

const highlights = [
  { title: "Experienced doctors", text: "Consult specialists across multiple departments." },
  { title: "Easy online booking", text: "Pick a doctor, choose a free slot, and confirm in a minute." },
  { title: "Reminders", text: "Get appointment notifications once messaging is configured." },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div className="reveal">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Welcome to</p>
            <h1 className="mt-2 text-4xl font-extrabold text-brand-900 md:text-5xl">{hospital.name}</h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600">{hospital.tagline}. Book your visit online in a few clicks.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn">Book an appointment</Link>
              <Link href="/doctors" className="btn-outline">Meet our doctors</Link>
            </div>
          </div>
          <div className="flex justify-center py-8">
            <Hero3D />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold text-brand-900">Why choose us</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="card reveal">
              <h3 className="font-semibold text-brand-700">{h.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{h.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
