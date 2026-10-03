"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { hospital, navLinks } from "@/lib/hospital";

export default function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">+</span>
          {hospital.name}
        </Link>

        <button
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>

        <nav id="main-nav" className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-3 border-b bg-white p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700 hover:text-brand-700">
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link href="/dashboard" className="btn-outline" onClick={() => setOpen(false)}>Dashboard</Link>
              <button className="text-sm font-medium text-slate-600 hover:text-red-600" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn" onClick={() => setOpen(false)}>Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
