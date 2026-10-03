"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";

export interface AppointmentRow {
  id: string;
  startsAt: string;
  status: string;
  reason: string;
  doctorName: string;
  patientName: string;
}

export type AppointmentAction = {
  label: string;
  status: string;
};

type AppointmentTableProps = {
  rows: AppointmentRow[];
  actionsByStatus?: Record<string, AppointmentAction[]>;
  empty?: string;
};

const statusStyle: Record<string, string> = {
  BOOKED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-amber-100 text-amber-800",
};

export default function AppointmentTable({
  rows,
  actionsByStatus = {},
  empty = "No appointments yet.",
}: AppointmentTableProps) {
  const router = useRouter();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateAppointment(id: string, status: string) {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        setError(
          typeof data?.error === "string"
            ? data.error
            : "Unable to update appointment."
        );

        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="py-3 pr-4">When</th>
            <th className="py-3 pr-4">Doctor</th>
            <th className="py-3 pr-4">Patient</th>
            <th className="py-3 pr-4">Reason</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((appointment) => {
            const actions =
              actionsByStatus[appointment.status] ?? [];

            const isBusy = busyId === appointment.id;

            return (
              <tr
                key={appointment.id}
                className="border-b border-slate-100 align-top transition-colors hover:bg-slate-50"
              >
                <td className="whitespace-nowrap py-3 pr-4">
                  {formatDateTime(appointment.startsAt)}
                </td>

                <td className="py-3 pr-4">
                  {appointment.doctorName}
                </td>

                <td className="py-3 pr-4">
                  {appointment.patientName}
                </td>

                <td
                  className="max-w-[220px] truncate py-3 pr-4"
                  title={appointment.reason}
                >
                  {appointment.reason}
                </td>

                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusStyle[appointment.status] ??
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {appointment.status.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {actions.length === 0 ? (
                      <span className="text-xs text-slate-400">
                        —
                      </span>
                    ) : (
                      actions.map((action) => (
                        <button
                          key={`${appointment.id}-${action.status}`}
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateAppointment(
                              appointment.id,
                              action.status
                            )
                          }
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? "Updating..." : action.label}
                        </button>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}