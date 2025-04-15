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
      <div className="container flex flex-col gap-0 px-2 sm:px-4 xl:px-8 2xl:px-16 animate-pulse">
        {/* Top bar skeleton */}
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-[48px]">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full md:hidden" />
          </div>
        </div>
        {/* Search bar skeleton */}
        <div className="block md:hidden w-full py-2">
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
        {/* Menu bar skeleton */}
        <div className="hidden md:flex gap-2 sm:gap-4 justify-center border-t bg-background/80 backdrop-blur py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
        {/* Search bar inline skeleton on md+ */}
        <div className="hidden md:flex w-full justify-center py-2">
          <Skeleton className="h-9 w-full max-w-2xl rounded-full" />
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
    <footer className="border-t bg-background py-8 animate-pulse">
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
