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

  return (
    <Comp
      aria-current={isCurrentPage ? "page" : undefined}
      className={cn(
        "transition-colors hover:text-foreground",
        isCurrentPage ? "font-medium text-foreground pointer-events-none" : "",
        className,
      )}
      {...props}
      ref={ref}
    />
  )
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

