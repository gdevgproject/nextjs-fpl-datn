"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface SaleCountdownProps {
  endDate: Date
  title: string
  description: string
}

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function SaleCountdown({ endDate, title, description }: SaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        // Sale has ended
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    // Clean up
    return () => clearInterval(timer)
  }, [endDate])

  return (
    <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-200 dark:border-red-950">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400">{title}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <div className="flex flex-col items-center">
            <div className="bg-background w-full aspect-square rounded-md flex items-center justify-center shadow-sm">
              <span className="text-xl md:text-3xl font-bold">{timeLeft.days}</span>
            </div>
            <span className="text-xs md:text-sm mt-1 text-muted-foreground">Ngày</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-background w-full aspect-square rounded-md flex items-center justify-center shadow-sm">
              <span className="text-xl md:text-3xl font-bold">{timeLeft.hours}</span>
            </div>
            <span className="text-xs md:text-sm mt-1 text-muted-foreground">Giờ</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-background w-full aspect-square rounded-md flex items-center justify-center shadow-sm">
              <span className="text-xl md:text-3xl font-bold">{timeLeft.minutes}</span>
            </div>
            <span className="text-xs md:text-sm mt-1 text-muted-foreground">Phút</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-background w-full aspect-square rounded-md flex items-center justify-center shadow-sm">
              <span className="text-xl md:text-3xl font-bold">{timeLeft.seconds}</span>
            </div>
            <span className="text-xs md:text-sm mt-1 text-muted-foreground">Giây</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

