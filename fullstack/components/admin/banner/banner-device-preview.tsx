"use client"

import Image from "next/image"
import { Smartphone, Tablet, Monitor } from "lucide-react"

interface BannerDevicePreviewProps {
  title: string
  subtitle?: string
  imageUrl: string
  device: "desktop" | "tablet" | "mobile"
}

export function BannerDevicePreview({ title, subtitle, imageUrl, device }: BannerDevicePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        {device === "desktop" && <Monitor className="h-5 w-5 text-muted-foreground mr-2" />}
        {device === "tablet" && <Tablet className="h-5 w-5 text-muted-foreground mr-2" />}
        {device === "mobile" && <Smartphone className="h-5 w-5 text-muted-foreground mr-2" />}
        <span className="text-sm font-medium">
          {device === "desktop" && "Xem trên máy tính"}
          {device === "tablet" && "Xem trên máy tính bảng"}
          {device === "mobile" && "Xem trên điện thoại"}
        </span>
      </div>

      <div
        className={`
        mx-auto border rounded-md overflow-hidden bg-white
        ${device === "desktop" ? "w-full" : ""}
        ${device === "tablet" ? "w-[600px] max-w-full" : ""}
        ${device === "mobile" ? "w-[320px] max-w-full" : ""}
      `}
      >
        <div className="bg-gray-100 p-2 border-b flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="flex-1 mx-2">
            <div className="w-full h-4 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="p-2">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="w-24 h-6 bg-gray-200 rounded"></div>
            <div className="flex space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="p-2 space-y-4">
            <div className="relative">
              {imageUrl ? (
                <div className="relative aspect-[3/1] rounded overflow-hidden">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={title || "Banner preview"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-4">
                    {title && (
                      <h3 className={`font-bold text-white ${device === "mobile" ? "text-sm" : "text-xl"}`}>{title}</h3>
                    )}
                    {subtitle && (
                      <p className={`text-white/80 mt-1 ${device === "mobile" ? "text-xs" : "text-sm"}`}>{subtitle}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/1] bg-gray-200 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Chưa có hình ảnh</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="aspect-square bg-gray-200 rounded"></div>
                  <div className="w-full h-3 bg-gray-200 rounded"></div>
                  <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

