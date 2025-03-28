"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Section } from "@/components/layout/section"
import { HeroCarousel } from "@/components/trang-chu/hero-carousel"
import { ProductCard } from "@/components/san-pham/product-card"
import { CategoryCard } from "@/components/danh-muc/category-card"
import { BrandCard } from "@/components/thuong-hieu/brand-card"
import { NewsletterSection } from "@/components/trang-chu/newsletter-section"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SectionHeading } from "@/components/layout/section-heading"
import { SaleCountdown } from "@/components/trang-chu/sale-countdown"

export default function HomePage() {
  const [activeProductTab, setActiveProductTab] = useState("new")

  // Dữ liệu mẫu cho banners
  const banners = [
    {
      id: 1,
      title: "Bộ sưu tập mùa hè 2023",
      subtitle: "Khám phá những mùi hương mát mẻ, tươi mới cho ngày hè năng động",
      image: "/placeholder.svg?height=600&width=1920",
      buttonText: "Khám phá ngay",
      buttonLink: "/danh-muc/nuoc-hoa-mua-he",
    },
    {
      id: 2,
      title: "Sale lớn cho các dòng nước hoa cao cấp",
      subtitle: "Giảm đến 30% cho các thương hiệu hàng đầu",
      image: "/placeholder.svg?height=600&width=1920",
      buttonText: "Mua ngay",
      buttonLink: "/san-pham?sale=true",
    },
    {
      id: 3,
      title: "Bộ quà tặng đặc biệt",
      subtitle: "Những set quà tặng hoàn hảo cho người thân yêu của bạn",
      image: "/placeholder.svg?height=600&width=1920",
      buttonText: "Xem thêm",
      buttonLink: "/danh-muc/qua-tang",
    },
  ]

  // Dữ liệu mẫu cho sản phẩm
  const newProducts = [
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
      isNew: true,
      isBestSeller: true,
      isSale: true,
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
      isNew: true,
      isBestSeller: false,
      isSale: false,
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
      isNew: true,
      isBestSeller: false,
      isSale: true,
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
      isNew: true,
      isBestSeller: false,
      isSale: false,
    },
  ]

  const bestSellerProducts = [
    {
      id: 6,
      name: "Creed Aventus EDP",
      slug: "creed-aventus-edp",
      brand: "Creed",
      price: 6500000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.9,
      isNew: false,
      isBestSeller: true,
      isSale: false,
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
      isBestSeller: true,
      isSale: false,
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
      isNew: true,
      isBestSeller: true,
      isSale: true,
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
      isBestSeller: true,
      isSale: false,
    },
    {
      id: 9,
      name: "Chanel Coco Mademoiselle",
      slug: "chanel-coco-mademoiselle",
      brand: "Chanel",
      price: 3200000,
      salePrice: null,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.7,
      isNew: false,
      isBestSeller: true,
      isSale: false,
    },
  ]

  const saleProducts = [
    {
      id: 2,
      name: "Chanel Bleu de Chanel EDP",
      slug: "chanel-bleu-de-chanel-edp",
      brand: "Chanel",
      price: 2800000,
      salePrice: 2400000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.9,
      isNew: true,
      isBestSeller: true,
      isSale: true,
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
      isNew: true,
      isBestSeller: false,
      isSale: true,
    },
    {
      id: 10,
      name: "Dolce & Gabbana Light Blue",
      slug: "dolce-gabbana-light-blue",
      brand: "Dolce & Gabbana",
      price: 2400000,
      salePrice: 1950000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.5,
      isNew: false,
      isBestSeller: false,
      isSale: true,
    },
    {
      id: 11,
      name: "Yves Saint Laurent Black Opium",
      slug: "yves-saint-laurent-black-opium",
      brand: "Yves Saint Laurent",
      price: 2900000,
      salePrice: 2500000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.8,
      isNew: false,
      isBestSeller: false,
      isSale: true,
    },
    {
      id: 12,
      name: "Calvin Klein CK One",
      slug: "calvin-klein-ck-one",
      brand: "Calvin Klein",
      price: 1600000,
      salePrice: 1300000,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.4,
      isNew: false,
      isBestSeller: false,
      isSale: true,
    },
  ]

  // Dữ liệu mẫu cho danh mục nổi bật
  const featuredCategories = [
    {
      id: 1,
      name: "Nước hoa Nam",
      slug: "nuoc-hoa-nam",
      image: "/placeholder.svg?height=300&width=300",
      productCount: 120,
    },
    {
      id: 2,
      name: "Nước hoa Nữ",
      slug: "nuoc-hoa-nu",
      image: "/placeholder.svg?height=300&width=300",
      productCount: 150,
    },
    {
      id: 3,
      name: "Nước hoa Unisex",
      slug: "nuoc-hoa-unisex",
      image: "/placeholder.svg?height=300&width=300",
      productCount: 80,
    },
    {
      id: 4,
      name: "Nước hoa Mini",
      slug: "nuoc-hoa-mini",
      image: "/placeholder.svg?height=300&width=300",
      productCount: 60,
    },
    {
      id: 5,
      name: "Giftset",
      slug: "giftset",
      image: "/placeholder.svg?height=300&width=300",
      productCount: 45,
    },
    {
      id: 6,
      name: "Nước hoa Niche",
      slug: "nuoc-hoa-niche",
      image: "/placeholder.svg?height=300&width=300",
      productCount: 55,
    },
  ]

  // Dữ liệu mẫu cho thương hiệu nổi bật
  const featuredBrands = [
    {
      id: 1,
      name: "Dior",
      slug: "dior",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 45,
    },
    {
      id: 2,
      name: "Chanel",
      slug: "chanel",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 38,
    },
    {
      id: 3,
      name: "Tom Ford",
      slug: "tom-ford",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 30,
    },
    {
      id: 4,
      name: "Versace",
      slug: "versace",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 25,
    },
    {
      id: 5,
      name: "Gucci",
      slug: "gucci",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 20,
    },
    {
      id: 6,
      name: "Burberry",
      slug: "burberry",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 18,
    },
    {
      id: 7,
      name: "Yves Saint Laurent",
      slug: "yves-saint-laurent",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 28,
    },
    {
      id: 8,
      name: "Giorgio Armani",
      slug: "giorgio-armani",
      logo: "/placeholder.svg?height=100&width=100",
      productCount: 22,
    },
  ]

  return (
    <>
      {/* Hero Carousel */}
      <div className="w-full">
        <HeroCarousel banners={banners} />
      </div>

      {/* Danh mục nổi bật */}
      <Section className="py-8 md:py-12">
        <SectionHeading
          title="Danh mục nổi bật"
          description="Khám phá các dòng nước hoa đa dạng phù hợp với mọi phong cách"
          linkText="Xem tất cả danh mục"
          linkHref="/danh-muc"
        />

        <ScrollArea className="pb-4 md:hidden">
          <div className="flex gap-4">
            {featuredCategories.map((category) => (
              <div key={category.id} className="min-w-[150px] md:min-w-0">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {featuredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Section>

      {/* Sản phẩm theo tab */}
      <Section className="py-8 md:py-12 bg-muted/30">
        <SectionHeading title="Sản phẩm nổi bật" description="Trải nghiệm những mùi hương được yêu thích nhất" />

        <Tabs value={activeProductTab} onValueChange={setActiveProductTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="new">Mới nhất</TabsTrigger>
              <TabsTrigger value="bestseller">Bán chạy</TabsTrigger>
              <TabsTrigger value="sale">Đang giảm giá</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new" className="space-y-6">
            <ScrollArea className="pb-4 md:hidden">
              <div className="flex gap-4">
                {newProducts.map((product) => (
                  <div key={product.id} className="min-w-[200px] md:min-w-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline" size="lg" asChild>
                <Link href="/san-pham?sort=newest">
                  Xem tất cả sản phẩm mới <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bestseller" className="space-y-6">
            <ScrollArea className="pb-4 md:hidden">
              <div className="flex gap-4">
                {bestSellerProducts.map((product) => (
                  <div key={product.id} className="min-w-[200px] md:min-w-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {bestSellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline" size="lg" asChild>
                <Link href="/san-pham?sort=bestselling">
                  Xem tất cả sản phẩm bán chạy <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sale" className="space-y-6">
            {/* Sale countdown */}
            <SaleCountdown
              endDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
              title="Flash Sale"
              description="Khuyến mãi sẽ kết thúc trong:"
            />

            <ScrollArea className="pb-4 md:hidden">
              <div className="flex gap-4">
                {saleProducts.map((product) => (
                  <div key={product.id} className="min-w-[200px] md:min-w-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline" size="lg" asChild>
                <Link href="/san-pham?sale=true">
                  Xem tất cả sản phẩm giảm giá <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Thương hiệu nổi bật */}
      <Section className="py-8 md:py-12">
        <SectionHeading
          title="Thương hiệu nổi bật"
          description="Khám phá các thương hiệu nước hoa hàng đầu thế giới"
          linkText="Xem tất cả thương hiệu"
          linkHref="/thuong-hieu"
        />

        <ScrollArea className="pb-4 md:hidden">
          <div className="flex gap-4">
            {featuredBrands.map((brand) => (
              <div key={brand.id} className="min-w-[150px] md:min-w-0">
                <BrandCard brand={brand} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredBrands.slice(0, 8).map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </Section>

      {/* Đăng ký nhận tin */}
      <NewsletterSection />
    </>
  )
}

