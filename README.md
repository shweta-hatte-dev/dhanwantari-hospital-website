# Dhanwantari Hospital Website

A full-stack hospital website with online appointment booking, built with Next.js, TypeScript, Prisma and PostgreSQL.

> **Important:** all hospital details (address, phone, email, doctors, departments) in this project are **placeholders / demo data**. Replace them with verified information before going live (see section 15).

## 1. What the website does

- Public pages: Home (animated CSS 3D hero), Departments, Doctors, Contact.
- Patients register, sign in, browse free time slots and book or cancel appointments.
- Doctors see their own appointments and confirm, complete, mark no-show or cancel.
- Receptionists see all appointments and can book on behalf of a patient.
- Admins see statistics, create staff accounts and see all appointments.
- Double booking is prevented in the application (serializable transaction) **and** in the database (partial unique index).

## 2. Technology stack

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL 16, NextAuth (credentials, JWT sessions), Zod validation, bcryptjs password hashing, Vitest tests, Docker Compose (database only).

## 3. Folder structure

```
dhanwantari-hospital-website/
├─ prisma/
│  ├─ schema.prisma            database models
│  ├─ migrations/              SQL migration (includes double-booking index)
│  └─ seed.ts                  demo data
├─ src/
│  ├─ app/                     pages and API routes
│  │  ├─ api/                  auth, register, slots, appointments, admin
│  │  ├─ dashboard/            patient, doctor, reception, admin dashboards
│  │  ├─ book/ doctors/ departments/ contact/ login/ register/
│  ├─ components/              reusable UI (Header, Footer, Hero3D, BookingForm, ...)
│  ├─ lib/                     slots, booking, auth, validation, notifications, ...
│  ├─ middleware.ts            protects /dashboard
│  └─ types/
├─ tests/                      unit tests and a database integration test
├─ docker-compose.yml          local PostgreSQL
├─ .env.example                template for your private .env
└─ package.json
```

## 4. Software to install first (Windows)

1. **Node.js 20 LTS or newer**: https://nodejs.org (choose the LTS installer). Check with `node -v`.
2. **VS Code**: https://code.visualstudio.com
3. **Docker Desktop** (easiest way to get PostgreSQL): https://www.docker.com/products/docker-desktop
   (Alternative: install PostgreSQL 16 directly and create a database and user yourself.)

## 5. Open the project in VS Code

1. Extract `dhanwantari-hospital-website.zip` (right-click, Extract All).
2. Open VS Code, choose **File > Open Folder**, and select the extracted `dhanwantari-hospital-website` folder.
3. Open a terminal: **Terminal > New Terminal** (PowerShell is fine).

## 6. Install dependencies

```powershell
npm install
```

## 7. Create your `.env` file

```powershell
Copy-Item .env.example .env
```

Open `.env` in VS Code and set:

- `NEXTAUTH_SECRET`: a long random value. Generate one with:
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
  ```
- `SEED_DEMO_PASSWORD`: the password that all demo accounts will use (min 8 characters).
- `DATABASE_URL`: leave as is if you use the included Docker Compose database. If you change the database password in `docker-compose.yml`, change it here too.

Never share or commit `.env`.

## 8. Start PostgreSQL

Start Docker Desktop, wait until it says it is running, then:

```powershell
docker compose up -d
```

Check it is running with `docker ps` (you should see `dhanwantari-db`).

## 9. Create the database tables (Prisma migration)

```powershell
npx prisma generate
npx prisma migrate deploy
```

(`npx prisma migrate dev` also works and is the right command while you change the schema.)

## 10. Add demo data

```powershell
npm run db:seed
```

Demo accounts (all use the password you set as `SEED_DEMO_PASSWORD`):

| Role | Email |
|------|-------|
| Admin | admin@example.com |
| Receptionist | reception@example.com |
| Patient | patient@example.com |
| Doctors | dr.sharma@example.com, dr.patil@example.com, dr.kulkarni@example.com, dr.joshi@example.com |

Doctors work Monday to Saturday, 10:00-13:00 and 17:00-19:00 (India time), 30-minute slots.

## 11. Run the website

```powershell
npm run dev
```

Open http://localhost:3000.

## 12. Use the dashboards

Sign in at http://localhost:3000/login. After login you are sent to the dashboard for your role:

- Patient: `/dashboard/patient`
- Doctor: `/dashboard/doctor`
- Receptionist: `/dashboard/reception`
- Admin: `/dashboard/admin`

## 13. Test appointment booking

1. Sign in as `patient@example.com`.
2. Go to **Book Appointment**, choose a doctor and a date (not a Sunday), pick a time, enter a reason and confirm.
3. The slot disappears for everyone. Try booking the same slot as another user: it is refused.
4. Sign in as that doctor (for example `dr.sharma@example.com`) and confirm or complete the appointment.
5. Sign in as `reception@example.com` to book on behalf of a patient.

## 14. Automated tests, build, deployment

```powershell
npm run typecheck     # TypeScript
npm run lint          # ESLint
npm test              # unit tests (slots, validation); DB test is skipped by default
npm run build         # production build
npm run start         # run the production build locally
```

To also run the double-booking database test (uses your dev database):

```powershell
$env:TEST_DATABASE_URL = "postgresql://dhanwantari:change_me_db_password@localhost:5432/dhanwantari?schema=public"
npm test
```

**Deploying:** any host that runs Node.js works (for example Vercel, Railway, Render or a VPS) with a managed PostgreSQL database.

1. Set the environment variables from `.env.example` on the host (`DATABASE_URL`, `NEXTAUTH_URL` = your real https URL, `NEXTAUTH_SECRET`, hospital details).
2. Run `npx prisma migrate deploy` against the production database.
3. Run the seed **only** if you want demo data; otherwise create the first admin manually (see below).
4. Build with `npm run build` and start with `npm run start`.

Creating the first real admin without demo data: run the seed once, sign in as `admin@example.com`, create your real admin account in the Admin dashboard, then remove the demo accounts in the database (`npx prisma studio`).

## 15. External integrations that need credentials

| Integration | Needed | Status in this project |
|-------------|--------|------------------------|
| PostgreSQL | `DATABASE_URL` | Required |
| NextAuth | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Required |
| SMS | `SMS_WEBHOOK_URL`, `SMS_WEBHOOK_TOKEN` | Generic HTTP webhook; works with a provider's HTTP gateway |
| Email | `SMTP_*` | **Not wired up.** Messages are saved to the `Notification` table and logged. Install `nodemailer` and add sending in `src/lib/notify.ts` |

Without credentials, notifications are logged and stored only. Nothing is sent.

## 16. Change the hospital's verified information

- Name, phone, email, address: edit the `NEXT_PUBLIC_HOSPITAL_*` values in `.env` (restart `npm run dev`).
- Tagline and navigation: `src/lib/hospital.ts`.
- Departments, doctors, working hours, fees: edit `prisma/seed.ts` and re-run `npm run db:seed`, or edit data with `npx prisma studio`.
- The demo doctors use names like "Dr. Demo ..." and the text "demo data". Replace them with real, verified doctors and qualifications.
- Timezone: slots are generated for India Standard Time (`HOSPITAL_UTC_OFFSET_MINUTES` in `src/lib/slots.ts`, `TZ` in `src/lib/format.ts`).

## Notes and limitations

- The "3D" hero is a CSS 3D animation with no external model files. If you want a real 3D model (glTF), add `three` and `@react-three/fiber` and place the model in `public/models/`.
- The rate limiter is in memory (single server). Use a shared store such as Redis for multi-server deployments.
- This is a booking system, not a clinical records system. Do not store medical records in it without a proper security and compliance review (for India, review the DPDP Act requirements).
