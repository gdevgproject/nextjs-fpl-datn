"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapPin, Map } from "lucide-react"

interface UserAddressStatsProps {
  addresses: Array<{
    id: string
    province_city: string
    is_default: boolean
  }>
}

export function UserAddressStats({ addresses }: UserAddressStatsProps) {
  // Tính toán thống kê
  const totalAddresses = addresses.length
  const defaultAddressCount = addresses.filter((a) => a.is_default).length

  // Tính phân bố địa lý
  const cityCounts: Record<string, number> = {}
  addresses.forEach((address) => {
    const city = address.province_city
    cityCounts[city] = (cityCounts[city] || 0) + 1
  })

  // Sắp xếp các thành phố theo số lượng địa chỉ (giảm dần)
  const sortedCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Lấy top 5 thành phố

  // Tính phần trăm cho mỗi thành phố
  const cityPercentages = sortedCities.map(([city, count]) => ({
    city,
    count,
    percentage: Math.round((count / totalAddresses) * 100),
  }))

  if (totalAddresses === 0) return null

  return (
    <Card className="bg-muted/40">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Tổng quan địa chỉ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Tổng số địa chỉ</div>
                <div className="text-2xl font-bold mt-1">{totalAddresses}</div>
              </div>
              <div className="bg-background p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Địa chỉ mặc định</div>
                <div className="text-2xl font-bold mt-1">{defaultAddressCount}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Map className="h-4 w-4 mr-1" />
              Phân bố địa lý
            </h3>
            <div className="space-y-2">
              {cityPercentages.map(({ city, count, percentage }) => (
                <div key={city} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{city}</span>
                    <span>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

