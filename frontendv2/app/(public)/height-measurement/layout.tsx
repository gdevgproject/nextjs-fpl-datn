import type { ReactNode } from "react"

export default function HeightMeasurementLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f1f4fd] pb-12 pt-6">
      <div className="container mx-auto px-4">{children}</div>
    </div>
  )
}

