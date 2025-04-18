import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Info, AlertCircle, CheckCircle, HelpCircle } from "lucide-react"

export type FormNotificationType = "info" | "success" | "warning" | "help"

export interface FormNotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: FormNotificationType
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  help: HelpCircle,
}

const bgColorMap = {
  info: "bg-blue-50 dark:bg-blue-950",
  success: "bg-green-50 dark:bg-green-950",
  warning: "bg-amber-50 dark:bg-amber-950",
  help: "bg-purple-50 dark:bg-purple-950",
}

const textColorMap = {
  info: "text-blue-700 dark:text-blue-400",
  success: "text-green-700 dark:text-green-400",
  warning: "text-amber-700 dark:text-amber-400",
  help: "text-purple-700 dark:text-purple-400",
}

export function FormNotification({
  type = "info",
  title,
  description,
  icon,
  action,
  className,
  children,
  ...props
}: FormNotificationProps) {
  const IconComponent = icon || React.createElement(iconMap[type], { className: "h-4 w-4" })

  return (
    <div className={cn("mt-2 rounded-md p-3 text-sm", bgColorMap[type], className)} {...props}>
      {(title || icon) && (
        <div className={cn("flex items-center gap-2", textColorMap[type])}>
          {IconComponent}
          {title && <p>{title}</p>}
        </div>
      )}

      {description && <div className="mt-1 text-muted-foreground">{description}</div>}

      {action && <div className="mt-1">{action}</div>}

      {children}
    </div>
  )
}

// Tiện ích để tạo action link
export function FormNotificationLink({
  href,
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} className={cn("font-medium text-primary hover:underline", className)} {...props}>
      {children}
    </Link>
  )
}

