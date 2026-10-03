"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function StaffForm() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setBusy(true);
    setMsg(null);
    const f = new FormData(formEl);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: f.get("name"), email: f.get("email"), password: f.get("password"), role: f.get("role") }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? "Could not create user" });
    formEl.reset();
    setMsg({ ok: true, text: `Created ${data.user.role.toLowerCase()} account for ${data.user.email}.` });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      <input name="name" placeholder="Full name" required minLength={2} className="input" aria-label="Full name" />
      <input name="email" type="email" placeholder="Email" required className="input" aria-label="Email" />
      <input name="password" type="password" placeholder="Temporary password (min 8)" required minLength={8} className="input" aria-label="Temporary password" />
      <select name="role" className="input" aria-label="Role" defaultValue="RECEPTIONIST">
        <option value="RECEPTIONIST">Receptionist</option>
        <option value="ADMIN">Admin</option>
      </select>
      {msg && <p role="alert" className={`md:col-span-2 text-sm ${msg.ok ? "text-brand-700" : "text-red-600"}`}>{msg.text}</p>}
      <button className="btn md:col-span-2" disabled={busy}>{busy ? "Creating..." : "Create staff account"}</button>
    </form>
  );
}
