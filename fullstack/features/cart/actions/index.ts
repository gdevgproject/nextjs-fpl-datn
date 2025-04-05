"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { CartItem, Discount, OrderData, OrderResponse } from "../types"

/**
 * Get the current user's cart items
 */
export async function getCartItems() {
  const supabase = getSupabaseServerClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return { items: [], appliedDiscount: null }
  }

  // First get or create the user's cart
  let cartId: number
  const { data: cart, error: cartError } = await supabase
    .from("shopping_carts")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (cartError) {
    if (cartError.code === "PGRST116") {
      // No cart found
      // Create a new cart for the user
      const { data: newCart, error: createError } = await supabase
        .from("shopping_carts")
        .insert({ user_id: userId })
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating shopping cart:", createError)
        return { items: [], appliedDiscount: null }
      }
      cartId = newCart.id
    } else {
      console.error("Error fetching shopping cart:", cartError)
      return { items: [], appliedDiscount: null }
    }
  } else {
    cartId = cart.id
  }

  // Now get cart items with product info using cart_id
  const { data: items, error } = await supabase
    .from("cart_items")
    .select(
      `
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
    `,
    )
    .eq("cart_id", cartId)

  if (error) {
    console.error("Error fetching cart items:", error)
    return { items: [], appliedDiscount: null }
  }

  // Transform data to match CartItem type
  const cartItems: CartItem[] = items.map((item) => ({
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
  const { data: discountData } = await supabase
    .from("user_discounts")
    .select(
      `
      discounts(
        id,
        code,
        discount_percentage,
        max_discount_amount,
        min_order_value,
        is_active,
        start_date,
        end_date,
        max_uses,
        remaining_uses
      )
    `,
    )
    .eq("user_id", userId)
    .eq("is_applied", true)
    .single()

  const appliedDiscount = discountData?.discounts || null

  return { items: cartItems, appliedDiscount }
}

/**
 * Add an item to the cart
 */
export async function addItemToCart(variantId: number, quantity: number) {
  const supabase = getSupabaseServerClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  // Check if item exists in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("variant_id", variantId)
    .single()

  if (existingItem) {
    // Update existing item quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id)

    if (error) throw error
  } else {
    // Insert new item
    const { error } = await supabase.from("cart_items").insert({
      user_id: userId,
      variant_id: variantId,
      quantity,
    })

    if (error) throw error
  }

  revalidatePath("/gio-hang")
  revalidatePath("/thanh-toan")
  revalidatePath("/san-pham")

  return { success: true }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(variantId: number, quantity: number) {
  const supabase = getSupabaseServerClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  // If quantity is 0 or less, remove the item
  if (quantity <= 0) {
    return removeCartItem(variantId)
  }

  // Update item quantity
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("user_id", userId)
    .eq("variant_id", variantId)

  if (error) throw error

  revalidatePath("/gio-hang")
  revalidatePath("/thanh-toan")

  return { success: true }
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(variantId: number) {
  const supabase = getSupabaseServerClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  // Delete the item
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId).eq("variant_id", variantId)

  if (error) throw error

  revalidatePath("/gio-hang")
  revalidatePath("/thanh-toan")

  return { success: true }
}

/**
 * Apply discount code
 */
export async function applyDiscountCode(code: string, subtotal = 0) {
  const supabase = getSupabaseServerClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "User not authenticated" }
  }

  // Get discount details
  const { data: discount, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (error || !discount) {
    return { success: false, error: "Mã giảm giá không hợp lệ" }
  }

  // Check if discount is valid
  const now = new Date().toISOString()

  // Check start date
  if (discount.start_date && new Date(discount.start_date) > new Date(now)) {
    return { success: false, error: "Mã giảm giá chưa có hiệu lực" }
  }

  // Check end date
  if (discount.end_date && new Date(discount.end_date) < new Date(now)) {
    return { success: false, error: "Mã giảm giá đã hết hạn" }
  }

  // Check remaining uses
  if (discount.max_uses && discount.remaining_uses !== null && discount.remaining_uses <= 0) {
    return { success: false, error: "Mã giảm giá đã hết lượt sử dụng" }
  }

  // Check min order value
  if (discount.min_order_value && subtotal < discount.min_order_value) {
    return {
      success: false,
      error: `Giá trị đơn hàng tối thiểu để sử dụng mã là ${new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(discount.min_order_value)}`,
    }
  }

  // Calculate discount amount
  const discountAmount = calculateDiscountAmount(subtotal, discount)

  // Check if user has already applied a discount
  const { data: existingDiscount } = await supabase
    .from("user_discounts")
    .select("id")
    .eq("user_id", userId)
    .eq("is_applied", true)
    .single()

  if (existingDiscount) {
    // Remove existing discount
    await supabase.from("user_discounts").update({ is_applied: false }).eq("id", existingDiscount.id)
  }

  // Apply new discount
  const { error: applyError } = await supabase.from("user_discounts").insert({
    user_id: userId,
    discount_id: discount.id,
    is_applied: true,
  })

  if (applyError) {
    return { success: false, error: "Không thể áp dụng mã giảm giá" }
  }

  revalidatePath("/gio-hang")
  revalidatePath("/thanh-toan")

  return {
    success: true,
    data: {
      discount: discount,
      discountAmount: discountAmount,
    },
  }
}

/**
 * Remove applied discount code
 */
export async function removeDiscountCode() {
  const supabase = getSupabaseServerClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "User not authenticated" }
  }

  // Update user discount to not applied
  const { error } = await supabase
    .from("user_discounts")
    .update({ is_applied: false })
    .eq("user_id", userId)
    .eq("is_applied", true)

  if (error) {
    return { success: false, error: "Không thể xóa mã giảm giá" }
  }

  revalidatePath("/gio-hang")
  revalidatePath("/thanh-toan")

  return { success: true }
}

/**
 * Create a new order
 */
export async function createOrder(orderData: OrderData): Promise<OrderResponse> {
  const supabase = getSupabaseServerClient()

  // Get user session if authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  try {
    // Start a Supabase transaction to create order and related records
    const { data: orderResult, error: orderError } = await supabase.rpc("create_order", {
      p_user_id: userId || null,
      p_customer_name: orderData.customerInfo.fullName,
      p_customer_email: orderData.customerInfo.email,
      p_customer_phone: orderData.customerInfo.phoneNumber,
      p_shipping_address: JSON.stringify({
        street: orderData.customerInfo.address,
        ward: orderData.customerInfo.ward,
        district: orderData.customerInfo.district,
        province: orderData.customerInfo.province,
      }),
      p_delivery_notes: orderData.customerInfo.note || null,
      p_payment_method_id: orderData.paymentMethod,
      p_shipping_method: orderData.shippingMethod,
      p_subtotal_amount: orderData.subtotal,
      p_shipping_fee: orderData.shippingFee,
      p_discount_amount: orderData.discount,
      p_total_amount: orderData.total,
      p_discount_code: orderData.discountCode || null,
      p_order_items: orderData.items.map((item) => ({
        product_variant_id: item.productVariantId,
        quantity: item.quantity,
        unit_price: item.price,
      })),
    })

    if (orderError) {
      console.error("Error creating order:", orderError)
      return {
        error: orderError.message || "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.",
      }
    }

    if (!orderResult?.order_id) {
      return { error: "Không thể tạo đơn hàng" }
    }

    // If user is authenticated, clear their cart
    if (userId) {
      const { error: clearCartError } = await supabase.from("cart_items").delete().eq("user_id", userId)

      if (clearCartError) {
        console.error("Error clearing cart:", clearCartError)
      }

      // Reset applied discount
      await supabase.from("user_discounts").update({ is_applied: false }).eq("user_id", userId).eq("is_applied", true)
    }

    revalidatePath("/gio-hang")
    revalidatePath("/thanh-toan")
    revalidatePath("/xac-nhan-don-hang")

    // Return order ID for redirection
    return { orderId: orderResult.order_id }
  } catch (error) {
    console.error("Error in createOrder function:", error)
    return {
      error: "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Helper function to calculate discount amount
 */
function calculateDiscountAmount(subtotal: number, discount: Discount): number {
  // Calculate discount amount based on percentage
  let discountAmount = (discount.discount_percentage / 100) * subtotal

  // Apply max discount amount if specified
  if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
    discountAmount = discount.max_discount_amount
  }

  return discountAmount
}

