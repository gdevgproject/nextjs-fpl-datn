import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="bg-muted py-16 md:py-24">
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
  )
}

