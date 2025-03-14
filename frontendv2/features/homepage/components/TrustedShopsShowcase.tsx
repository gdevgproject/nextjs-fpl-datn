import Image from "next/image"
import { Button } from "@/components/ui/Button"

const trustedShops = [
  {
    id: 1,
    image: "/placeholder.svg?height=80&width=160",
    name: "Nhà thuốc Elena 1",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=80&width=160",
    name: "Nhà thuốc Elena 2",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=80&width=160",
    name: "Nhà thuốc Elena 3",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=80&width=160",
    name: "Nhà thuốc Elena 4",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=80&width=160",
    name: "Nhà thuốc Elena 5",
  },
  {
    id: 6,
    image: "/placeholder.svg?height=80&width=160",
    name: "Nhà thuốc Elena 6",
  },
]

export default function TrustedShopsShowcase() {
  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary-5">Hệ thống nhà thuốc uy tín</h2>
        <Button variant="link" className="text-primary-40">
          Xem tất cả
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {trustedShops.map((shop) => (
          <div
            key={shop.id}
            className="flex items-center justify-center rounded-lg border border-grayscale-20 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <Image
              src={shop.image || "/placeholder.svg"}
              alt={shop.name}
              width={160}
              height={80}
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

