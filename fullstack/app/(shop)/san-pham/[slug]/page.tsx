import { Suspense } from "react"
import type { Metadata } from "next"
import { ChevronRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ProductGallery } from "@/components/san-pham/product-gallery"
import { ProductInfo } from "@/components/san-pham/product-info"
import { ProductRelated } from "@/components/san-pham/product-related"
import { ProductShare } from "@/components/san-pham/product-share"
import { ProductSkeleton } from "@/components/san-pham/product-skeleton"
import { PageContainer } from "@/components/layout/page-container"
import { ProductTabs } from "@/components/san-pham/product-tabs"
import { ProductSticky } from "@/components/san-pham/product-sticky"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // Giả lập fetch dữ liệu sản phẩm
  const product = {
    name: "Dior Sauvage EDP",
    description:
      "Mạnh mẽ và thanh lịch, Dior Sauvage Eau de Parfum là một mùi hương có sự tương tác của sự mát mẻ và ấm áp.",
  }

  return {
    title: product.name,
    description: product.description,
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  // Dữ liệu mẫu cho sản phẩm
  const product = {
    id: 1,
    name: "Dior Sauvage EDP",
    slug: params.slug,
    brand: "Dior",
    brandId: 1,
    brandSlug: "dior",
    description:
      "Dior Sauvage là một hương thơm gỗ cay nồng đầy nam tính. Tươi mát ở notes đầu, dần trở nên ấm áp và sâu lắng ở notes giữa và notes cuối.",
    shortDescription:
      "Mạnh mẽ và thanh lịch, Dior Sauvage Eau de Parfum là một mùi hương có sự tương tác của sự mát mẻ và ấm áp.",
    price: 2500000,
    salePrice: null,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    rating: 4.8,
    reviewCount: 125,
    isNew: true,
    isBestSeller: true,
    isSale: false,
    variants: [
      { id: 1, volume: 60, price: 2000000, salePrice: null, inStock: true },
      { id: 2, volume: 100, price: 2500000, salePrice: null, inStock: true },
      { id: 3, volume: 200, price: 3500000, salePrice: null, inStock: false },
    ],
    categories: [
      { id: 1, name: "Nước hoa Nam", slug: "nuoc-hoa-nam" },
      { id: 2, name: "Nước hoa Eau de Parfum", slug: "nuoc-hoa-eau-de-parfum" },
    ],
    gender: "Nam",
    perfumeType: "Eau de Parfum",
    concentration: "Eau de Parfum (EDP)",
    releaseYear: 2015,
    originCountry: "Pháp",
    style: "Mạnh mẽ, Nam tính, Thanh lịch",
    sillage: "Tốt - Tỏa hương vừa phải",
    longevity: "Rất lâu (> 12 giờ)",
    specifications: {
      concentration: "Eau de Parfum (EDP)",
      releaseYear: 2015,
      gender: "Nam",
      style: "Mạnh mẽ, Nam tính, Thanh lịch",
      sillage: "Tốt - Tỏa hương vừa phải",
      longevity: "Rất lâu (> 12 giờ)",
      topNotes: ["Cam Bergamot", "Tiêu", "Hoa Oải Hương"],
      middleNotes: ["Tiêu Sichuan", "Hoa Oải Hương", "Đậu Tonka"],
      baseNotes: ["Hương Gỗ", "Hương Thuốc Lá", "Ambroxan"],
    },
    scents: {
      top: [
        { name: "Cam Bergamot", description: "Hương cam chanh tươi mát" },
        { name: "Tiêu", description: "Hương cay nồng" },
        { name: "Hoa Oải Hương", description: "Hương hoa nhẹ nhàng" },
      ],
      middle: [
        { name: "Tiêu Sichuan", description: "Hương cay nồng đặc trưng" },
        { name: "Hoa Oải Hương", description: "Hương hoa nhẹ nhàng" },
        { name: "Đậu Tonka", description: "Hương ngọt ấm áp" },
      ],
      base: [
        { name: "Hương Gỗ", description: "Hương gỗ ấm áp" },
        { name: "Hương Thuốc Lá", description: "Hương khói nhẹ" },
        { name: "Ambroxan", description: "Hương hổ phách hiện đại" },
      ],
    },
  }

  // Dữ liệu mẫu cho đánh giá
  const reviews = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      date: "2023-06-15T08:30:00Z",
      rating: 5,
      title: "Mùi hương tuyệt vời",
      comment: "Một trong những mùi hương nam tính và bền nhất mà tôi từng dùng. Rất phù hợp cho cả ngày và đêm.",
      verified: true,
      helpful: 24,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      user: "Trần Thị B",
      date: "2023-07-20T10:15:00Z",
      rating: 4,
      title: "Khá ổn nhưng giá hơi cao",
      comment: "Mùi hương rất thanh lịch, nhưng giá hơi cao so với những sản phẩm tương tự. Độ lưu hương tốt.",
      verified: true,
      helpful: 12,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      user: "Lê Văn C",
      date: "2023-08-05T14:45:00Z",
      rating: 5,
      title: "Mùi hương đẳng cấp",
      comment: "Đúng là một mùi hương đẳng cấp. Tôi nhận được rất nhiều lời khen khi sử dụng. Sẽ mua lại lần nữa.",
      verified: true,
      helpful: 18,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  // Dữ liệu mẫu cho sản phẩm tương tự
  const relatedProducts = [
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
    },
    {
      id: 3,
      name: "Chanel Bleu de Chanel EDP",
      slug: "chanel-bleu-de-chanel-edp",
      brand: "Chanel",
      price: 2900000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.9,
      isNew: false,
      isBestSeller: true,
      isSale: false,
    },
    {
      id: 4,
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
    },
    {
      id: 5,
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
    },
  ]

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            {product.categories[0] && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/danh-muc/${product.categories[0].slug}`}>
                    {product.categories[0].name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbLink href={`/thuong-hieu/${product.brandSlug}`}>{product.brand}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Product Main Section */}
      <div className="py-4 md:py-8">
        <Suspense fallback={<ProductSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Product Info */}
            <div>
              <ProductInfo product={product} />
              <div className="mt-6">
                <ProductShare productName={product.name} productUrl={`/san-pham/${product.slug}`} />
              </div>
            </div>
          </div>
        </Suspense>
      </div>

      {/* Sticky Add to Cart for Mobile */}
      <ProductSticky
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          variants: product.variants,
          image: product.images[0],
        }}
      />

      {/* Product Details Tabs */}
      <div className="py-8">
        <ProductTabs product={product} reviews={reviews} />
      </div>

      {/* Related Products */}
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-8">Sản phẩm tương tự</h2>
        <ProductRelated products={relatedProducts} />
      </div>
    </PageContainer>
  )
}

