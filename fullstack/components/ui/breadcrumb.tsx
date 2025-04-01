<<<<<<< HEAD
import type * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode
  children: React.ReactNode
}
=======
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn("flex flex-wrap items-center text-sm text-muted-foreground", className)}
    {...props}
  />
))
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5 break-words", className)} {...props} />
  ),
)
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  ),
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorElement & {
    asChild?: boolean
    isCurrentPage?: boolean
  }
>(({ asChild, isCurrentPage, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"
>>>>>>> feat/lich-su-don-hang-tk

export function Breadcrumb({ separator = <ChevronRight className="h-4 w-4" />, className, ...props }: BreadcrumbProps) {
  return (
<<<<<<< HEAD
    <nav
      aria-label="breadcrumb"
      className={cn("flex flex-wrap items-center text-sm text-muted-foreground", className)}
=======
    <Comp
      aria-current={isCurrentPage ? "page" : undefined}
      className={cn(
        "transition-colors hover:text-foreground",
        isCurrentPage ? "font-medium text-foreground pointer-events-none" : "",
        className,
      )}
>>>>>>> feat/lich-su-don-hang-tk
      {...props}
      ref={ref}
    />
  )
<<<<<<< HEAD
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
=======
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => <span ref={ref} className={cn("text-muted-foreground", className)} {...props} />,
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  ),
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis }
>>>>>>> feat/lich-su-don-hang-tk

