import { ChevronRight } from "lucide-react"
import { BrandCard } from "@/components/thuong-hieu/brand-card"
import { BrandFilter } from "@/components/thuong-hieu/brand-filter"
import { BrandSearch } from "@/components/thuong-hieu/brand-search"
import { BrandFeatured } from "@/components/thuong-hieu/brand-featured"
import { BrandAlphabetNav } from "@/components/thuong-hieu/brand-alphabet-nav"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BrandsPageProps {
  searchParams?: {
    query?: string
    origin?: string
    letter?: string
  }
}

export default function BrandsPage({ searchParams = {} }: BrandsPageProps) {
  // Dữ liệu mẫu cho thương hiệu
  const allBrands = [
    {
      id: 1,
      name: "Dior",
      slug: "dior",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 45,
      origin: "Pháp",
      isFeatured: true,
    },
    {
      id: 2,
      name: "Chanel",
      slug: "chanel",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 38,
      origin: "Pháp",
      isFeatured: true,
    },
    {
      id: 3,
      name: "Tom Ford",
      slug: "tom-ford",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 30,
      origin: "Mỹ",
      isFeatured: true,
    },
    {
      id: 4,
      name: "Versace",
      slug: "versace",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 25,
      origin: "Ý",
      isFeatured: true,
    },
    {
      id: 5,
      name: "Gucci",
      slug: "gucci",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 20,
      origin: "Ý",
      isFeatured: true,
    },
    {
      id: 6,
      name: "Burberry",
      slug: "burberry",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 18,
      origin: "Anh",
      isFeatured: false,
    },
    {
      id: 7,
      name: "Calvin Klein",
      slug: "calvin-klein",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 22,
      origin: "Mỹ",
      isFeatured: false,
    },
    {
      id: 8,
      name: "Dolce & Gabbana",
      slug: "dolce-gabbana",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 19,
      origin: "Ý",
      isFeatured: false,
    },
    {
      id: 9,
      name: "Armani",
      slug: "armani",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 17,
      origin: "Ý",
      isFeatured: false,
    },
    {
      id: 10,
      name: "Hermes",
      slug: "hermes",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 12,
      origin: "Pháp",
      isFeatured: true,
    },
    {
      id: 11,
      name: "Bvlgari",
      slug: "bvlgari",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 14,
      origin: "Ý",
      isFeatured: false,
    },
    {
      id: 12,
      name: "Creed",
      slug: "creed",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 16,
      origin: "Anh",
      isFeatured: true,
    },
    {
      id: 13,
      name: "Prada",
      slug: "prada",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 15,
      origin: "Ý",
      isFeatured: false,
    },
    {
      id: 14,
      name: "Yves Saint Laurent",
      slug: "yves-saint-laurent",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 21,
      origin: "Pháp",
      isFeatured: true,
    },
    {
      id: 15,
      name: "Montblanc",
      slug: "montblanc",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 10,
      origin: "Đức",
      isFeatured: false,
    },
    {
      id: 16,
      name: "Acqua di Parma",
      slug: "acqua-di-parma",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 8,
      origin: "Ý",
      isFeatured: false,
    },
    {
      id: 17,
      name: "Jo Malone",
      slug: "jo-malone",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 13,
      origin: "Anh",
      isFeatured: false,
    },
    {
      id: 18,
      name: "Narciso Rodriguez",
      slug: "narciso-rodriguez",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 9,
      origin: "Mỹ",
      isFeatured: false,
    },
    {
      id: 19,
      name: "Kilian",
      slug: "kilian",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 11,
      origin: "Pháp",
      isFeatured: false,
    },
    {
      id: 20,
      name: "Byredo",
      slug: "byredo",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 7,
      origin: "Thụy Điển",
      isFeatured: false,
    },
  ]

  // Lọc thương hiệu theo các điều kiện tìm kiếm
  let filteredBrands = [...allBrands]

  // Lọc theo tìm kiếm
  if (searchParams.query) {
    const query = searchParams.query.toLowerCase()
    filteredBrands = filteredBrands.filter((brand) => brand.name.toLowerCase().includes(query))
  }

  // Lọc theo xuất xứ
  if (searchParams.origin) {
    filteredBrands = filteredBrands.filter((brand) => brand.origin === searchParams.origin)
  }

  // Lọc theo chữ cái đầu
  if (searchParams.letter) {
    filteredBrands = filteredBrands.filter(
      (brand) => brand.name.charAt(0).toLowerCase() === searchParams.letter.toLowerCase(),
    )
  }

  // Lấy danh sách các thương hiệu nổi bật
  const featuredBrands = allBrands.filter((brand) => brand.isFeatured)

  // Lấy danh sách các xuất xứ để hiển thị trong bộ lọc
  const origins = Array.from(new Set(allBrands.map((brand) => brand.origin))).sort()

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage>Thương hiệu</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Thương hiệu nước hoa</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Khám phá các thương hiệu nước hoa cao cấp hàng đầu thế giới với đa dạng phong cách, hương thơm và xuất xứ
        </p>
      </div>

      {/* Featured Brands Section */}
      <BrandFeatured brands={featuredBrands} />

      {/* Search and Filter Section */}
      <div className="my-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <BrandFilter origins={origins} selectedOrigin={searchParams.origin} />
        </div>

        <div className="md:col-span-3">
          {/* Search */}
          <BrandSearch initialQuery={searchParams.query} />

          {/* Alphabet Navigation */}
          <BrandAlphabetNav activeLetter={searchParams.letter} />

          {/* Brands Grid */}
          {filteredBrands.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {filteredBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg mt-6">
              <p className="text-muted-foreground">Không tìm thấy thương hiệu nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

