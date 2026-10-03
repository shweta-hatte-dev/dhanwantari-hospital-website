// Central place for hospital details. Values come from environment variables so they can be
// changed without touching code. IMPORTANT: the defaults are placeholders, not verified facts.

export const hospital = {
  name: process.env.NEXT_PUBLIC_HOSPITAL_NAME ?? "Dhanwantari Hospital",
  phone: process.env.NEXT_PUBLIC_HOSPITAL_PHONE ?? "+91-00000-00000",
  email: process.env.NEXT_PUBLIC_HOSPITAL_EMAIL ?? "info@example.com",
  address: process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS ?? "Address to be verified",
  tagline: "Compassionate care, trusted by families",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/book", label: "Book Appointment" },
  { href: "/contact", label: "Contact" },
];
