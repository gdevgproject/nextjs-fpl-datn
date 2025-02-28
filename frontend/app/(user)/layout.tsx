"use client";

import type React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} brands={[]} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
