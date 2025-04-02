import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Breadcrumb {
  title: string
  href: string
}

interface PageHeaderProps {
  heading: string
  description?: string
  breadcrumbs?: Breadcrumb[]
}

export function PageHeader({ heading, description, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-1 h-4 w-4" />}
              <Link
                href={breadcrumb.href}
                className={index === breadcrumbs.length - 1 ? "font-medium text-foreground" : "hover:text-foreground"}
              >
                {breadcrumb.title}
              </Link>
            </div>
          ))}
        </nav>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

