"use client"

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
        "flex items-center gap-3 px-4 py-3 text-sm text-grayscale-90 transition-colors hover:bg-primary-5/10",
        isActive && "bg-primary-5/10 rounded-tl-[8px] rounded-bl-[8px]",
        className,
      )}
      onMouseEnter={onMouseEnter}
    >
      {icon && (
        <div className="flex h-5 w-5 items-center justify-center">
          <Image src={icon || "/placeholder.svg"} alt="" width={20} height={20} className="h-5 w-5 text-black" />
        </div>
      )}
      <span>{label}</span>
    </Link>
  )
}

