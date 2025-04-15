"use client";

import { memo } from "react";
import type React from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for Header component to improve UX while loading
 */
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </header>
  );
}

/**
 * Skeleton for Footer component to improve UX while loading
 */
function FooterSkeleton() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/**
 * Main layout component for the shop
 * Uses React.memo to prevent unnecessary re-renders
 * Implements Suspense boundaries for a better loading experience
 */
export const MainLayout = memo(function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  );
});
