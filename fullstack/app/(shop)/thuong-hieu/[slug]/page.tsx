import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { FilterSidebar } from "@/components/san-pham/filter-sidebar"
import { ProductSort } from "@/components/san-pham/product-sort"
import { ProductViewToggle } from "@/components/san-pham/product-view-toggle"
import { ProductGridView } from "@/components/san-pham/product-grid-view"
import { ProductListView } from "@/components/san-pham/product-list-view"
import { CategoryMobileFilters } from "@/components/san-pham/category-mobile-filters"
import { SelectedFilters } from "@/components/san-pham/selected-filters"
import { BrandHistory } from "@/components/thuong-hieu/brand-history"
import { BrandTopProducts } from "@/components/thuong-hieu/brand-top-products"
import { BrandGallery } from "@/components/thuong-hieu/brand-gallery"
import { Pagination } from "@/components/ui/pagination"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BrandPageProps {
  params: {
    slug: string
  }
  searchParams?: {
    page?: string
    sort?: string
    view?: "grid" | "list"
    tab?: string
    [key: string]: string | string[] | undefined
  }
}

export default function BrandPage({ params, searchParams = {} }: BrandPageProps) {
  // Get view preference from URL or default to grid
  const view = searchParams.view === "list" ? "list" : "grid"

  // Get active tab from URL or default to products
  const activeTab = searchParams.tab || "products"

  // Extract page from search params with fallback to 1
  const currentPage = Number(searchParams.page) || 1

  // Dữ liệu mẫu cho thương hiệu
  const brand = {
    id: 1,
    name: "Dior",
    slug: params.slug,
    description:
      "Dior là một trong những thương hiệu nước hoa cao cấp nổi tiếng thế giới. Thương hiệu này được biết đến với các dòng nước hoa sang trọng, độc đáo và đẳng cấp.",
    history:
      "Christian Dior là một nhà thiết kế thời trang người Pháp sinh năm 1905. Ông thành lập thương hiệu Christian Dior vào năm 1946 và ra mắt bộ sưu tập đầu tiên vào năm 1947. Dior nhanh chóng trở thành một trong những thương hiệu thời trang có ảnh hưởng nhất thế giới. Dòng nước hoa đầu tiên của Dior, Miss Dior, được ra mắt cùng năm với bộ sưu tập thời trang đầu tiên.",
    keyPoints: [
      "Thành lập vào năm 1946 bởi Christian Dior",
      "Ra mắt nước hoa đầu tiên Miss Dior vào năm 1947",
      "Dior Sauvage là một trong những nước hoa nam bán chạy nhất thế giới",
      "Sở hữu nhiều dòng nước hoa biểu tượng như J'adore, Miss Dior, Sauvage",
      "Kết hợp giữa di sản Pháp và sự sáng tạo hiện đại",
    ],
    imageGallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    logo: "/placeholder.svg?height=200&width=200",
    banner: "/placeholder.svg?height=300&width=1200",
    foundedYear: 1946,
    country: "Pháp",
    website: "https://www.dior.com",
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
      name: "Dior Homme Intense EDP",
      slug: "dior-homme-intense-edp",
      brand: "Dior",
      price: 2800000,
      salePrice: 2400000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.7,
      isNew: false,
      isBestSeller: true,
      isSale: true,
      description: "Nước hoa nam thanh lịch với hương hoa iris và gỗ ấm áp",
      reviewCount: 95,
    },
    {
      id: 3,
      name: "Miss Dior EDP",
      slug: "miss-dior-edp",
      brand: "Dior",
      price: 2900000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.9,
      isNew: false,
      isBestSeller: true,
      isSale: false,
      description: "Hương thơm nữ tính và lãng mạn với hoa hồng và hoa nhài",
      reviewCount: 176,
    },
    {
      id: 4,
      name: "J'adore EDP",
      slug: "jadore-edp",
      brand: "Dior",
      price: 3100000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.8,
      isNew: false,
      isBestSeller: true,
      isSale: false,
      description: "Hương thơm sang trọng với các loại hoa trắng và trái cây",
      reviewCount: 142,
    },
    {
      id: 5,
      name: "Dior Homme EDT",
      slug: "dior-homme-edt",
      brand: "Dior",
      price: 2300000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.6,
      isNew: false,
      isBestSeller: false,
      isSale: false,
      description: "Hương thơm nam tính nhưng tinh tế với hoa iris",
      reviewCount: 89,
    },
    {
      id: 6,
      name: "Dior Addict EDP",
      slug: "dior-addict-edp",
      brand: "Dior",
      price: 2700000,
      salePrice: 2300000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.5,
      isNew: false,
      isBestSeller: false,
      isSale: true,
      description: "Hương thơm nữ quyến rũ với hương vani và hoa nhài",
      reviewCount: 74,
    },
    {
      id: 7,
      name: "Dior Joy EDP",
      slug: "dior-joy-edp",
      brand: "Dior",
      price: 2600000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.7,
      isNew: true,
      isBestSeller: false,
      isSale: false,
      description: "Hương thơm tươi mới và sang trọng với hoa nhài và hoa đào",
      reviewCount: 68,
    },
    {
      id: 8,
      name: "Dior Fahrenheit EDT",
      slug: "dior-fahrenheit-edt",
      brand: "Dior",
      price: 2400000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.8,
      isNew: false,
      isBestSeller: true,
      isSale: false,
      description: "Hương thơm nam độc đáo với hương da thuộc và violet",
      reviewCount: 104,
    },
  ]

  // Dữ liệu mẫu cho phân trang
  const pagination = {
    currentPage,
    totalPages: 3,
    totalItems: 24,
    itemsPerPage: 8,
  }

  // Top 3 sản phẩm bán chạy nhất của thương hiệu
  const topProducts = products.filter((product) => product.isBestSeller).slice(0, 3)

  // Danh sách các bộ lọc đã chọn (mẫu)
  const selectedFilters = [
    { id: "concentration-edp", label: "Eau de Parfum (EDP)", type: "concentration" },
    { id: "price-range", label: "2.000.000đ - 3.000.000đ", type: "price" },
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
              <BreadcrumbLink href="/thuong-hieu">Thương hiệu</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage>{brand.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Brand Banner */}
      <div className="w-full">
        <div className="relative h-40 md:h-60 w-full overflow-hidden">
          <Image src={brand.banner || "/placeholder.svg"} alt={brand.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/40 flex items-center">
            <div className="container mx-auto flex items-center space-x-6">
              <div className="relative h-24 w-24 bg-white rounded-lg p-2 hidden md:block">
                <Image src={brand.logo || "/placeholder.svg"} alt={brand.name} fill className="object-contain p-1" />
              </div>
              <div>
                <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">{brand.name}</h1>
                <p className="text-white/90 text-sm md:text-base max-w-2xl">{brand.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Content */}
      <div className="container mx-auto py-8">
        <Tabs defaultValue={activeTab} className="space-y-8">
          <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 border-b">
            <TabsList className="mx-auto justify-center mb-2">
              <TabsTrigger value="products" asChild>
                <Link
                  href={{
                    pathname: `/thuong-hieu/${params.slug}`,
                    query: { ...searchParams, tab: "products" },
                  }}
                >
                  Sản phẩm
                </Link>
              </TabsTrigger>
              <TabsTrigger value="about" asChild>
                <Link
                  href={{
                    pathname: `/thuong-hieu/${params.slug}`,
                    query: { ...searchParams, tab: "about" },
                  }}
                >
                  Về thương hiệu
                </Link>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar */}
              <div className="hidden md:block w-full md:w-64 flex-shrink-0">
                <FilterSidebar />
              </div>

              {/* Products */}
              <div className="flex-1">
                {/* Mobile Filters */}
                <CategoryMobileFilters />

                {/* Selected Filters */}
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
                        pathname: `/thuong-hieu/${params.slug}`,
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
                            pathname: `/thuong-hieu/${params.slug}`,
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
                        pathname: `/thuong-hieu/${params.slug}`,
                        query: { ...searchParams, page: currentPage + 1 },
                      }}
                    >
                      Tiếp
                    </Link>
                  </Button>
                </Pagination>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-10">
            {/* Brand History */}
            <BrandHistory brand={brand} keyPoints={brand.keyPoints} />

            {/* Top Products */}
            <BrandTopProducts products={topProducts} brandName={brand.name} />

            {/* Gallery */}
            <BrandGallery images={brand.imageGallery} brandName={brand.name} />

            {/* Call to Action */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Khám phá thêm sản phẩm từ {brand.name}</h3>
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Trải nghiệm đa dạng các mùi hương độc đáo và đẳng cấp từ một trong những thương hiệu nước hoa cao cấp
                hàng đầu thế giới.
              </p>
              <Button asChild>
                <Link
                  href={{
                    pathname: `/thuong-hieu/${params.slug}`,
                    query: { tab: "products" },
                  }}
                >
                  Xem tất cả sản phẩm
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

