import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const departments = [
  { name: "General Medicine", slug: "general-medicine", description: "Primary care, fevers, infections and long-term conditions." },
  { name: "Paediatrics", slug: "paediatrics", description: "Healthcare for infants, children and adolescents." },
  { name: "Orthopaedics", slug: "orthopaedics", description: "Bones, joints, fractures and sports injuries." },
  { name: "Gynaecology", slug: "gynaecology", description: "Women's health, pregnancy care and counselling." },
  { name: "Ayurveda", slug: "ayurveda", description: "Traditional Ayurvedic consultation and therapies." },
];

const doctors = [
  { name: "Dr. Demo Sharma", email: "dr.sharma@example.com", dept: "general-medicine", qualification: "MBBS, MD (demo data)", bio: "Demo profile. Replace with verified doctor details.", fee: 500 },
  { name: "Dr. Demo Patil", email: "dr.patil@example.com", dept: "paediatrics", qualification: "MBBS, DCH (demo data)", bio: "Demo profile. Replace with verified doctor details.", fee: 600 },
  { name: "Dr. Demo Kulkarni", email: "dr.kulkarni@example.com", dept: "orthopaedics", qualification: "MBBS, MS Ortho (demo data)", bio: "Demo profile. Replace with verified doctor details.", fee: 700 },
  { name: "Dr. Demo Joshi", email: "dr.joshi@example.com", dept: "ayurveda", qualification: "BAMS (demo data)", bio: "Demo profile. Replace with verified doctor details.", fee: 400 },
];

async function main() {
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("Set SEED_DEMO_PASSWORD (min 8 characters) in your .env file before seeding.");
  }
  const passwordHash = await bcrypt.hash(password, 12);

  for (const d of departments) {
    await prisma.department.upsert({ where: { slug: d.slug }, update: d, create: d });
  }

  const staff: { name: string; email: string; role: Role }[] = [
    { name: "Demo Admin", email: "admin@example.com", role: "ADMIN" },
    { name: "Demo Receptionist", email: "reception@example.com", role: "RECEPTIONIST" },
    { name: "Demo Patient", email: "patient@example.com", role: "PATIENT" },
  ];
  for (const s of staff) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, role: s.role },
      create: { ...s, passwordHash },
    });
  }

  for (const d of doctors) {
    const dept = await prisma.department.findUniqueOrThrow({ where: { slug: d.dept } });
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: { name: d.name, role: "DOCTOR" },
      create: { name: d.name, email: d.email, role: "DOCTOR", passwordHash },
    });
    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: { departmentId: dept.id, qualification: d.qualification, bio: d.bio, consultationFee: d.fee },
      create: {
        userId: user.id,
        departmentId: dept.id,
        qualification: d.qualification,
        bio: d.bio,
        consultationFee: d.fee,
        slotMinutes: 30,
      },
    });
    // Monday to Saturday, 10:00-13:00 and 17:00-19:00
    for (let weekday = 1; weekday <= 6; weekday++) {
      for (const [startTime, endTime] of [["10:00", "13:00"], ["17:00", "19:00"]]) {
        await prisma.doctorSchedule.upsert({
          where: { doctorId_weekday_startTime: { doctorId: doctor.id, weekday, startTime } },
          update: { endTime },
          create: { doctorId: doctor.id, weekday, startTime, endTime },
        });
      }
    }
  }

  console.log("Seed complete. Demo logins use the password from SEED_DEMO_PASSWORD.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
