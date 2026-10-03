"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatTime, todayInHospital } from "@/lib/format";

interface DoctorOption { id: string; name: string; department: string }
interface PatientOption { id: string; name: string; email: string }

export default function BookingForm({
  doctors,
  initialDoctorId,
  patients,
}: {
  doctors: DoctorOption[];
  initialDoctorId?: string;
  patients?: PatientOption[]; // provided only for receptionist/admin
}) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(initialDoctorId ?? doctors[0]?.id ?? "");
  const [date, setDate] = useState(todayInHospital());
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadSlots() {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setSlot("");
    const res = await fetch(`/api/slots?doctorId=${encodeURIComponent(doctorId)}&date=${date}`);
    const data = await res.json().catch(() => ({ slots: [] }));
    setSlots(res.ok ? data.slots : []);
    setLoadingSlots(false);
  }

  useEffect(() => {
    void loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) {
      setMessage({ type: "error", text: "Please choose a time slot." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        startsAt: slot,
        reason: form.get("reason"),
        ...(patients ? { patientId: form.get("patientId") } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Booking failed" });
      await loadSlots(); // refresh in case the slot was taken
      return;
    }
    setMessage({ type: "ok", text: "Appointment booked! Redirecting to your dashboard..." });
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {patients && (
        <div>
          <label htmlFor="patientId" className="mb-1 block text-sm font-medium">Patient</label>
          <select id="patientId" name="patientId" required className="input">
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="doctorId" className="mb-1 block text-sm font-medium">Doctor</label>
        <select id="doctorId" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="input">
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} - {d.department}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium">Date</label>
        <input id="date" type="date" min={todayInHospital()} value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Available times (India time)</legend>
        {loadingSlots ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-500">No free slots on this date. Try another day.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSlot(s)}
                aria-pressed={slot === s}
                className={`rounded-lg border px-3 py-1.5 text-sm ${slot === s ? "border-brand-600 bg-brand-600 text-white" : "hover:bg-brand-50"}`}
              >
                {formatTime(s)}
              </button>
            ))}
          </div>
        )}
      </fieldset>
      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-medium">Reason for visit</label>
        <textarea id="reason" name="reason" required minLength={3} maxLength={500} rows={3} className="input" />
      </div>
      {message && (
        <p role="alert" className={`text-sm ${message.type === "error" ? "text-red-600" : "text-brand-700"}`}>{message.text}</p>
      )}
      <button className="btn" disabled={busy || !doctors.length}>{busy ? "Booking..." : "Confirm booking"}</button>
    </form>
  );
}
