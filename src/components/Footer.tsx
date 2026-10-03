import Link from "next/link";
import { hospital, navLinks } from "@/lib/hospital";

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-lg font-bold text-white">{hospital.name}</h2>
          <p className="mt-2 text-sm">{hospital.tagline}</p>
        </div>
        <div>
          <h3 className="font-semibold text-white">Quick links</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold text-white">Contact</h3>
          <p className="mt-2">{hospital.address}</p>
          <p>{hospital.phone}</p>
          <p>{hospital.email}</p>
        </div>
      </div>
      <p className="border-t border-brand-700 py-4 text-center text-xs">
        © {new Date().getFullYear()} {hospital.name}. Online booking is not for medical emergencies; call your local emergency number.
      </p>
    </footer>
  );
}
