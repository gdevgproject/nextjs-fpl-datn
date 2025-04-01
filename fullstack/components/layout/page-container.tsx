import { cn } from "@/lib/utils"
import type React from "react"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  fullWidth?: boolean
}

export function PageContainer({ children, className, as: Component = "div", fullWidth = false }: PageContainerProps) {
  return (
    <Component className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", fullWidth ? "max-w-full" : "max-w-7xl", className)}>
      {children}
    </Component>
  )
}

