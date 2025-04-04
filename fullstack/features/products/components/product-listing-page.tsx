import { Suspense } from "react"
import { getProducts, getFilterOptions } from "../queries"
import { ProductGrid } from "./product-grid"
import { FilterSidebar } from "./filter-sidebar"
import { SortOptions } from "./sort-options"
import { PaginationControls } from "./pagination-controls"
import { ProductsHeader } from "./products-header"
import { NoResults } from "./no-results"
import { ProductGridSkeleton } from "./product-grid-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ProductListingPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export async function ProductListingPage({ searchParams }: ProductListingPageProps) {
  // Xử lý các tham số tìm kiếm
  const page = searchParams.page ? Number.parseInt(searchParams.page as string) : 1
  const limit = 12 // Số sản phẩm trên mỗi trang

  try {
    // Lấy dữ liệu sản phẩm và các tùy chọn lọc
    const [productsResult, filterOptions] = await Promise.all([
      getProducts(searchParams, page, limit),
      getFilterOptions(searchParams),
    ])

    const { products, count, categoryInfo, brandInfo } = productsResult

    // Tính toán số trang
    const totalPages = Math.ceil(count / limit)

    // Xác định tiêu đề trang dựa trên bộ lọc và tạo mảng các bộ lọc đang áp dụng để hiển thị
    const { title, description, activeFilters } = getPageTitleAndFilters(
      searchParams,
      filterOptions,
      categoryInfo,
      brandInfo,
    )

    return (
      <div className="container py-8">
        <ProductsHeader title={title} description={description} count={count} activeFilters={activeFilters} />

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          {/* Sidebar bộ lọc */}
          <div className="w-full md:w-64 lg:w-72">
            <FilterSidebar filterOptions={filterOptions} currentFilters={searchParams} />
          </div>

          {/* Danh sách sản phẩm */}
          <div className="flex-1">
            <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                {count > 0 ? (
                  <>
                    Hiển thị {products.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, count)} trong số{" "}
                    {count} sản phẩm
                  </>
                ) : (
                  "Không tìm thấy sản phẩm nào"
                )}
              </p>

              <SortOptions currentSort={searchParams.sort as string | undefined} />
            </div>

            <Suspense fallback={<ProductGridSkeleton />}>
              {products && products.length > 0 ? <ProductGrid products={products} /> : <NoResults />}
            </Suspense>

            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationControls currentPage={page} totalPages={totalPages} searchParams={searchParams} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in ProductListingPage:", error)
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Đã xảy ra lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau hoặc liên hệ quản trị viên.
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border p-6 text-center">
          <h2 className="text-2xl font-bold">Không thể hiển thị sản phẩm</h2>
          <p className="mt-2 text-muted-foreground">Có thể hệ thống đang bận. Vui lòng trở lại sau.</p>
        </div>
      </div>
    )
  }
}

// Hàm xác định tiêu đề trang và danh sách các bộ lọc đang áp dụng
function getPageTitleAndFilters(
  searchParams: { [key: string]: string | string[] | undefined },
  filterOptions: any,
  categoryInfo?: { name: string; description: string | null } | null,
  brandInfo?: { name: string; description: string | null } | null,
) {
  let title = "Tất cả sản phẩm"
  let description = "Khám phá bộ sưu tập nước hoa chính hãng đa dạng của chúng tôi"
  const activeFilters: { type: string; value: string }[] = []

  // Tìm kiếm
  if (searchParams.q) {
    title = `Kết quả tìm kiếm cho "${searchParams.q}"`
    description = "Các sản phẩm phù hợp với từ khóa tìm kiếm của bạn"
    activeFilters.push({ type: "Từ khóa", value: searchParams.q as string })
  }

  // Danh mục
  if (categoryInfo) {
    title = categoryInfo.name
    description = categoryInfo.description || `Khám phá các sản phẩm trong danh mục ${categoryInfo.name}`
    activeFilters.push({ type: "Danh mục", value: categoryInfo.name })
  }

  // Thương hiệu
  if (brandInfo) {
    title = brandInfo.name
    description = brandInfo.description || `Khám phá các sản phẩm từ thương hiệu ${brandInfo.name}`
    activeFilters.push({ type: "Thương hiệu", value: brandInfo.name })
  }

  // Giới tính
  if (searchParams.gender) {
    const gender = filterOptions.genders.find((g: any) => g.id.toString() === (searchParams.gender as string))
    if (gender) {
      if (!categoryInfo && !brandInfo) {
        title = `Nước hoa ${gender.name}`
        description = `Bộ sưu tập nước hoa dành cho ${gender.name.toLowerCase()}`
      }
      activeFilters.push({ type: "Giới tính", value: gender.name })
    }
  }

  // Loại nước hoa
  if (searchParams.perfume_type) {
    const perfumeType = filterOptions.perfumeTypes.find(
      (t: any) => t.id.toString() === (searchParams.perfume_type as string),
    )
    if (perfumeType) {
      activeFilters.push({ type: "Loại nước hoa", value: perfumeType.name })
    }
  }

  // Nồng độ
  if (searchParams.concentration) {
    const concentration = filterOptions.concentrations.find(
      (c: any) => c.id.toString() === (searchParams.concentration as string),
    )
    if (concentration) {
      activeFilters.push({ type: "Nồng độ", value: concentration.name })
    }
  }

  // Khoảng giá
  if (searchParams.minPrice || searchParams.maxPrice) {
    const min = Number.parseInt(searchParams.minPrice as string) || 0
    const max = Number.parseInt(searchParams.maxPrice as string) || Number.MAX_SAFE_INTEGER

    // Tìm xem có trùng với khoảng giá định sẵn không
    const matchedRange = filterOptions.priceRanges.find((r: any) => r.min === min && r.max === max)

    if (matchedRange) {
      activeFilters.push({ type: "Giá", value: matchedRange.label })
    } else {
      activeFilters.push({
        type: "Giá",
        value: `${formatCurrency(min)} - ${formatCurrency(max)}`,
      })
    }
  }

  // Sản phẩm nổi bật
  if (searchParams.featured === "true") {
    if (!categoryInfo && !brandInfo) {
      title = "Sản phẩm nổi bật"
      description = "Những sản phẩm được yêu thích và đánh giá cao"
    }
    activeFilters.push({ type: "Nổi bật", value: "Có" })
  }

  // Sản phẩm giảm giá
  if (searchParams.sale === "true") {
    if (!categoryInfo && !brandInfo) {
      title = "Sản phẩm giảm giá"
      description = "Cơ hội sở hữu những sản phẩm chất lượng với giá tốt nhất"
    }
    activeFilters.push({ type: "Giảm giá", value: "Có" })
  }

  return { title, description, activeFilters }
}

// Helper function to format currency values
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

