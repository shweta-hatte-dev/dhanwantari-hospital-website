import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/session";
import { staffCreateSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const admin = await apiUser(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = staffCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { name, email, password, role } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
  const user = await db.user.create({
    data: { name, email, role, passwordHash: await bcrypt.hash(password, 12) },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
