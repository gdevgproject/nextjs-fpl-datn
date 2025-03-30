import Image from "next/image"
import { MapPin, Globe, Building, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface BrandHistoryProps {
  brand: {
    name: string
    history: string
    logo: string
    foundedYear: number
    country: string
    website: string
  }
  keyPoints: string[]
}

export function BrandHistory({ brand, keyPoints }: BrandHistoryProps) {
  const currentYear = new Date().getFullYear()
  const yearsActive = currentYear - brand.foundedYear

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="col-span-2">
        <h2 className="text-2xl font-bold mb-4">Lịch sử thương hiệu</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">{brand.history}</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Những điểm nổi bật</h3>
          <ul className="space-y-2 list-disc pl-5">
            {keyPoints.map((point, index) => (
              <li key={index} className="text-muted-foreground">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <div className="relative h-32 w-32 rounded-full bg-muted/30 p-2">
                <Image src={brand.logo || "/placeholder.svg"} alt={brand.name} fill className="object-contain" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Building className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Thành lập</h4>
                  <p className="text-sm text-muted-foreground">
                    {brand.foundedYear} ({yearsActive} năm hoạt động)
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Xuất xứ</h4>
                  <p className="text-sm text-muted-foreground">{brand.country}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Globe className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Website</h4>
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {brand.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <Award className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Danh tiếng</h4>
                  <p className="text-sm text-muted-foreground">
                    Một trong những thương hiệu nước hoa cao cấp hàng đầu thế giới
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

