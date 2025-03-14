import Image from "next/image"

export default function SimpleBanner() {
  return (
    <section className="relative w-full">
      <div className="relative aspect-[16/5] sm:aspect-[16/5] w-full">
        <Image
          src="/placeholder.svg?height=400&width=1200"
          alt="Chính bạn TOA SÁNG tặng quà ĐÓN TẾT"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          aria-labelledby="banner-heading"
        />
        <h2 id="banner-heading" className="sr-only">
          Khuyến mãi đặc biệt Tết
        </h2>
      </div>
    </section>
  )
}

