import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9][0-9\s-]{7,17}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72)
    .regex(/[A-Za-z]/, "Must contain a letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

export const bookingSchema = z.object({
  doctorId: z.string().min(1),
  startsAt: z.string().datetime(),
  reason: z.string().trim().min(3).max(500),
  patientId: z.string().min(1).optional(), // receptionist/admin booking on behalf of a patient
});

export const slotsQuerySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

export const scheduleSchema = z.object({
  doctorId: z.string().min(1),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const staffCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["RECEPTIONIST", "DOCTOR", "ADMIN"]),
});
