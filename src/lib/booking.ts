import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isValidSlotStart } from "@/lib/slots";
import { notify } from "@/lib/notify";

export class BookingError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409,
  ) {
    super(message);
  }
}

const ACTIVE_STATUSES = ["BOOKED", "CONFIRMED", "COMPLETED"] as const;

export async function createAppointment(input: {
  doctorId: string;
  patientId: string;
  startsAt: Date;
  reason: string;
}) {
  const doctor = await db.doctor.findUnique({
    where: { id: input.doctorId },
    include: { schedules: true, user: true },
  });
  if (!doctor) throw new BookingError("Doctor not found", 404);

  if (input.startsAt <= new Date()) throw new BookingError("Choose a time in the future", 400);
  if (!isValidSlotStart({ startsAt: input.startsAt, windows: doctor.schedules, slotMinutes: doctor.slotMinutes })) {
    throw new BookingError("That time is not an available slot for this doctor", 400);
  }

  const endsAt = new Date(input.startsAt.getTime() + doctor.slotMinutes * 60_000);

  try {
    const appointment = await db.$transaction(
      async (tx) => {
        const clash = await tx.appointment.findFirst({
          where: {
            doctorId: input.doctorId,
            status: { in: [...ACTIVE_STATUSES] },
            startsAt: { lt: endsAt },
            endsAt: { gt: input.startsAt },
          },
        });
        if (clash) throw new BookingError("This slot has just been booked. Please pick another.", 409);
        return tx.appointment.create({
          data: { doctorId: input.doctorId, patientId: input.patientId, startsAt: input.startsAt, endsAt, reason: input.reason },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    const patient = await db.user.findUnique({ where: { id: input.patientId } });
    if (patient) {
      void notify({
        to: patient.email,
        channel: "EMAIL",
        subject: "Appointment booked",
        body: `Your appointment with ${doctor.user.name} is booked for ${input.startsAt.toISOString()}.`,
      }).catch(() => undefined);
    }
    return appointment;
  } catch (e) {
    if (e instanceof BookingError) throw e;
    // Unique-index violation (parallel request) or serialization failure => someone else got the slot.
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2002" || e.code === "P2034")) {
      throw new BookingError("This slot has just been booked. Please pick another.", 409);
    }
    throw e;
  }
}
