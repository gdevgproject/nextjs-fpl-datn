import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[80vh]">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">MyBeauty Perfume</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Khám phá bộ sưu tập nước hoa độc đáo và sang trọng. Tìm kiếm mùi hương phù hợp với phong cách của bạn.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/san-pham">Khám phá ngay</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dang-ky">Đăng ký</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] aspect-video bg-muted/30 rounded-xl"></div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Sản phẩm nổi bật</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Khám phá các sản phẩm nước hoa được yêu thích nhất tại MyBeauty
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid gap-1 text-center">
                <div className="mx-auto w-full max-w-[300px] aspect-square bg-muted rounded-xl"></div>
                <h3 className="text-xl font-bold">Sản phẩm {i}</h3>
                <p className="text-muted-foreground">Mô tả sản phẩm {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

