import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { FilterSidebar } from "@/components/san-pham/filter-sidebar"
import { ProductSort } from "@/components/san-pham/product-sort"
import { ProductViewToggle } from "@/components/san-pham/product-view-toggle"
import { ProductGridView } from "@/components/san-pham/product-grid-view"
import { ProductListView } from "@/components/san-pham/product-list-view"
import { CategoryMobileFilters } from "@/components/san-pham/category-mobile-filters"
import { CategoryFeatures } from "@/components/danh-muc/category-features"
import { CategorySubcategories } from "@/components/danh-muc/category-subcategories"
import { SelectedFilters } from "@/components/san-pham/selected-filters"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams?: {
    page?: string
    sort?: string
    view?: "grid" | "list"
    [key: string]: string | string[] | undefined
  }
}

export default function CategoryPage({ params, searchParams = {} }: CategoryPageProps) {
  // Get view preference from URL or default to grid
  const view = searchParams.view === "list" ? "list" : "grid"

  // Extract page from search params with fallback to 1
  const currentPage = Number(searchParams.page) || 1

  // Dữ liệu mẫu cho danh mục
  const category = {
    id: 1,
    name: "Nước hoa Nam",
    slug: params.slug,
    description: "Bộ sưu tập nước hoa nam cao cấp với mùi hương đa dạng phù hợp với mọi phong cách",
    image: "/placeholder.svg?height=300&width=1200",
    features: [
      {
        title: "Đa dạng mùi hương",
        description: "Từ hương gỗ nam tính đến hương biển mát mẻ",
        icon: "layers",
      },
      {
        title: "Nhiều nồng độ",
        description: "EDP, EDT, EDC phù hợp với mọi nhu cầu",
        icon: "droplets",
      },
      {
        title: "Dành cho mọi dịp",
        description: "Công sở, dạo phố hay hẹn hò",
        icon: "calendar",
      },
    ],
    subcategories: [
      { id: 1, name: "Nước hoa nam hương gỗ", slug: "nuoc-hoa-nam-huong-go", productCount: 45 },
      { id: 2, name: "Nước hoa nam hương biển", slug: "nuoc-hoa-nam-huong-bien", productCount: 32 },
      { id: 3, name: "Nước hoa nam hương cam quýt", slug: "nuoc-hoa-nam-huong-cam-quyt", productCount: 28 },
      { id: 4, name: "Nước hoa nam hương gia vị", slug: "nuoc-hoa-nam-huong-gia-vi", productCount: 15 },
    ],
  }

  // Dữ liệu mẫu cho sản phẩm
  const products = [
    {
      id: 1,
      name: "Dior Sauvage EDP",
      slug: "dior-sauvage-edp",
      brand: "Dior",
      price: 2500000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.8,
      isNew: true,
      isBestSeller: false,
      isSale: false,
      description: "Một mùi hương nam tính, mạnh mẽ với hương biển và gỗ",
      reviewCount: 128,
    },
    {
      id: 2,
      name: "Chanel Bleu de Chanel EDP",
      slug: "chanel-bleu-de-chanel-edp",
      brand: "Chanel",
      price: 2800000,
      salePrice: 2400000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.9,
      isNew: false,
      isBestSeller: true,
      isSale: true,
      description: "Nước hoa nam sang trọng với hương gỗ ấm áp và hương thơm của cam quýt",
      reviewCount: 152,
    },
    {
      id: 3,
      name: "Tom Ford Tobacco Vanille EDP",
      slug: "tom-ford-tobacco-vanille-edp",
      brand: "Tom Ford",
      price: 4500000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.7,
      isNew: false,
      isBestSeller: false,
      isSale: false,
      description: "Mùi hương ấm áp và gợi cảm với vani và thuốc lá",
      reviewCount: 89,
    },
    {
      id: 4,
      name: "Versace Eros EDT",
      slug: "versace-eros-edt",
      brand: "Versace",
      price: 1800000,
      salePrice: 1600000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.6,
      isNew: false,
      isBestSeller: false,
      isSale: true,
      description: "Mùi hương mạnh mẽ và quyến rũ với bạc hà và vani",
      reviewCount: 112,
    },
    {
      id: 5,
      name: "Giorgio Armani Acqua di Giò",
      slug: "giorgio-armani-acqua-di-gio",
      brand: "Giorgio Armani",
      price: 2200000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.9,
      isNew: false,
      isBestSeller: true,
      isSale: false,
      description: "Mùi hương biển mát mẻ và tươi mới, phù hợp cho mùa hè",
      reviewCount: 165,
    },
    {
      id: 6,
      name: "Creed Aventus EDP",
      slug: "creed-aventus-edp",
      brand: "Creed",
      price: 6500000,
      salePrice: 5800000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.7,
      isNew: false,
      isBestSeller: true,
      isSale: true,
      description: "Mùi hương sang trọng và đẳng cấp với trái cây và khói gỗ",
      reviewCount: 76,
    },
    {
      id: 7,
      name: "Montblanc Explorer EDP",
      slug: "montblanc-explorer-edp",
      brand: "Montblanc",
      price: 1900000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.5,
      isNew: false,
      isBestSeller: false,
      isSale: false,
      description: "Mùi hương phiêu lưu với bergamot và da thuộc",
      reviewCount: 58,
    },
    {
      id: 8,
      name: "Prada L'Homme EDT",
      slug: "prada-l-homme-edt",
      brand: "Prada",
      price: 2700000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.8,
      isNew: false,
      isBestSeller: false,
      isSale: false,
      description: "Nước hoa nam thanh lịch và tinh tế với hương hoa iris",
      reviewCount: 42,
    },
  ]

  // Dữ liệu mẫu cho phân trang
  const pagination = {
    currentPage,
    totalPages: 5,
    totalItems: 40,
    itemsPerPage: 8,
  }

  // Danh sách các bộ lọc đã chọn (mẫu)
  const selectedFilters = [
    { id: "brand-dior", label: "Dior", type: "brand" },
    { id: "concentration-edp", label: "Eau de Parfum (EDP)", type: "concentration" },
    { id: "price-range", label: "1.000.000đ - 3.000.000đ", type: "price" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/danh-muc">Danh mục</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage>{category.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Category Banner */}
      <div className="w-full relative">
        <div className="relative h-40 md:h-60 w-full overflow-hidden">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto px-4">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Features - Added to enhance UX */}
      <div className="container mx-auto py-6 md:py-8">
        <CategoryFeatures features={category.features} />
      </div>

      {/* Subcategories Section - Added to enhance UX */}
      <div className="container mx-auto pb-6 md:pb-8">
        <CategorySubcategories subcategories={category.subcategories} parentCategorySlug={params.slug} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-full md:w-64 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Mobile Filters */}
            <CategoryMobileFilters />

            {/* Selected Filters - Added to enhance UX */}
            <SelectedFilters filters={selectedFilters} />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị {pagination.itemsPerPage} trên {pagination.totalItems} sản phẩm
              </div>
              <div className="flex items-center gap-4">
                <ProductViewToggle currentView={view} />
                <ProductSort />
              </div>
            </div>

            {/* Products Grid/List View */}
            {view === "grid" ? <ProductGridView products={products} /> : <ProductListView products={products} />}

            {/* Pagination */}
            <Pagination className="mt-8">
              <Button variant="outline" size="sm" disabled={currentPage === 1} asChild>
                <Link
                  href={{
                    pathname: `/danh-muc/${params.slug}`,
                    query: { ...searchParams, page: currentPage - 1 },
                  }}
                >
                  Trước
                </Link>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    asChild
                  >
                    <Link
                      href={{
                        pathname: `/danh-muc/${params.slug}`,
                        query: { ...searchParams, page: i + 1 },
                      }}
                    >
                      {i + 1}
                    </Link>
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" disabled={currentPage === pagination.totalPages} asChild>
                <Link
                  href={{
                    pathname: `/danh-muc/${params.slug}`,
                    query: { ...searchParams, page: currentPage + 1 },
                  }}
                >
                  Tiếp
                </Link>
              </Button>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  )
}

