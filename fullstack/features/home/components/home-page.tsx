import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductCard } from "@/components/shared/product-card"
import { getFeaturedProducts } from "../data"

export async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}
      <section className="bg-muted py-12 md:py-24">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">Khám phá hương thơm đẳng cấp</h1>
          <p className="mt-4 max-w-[42rem] text-muted-foreground sm:text-xl">
            Bộ sưu tập nước hoa chính hãng với đa dạng thương hiệu cao cấp từ khắp nơi trên thế giới
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/san-pham">Khám phá ngay</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/thuong-hieu">Thương hiệu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sản phẩm nổi bật</h2>
            <p className="text-muted-foreground">Những sản phẩm được yêu thích nhất của chúng tôi</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/san-pham">Xem tất cả</Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-muted py-12">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Thương hiệu nổi tiếng</h2>
            <p className="mt-2 text-muted-foreground">
              Chúng tôi hợp tác với các thương hiệu nước hoa hàng đầu thế giới
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            {/* Hiển thị logo thương hiệu */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 w-32 rounded-lg bg-background flex items-center justify-center p-2">
                <img src="/images/logo.png" alt={`Brand ${i + 1}`} className="h-full w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium">Giao hàng toàn quốc</h3>
            <p className="mt-2 text-sm text-muted-foreground">Giao hàng nhanh chóng đến tận nhà trên toàn quốc</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium">Sản phẩm chính hãng</h3>
            <p className="mt-2 text-sm text-muted-foreground">Cam kết 100% sản phẩm chính hãng, nguồn gốc rõ ràng</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 9.75h4.875a2.625 2.625 0 010 5.25H12M8.25 9.75L10.5 7.5M8.25 9.75L10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium">Đổi trả dễ dàng</h3>
            <p className="mt-2 text-sm text-muted-foreground">Chính sách đổi trả linh hoạt trong vòng 30 ngày</p>
          </div>
        </div>
      </section>
    </div>
  )
}

