import type { Metadata } from "next";
import type { ReactNode } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juragan Mangga Reang",
  description:
    "Platform berbagi supplier buah mangga dari seluruh Nusantara.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Tambahan overflow-x-hidden agar halaman tidak bocor ke samping di HP */}
      <body className="flex min-h-screen flex-col bg-white text-stone-900 antialiased overflow-x-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Konten halaman */}
        <main className="flex-1 w-full max-w-full">{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}