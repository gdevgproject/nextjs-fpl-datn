"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import ScentStory from "@/components/ScentStory"
import BrandUniverse from "@/components/BrandUniverse"
import HotPicks from "@/components/HotPicks"
import DealsOffers from "@/components/DealsOffers"
import Footer from "@/components/Footer"
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchSlides,
  fetchSlideGalleries,
  fetchDiscounts,
} from "@/lib/mockData"
import type { Product, Category, Brand, Slide, SlideGallery, Discount } from "@/lib/mockData"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [slideGalleries, setSlideGalleries] = useState<SlideGallery[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData, brandsData, slidesData, slideGalleriesData, discountsData] =
          await Promise.all([
            fetchProducts(),
            fetchCategories(),
            fetchBrands(),
            fetchSlides(),
            fetchSlideGalleries(),
            fetchDiscounts(),
          ])
        setProducts(productsData)
        setCategories(categoriesData)
        setBrands(brandsData)
        setSlides(slidesData)
        setSlideGalleries(slideGalleriesData)
        setDiscounts(discountsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header categories={categories} brands={brands} />
      <main className="flex-grow">
        <HeroSection slides={slides} slideGalleries={slideGalleries} />
        <ScentStory categories={categories} />
        <BrandUniverse brands={brands} />
        <HotPicks products={products} brands={brands} />
        <DealsOffers discounts={discounts} />
      </main>
      <Footer />
    </div>
  )
}

