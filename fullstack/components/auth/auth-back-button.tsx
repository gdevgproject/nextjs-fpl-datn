"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface AuthBackButtonProps {
  href?: string
  label?: string
}

export function AuthBackButton({ href, label = "Quay lại" }: AuthBackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute top-4 left-4 p-0 h-8 w-8 sm:h-auto sm:w-auto sm:px-2 sm:py-1"
      onClick={handleClick}
    >
      <ArrowLeft className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}

