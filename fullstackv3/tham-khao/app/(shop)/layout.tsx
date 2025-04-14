import type React from "react"
import { Header } from "@/components/layout/shop/header"
import { Footer } from "@/components/layout/shop/footer"
import { createClient } from "@/shared/supabase/server"

async function getShopSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("shop_settings").select("*").eq("id", 1).single()

  if (error) {
    console.error("Error fetching shop settings:", error)
    return null
  }

  return data
}

async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_category_id")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data
}

async function getGenders() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("genders").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching genders:", error)
    return []
  }

  return data
}

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [shopSettings, categories, genders] = await Promise.all([getShopSettings(), getCategories(), getGenders()])

  return (
    <div className="flex min-h-screen flex-col">
      <Header shopLogo={shopSettings?.shop_logo_url || ""} categories={categories} genders={genders} />
      <main className="flex-1">{children}</main>
      <Footer shopSettings={shopSettings} categories={categories} />
    </div>
  )
}
