import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./error";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Perfume Paradise",
  description: "Your destination for luxury fragrances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ErrorBoundary FallbackComponent={Error}>
          <Header categories={[]} brands={[]} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
