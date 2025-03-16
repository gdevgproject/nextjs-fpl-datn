import Image from "next/image"

export default function SimpleBanner() {
  return (
    <section className="w-full bg-background">
      {/* Desktop Banner */}
      <div className="hidden md:block w-full">
        <Image
          src="https://cdn.nhathuoclongchau.com.vn/unsafe/828x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/1610x492_Banner_WEB_f660825f26.png"
          alt="Hero Banner"
          width={1200}
          height={400}
          className="w-full object-cover"
          priority
          sizes="(max-width: 1024px) 90vw, 1200px"
        />
      </div>

      {/* Mobile Banner - You can add a mobile-specific banner here if needed */}
      <div className="md:hidden w-full">
        <Image
          src="https://cdn.nhathuoclongchau.com.vn/unsafe/828x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/1610x492_Banner_WEB_f660825f26.png"
          alt="Hero Banner"
          width={600}
          height={300}
          className="w-full object-cover"
          priority
          sizes="100vw"
        />
      </div>
    </section>
  )
}

