import type { ReactNode } from "react"

interface AuthHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
}

export function AuthHeader({ title, description, icon }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 text-center mb-6">
      {icon && <div className="rounded-full bg-primary/10 p-3 mb-2">{icon}</div>}
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

