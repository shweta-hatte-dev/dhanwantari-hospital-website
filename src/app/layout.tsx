import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hospital } from "@/lib/hospital";

export const metadata: Metadata = {
  title: { default: hospital.name, template: `%s | ${hospital.name}` },
  description: `${hospital.name}: book appointments online with our doctors.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
