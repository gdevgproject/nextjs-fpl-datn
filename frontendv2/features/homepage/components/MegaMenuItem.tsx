"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/helpers"

interface MegaMenuItemProps {
  label: string
  href: string
  hasDropdown?: boolean
  isActive?: boolean
  children?: React.ReactNode
}

export default function MegaMenuItem({ label, href, hasDropdown, isActive, children }: MegaMenuItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-1 text-xl font-medium text-black hover:text-primary-40",
          isActive && "text-primary-40",
        )}
      >
        {label}
        {hasDropdown && <ChevronDown className="h-4 w-4" />}
      </Link>

      {hasDropdown && isHovered && (
        <div className="absolute left-0 top-full z-50 min-w-[1000px] rounded-bl-xl rounded-br-xl bg-white p-6 shadow-lg">
          {children}
        </div>
      )}
    </div>
  )
}

