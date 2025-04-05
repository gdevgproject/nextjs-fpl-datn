import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getSupabaseServerClient()

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ items: [], appliedDiscount: null })
    }

    const userId = session.user.id

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from("shopping_carts")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (cartError) {
      if (cartError.code === "PGRST116") {
        // No cart found, return empty cart
        return NextResponse.json({ items: [], appliedDiscount: null })
      }
      throw cartError
    }

    const cartId = cart.id

    // Get cart items with product info
    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(`
        id,
        variant_id,
        quantity,
        product_variants!inner(
          id,
          product_id,
          price,
          sale_price,
          stock_quantity,
          volume_ml,
          products!inner(
            id,
            name,
            slug,
            images:product_images(
              id,
              image_url,
              is_main
            )
          )
        )
      `)
      .eq("cart_id", cartId)

    if (itemsError) {
      throw itemsError
    }

    // Transform data to match CartItem type
    const cartItems = items.map((item) => ({
      id: item.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      product: {
        id: item.product_variants.products.id,
        name: item.product_variants.products.name,
        slug: item.product_variants.products.slug,
        price: item.product_variants.price,
        sale_price: item.product_variants.sale_price,
        volume_ml: item.product_variants.volume_ml,
        images: item.product_variants.products.images,
      },
    }))

    // Get applied discount if any
    const { data: discountData } = await supabase.from("discounts").select("*").eq("is_active", true).single()

    return NextResponse.json({
      items: cartItems,
      appliedDiscount: discountData || null,
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

