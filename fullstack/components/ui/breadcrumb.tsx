import type * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode
  children: React.ReactNode
}

export function Breadcrumb({ separator = <ChevronRight className="h-4 w-4" />, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex flex-wrap items-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export interface BreadcrumbListProps extends React.ComponentPropsWithoutRef<"ol"> {
  children: React.ReactNode
}

export function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return <ol className={cn("flex flex-wrap items-center gap-1.5 sm:gap-2.5", className)} {...props} />
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {
  children: React.ReactNode
}

export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return <li className={cn("inline-flex items-center", className)} {...props} />
}

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean
  href?: string
  children: React.ReactNode
}

export function BreadcrumbLink({ asChild, className, href, children, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : "a"
  return (
    <Comp href={href} className={cn("transition-colors hover:text-foreground", className)} {...props}>
      {children}
    </Comp>
  )
}

export interface BreadcrumbSeparatorProps extends React.ComponentPropsWithoutRef<"li"> {
  children?: React.ReactNode
  separator?: React.ReactNode
}

export function BreadcrumbSeparator({ children, separator, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li className={cn("mx-1 flex items-center text-muted-foreground", className)} {...props}>
      {children || separator || <ChevronRight className="h-4 w-4" />}
    </li>
  )
}

export interface BreadcrumbEllipsisProps extends React.ComponentPropsWithoutRef<"span"> {
  children?: React.ReactNode
}

export function BreadcrumbEllipsis({ children, className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      {children || <MoreHorizontal className="h-4 w-4" />}
      <span className="sr-only">More</span>
    </span>
  )
}

