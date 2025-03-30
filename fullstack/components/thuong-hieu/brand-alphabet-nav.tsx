"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface BrandAlphabetNavProps {
  activeLetter?: string
}

export function BrandAlphabetNav({ activeLetter }: BrandAlphabetNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleLetterClick = (letter: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Nếu đang chọn lại cùng một chữ cái, bỏ chọn
    if (letter === activeLetter) {
      params.delete("letter")
    } else {
      params.set("letter", letter)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Tạo mảng chữ cái từ A-Z
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

  return (
    <div className="my-6">
      <ScrollArea className="whitespace-nowrap pb-3">
        <div className="flex space-x-1">
          {alphabet.map((letter) => (
            <Button
              key={letter}
              variant="outline"
              size="sm"
              className={cn(
                "w-8 h-8 rounded-full p-0",
                letter.toLowerCase() === activeLetter?.toLowerCase() &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              )}
              onClick={() => handleLetterClick(letter.toLowerCase())}
            >
              {letter}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

