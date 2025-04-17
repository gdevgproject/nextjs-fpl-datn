"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Maximize2, Minimize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserAddressMapProps {
  addresses: Array<{
    id: string
    recipient_name: string
    recipient_phone: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
  }>
  onAddressSelect: (address: any) => void
}

export function UserAddressMap({ addresses, onAddressSelect }: UserAddressMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  // Giả lập việc hiển thị bản đồ
  // Trong thực tế, sẽ sử dụng thư viện bản đồ như Google Maps, Mapbox, Leaflet, v.v.

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleAddressSelect = (address: any) => {
    setSelectedAddressId(address.id)
    onAddressSelect(address)
  }

  return (
    <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6" : ""}`}>
      <div className="absolute top-4 right-4 z-10">
        <Button variant="outline" size="icon" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isFullscreen ? "h-full" : ""}`}>
        <div className="md:col-span-1 space-y-2 overflow-auto max-h-[500px] pr-2">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-all ${selectedAddressId === address.id ? "border-primary" : ""}`}
              onClick={() => handleAddressSelect(address)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{address.recipient_name}</span>
                      {address.is_default && (
                        <Badge variant="outline" className="text-xs border-primary text-primary">
                          Mặc định
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground">{address.recipient_phone}</div>
                    <div className="mt-1">
                      {address.street_address}, {address.ward}, {address.district}, {address.province_city}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div
          className={`md:col-span-2 bg-muted rounded-lg flex items-center justify-center ${isFullscreen ? "h-full" : "h-[500px]"}`}
        >
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Bản đồ mô phỏng</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Đây là vị trí mô phỏng cho địa chỉ được chọn.
              <br />
              Trong ứng dụng thực tế, sẽ hiển thị bản đồ thực với vị trí chính xác.
            </p>
            {selectedAddressId && (
              <div className="mt-4 p-4 bg-background rounded-lg max-w-md mx-auto text-left">
                <h4 className="font-medium">Thông tin địa chỉ đã chọn:</h4>
                {addresses
                  .filter((a) => a.id === selectedAddressId)
                  .map((address) => (
                    <div key={address.id} className="mt-2 text-sm">
                      <p>
                        <span className="font-medium">Người nhận:</span> {address.recipient_name}
                      </p>
                      <p>
                        <span className="font-medium">Số điện thoại:</span> {address.recipient_phone}
                      </p>
                      <p>
                        <span className="font-medium">Địa chỉ:</span> {address.street_address}, {address.ward},{" "}
                        {address.district}, {address.province_city}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

