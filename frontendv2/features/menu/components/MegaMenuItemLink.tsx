import Link from "next/link"
import Image from "next/image"
import { cn } from "@/utils/helpers"

interface MegaMenuItemLinkProps {
  href: string
  icon?: string
  label: string
  isActive?: boolean
  className?: string
  onMouseEnter?: () => void
}

export default function MegaMenuItemLink({
  href,
  icon,
  label,
  isActive,
  className,
  onMouseEnter,
}: MegaMenuItemLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-primary-5/5",
        isActive && "bg-primary-5/5",
        className,
      )}
      onMouseEnter={onMouseEnter}
    >
      {icon && (
        <div className="flex h-5 w-5 items-center justify-center">
          <Image src={icon || "/placeholder.svg"} alt="" width={20} height={20} className="h-5 w-5 text-primary-40" />
        </div>
      )}
      <span className={cn("flex-1", isActive && "text-primary-40")}>{label}</span>
    </Link>
  )
}

