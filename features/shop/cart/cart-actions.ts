"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/error-utils";
import type { CartItem, GuestCheckoutInfo } from "./types";
import type { Address } from "@/features/shop/account/types";

/**
 * Add a product to the cart
 */
export async function addToCart(variantId: number, quantity: number) {
  const supabase = await getSupabaseServerClient();

  try {
    // Ensure user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(
        "You must be logged in to add items to cart",
        "unauthorized"
      );
    }

    const userId = session.user.id;

    // Check if the product variant exists and has enough stock
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("id, stock_quantity, price, sale_price")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return createErrorResponse("Product variant not found", "not_found");
    }

    if (variant.stock_quantity < quantity) {
      return createErrorResponse(
        `Insufficient stock. Only ${variant.stock_quantity} item(s) available.`,
        "insufficient_stock"
      );
    }

    // Get or create user's cart
    const { data: cart, error: cartError } = await supabase
      .from("shopping_carts")
      .select("id")
      .eq("user_id", userId)
      .single();

    let cartId: number;

    if (cartError) {
      if (cartError.code === "PGRST116") {
        // Cart not found, create one
        const { data: newCart, error: createError } = await supabase
          .from("shopping_carts")
          .insert({ user_id: userId })
          .select("id")
          .single();

        if (createError) {
          return createErrorResponse(createError.message);
        }

        cartId = newCart.id;
      } else {
        return createErrorResponse(cartError.message);
      }
    } else {
      cartId = cart.id;
    }

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variant_id", variantId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      return createErrorResponse(checkError.message);
    }

    if (existingItem) {
      // Update existing item's quantity
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);

      if (updateError) {
        return createErrorResponse(updateError.message);
      }
    } else {
      // Add new item to cart
      const { error: insertError } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        variant_id: variantId,
        quantity,
      });

      if (insertError) {
        return createErrorResponse(insertError.message);
      }
    }

    revalidatePath("/gio-hang");
    revalidatePath("/api/cart");

    return createSuccessResponse({
      message: "Product added to cart successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Update the quantity of a cart item
 */
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await getSupabaseServerClient();

  try {
    // Ensure user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(
        "You must be logged in to update cart items",
        "unauthorized"
      );
    }

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from("shopping_carts")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (cartError) {
      return createErrorResponse("Cart not found", "not_found");
    }

    // Check if item exists and belongs to user's cart
    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select("id, variant_id")
      .eq("id", itemId)
      .eq("cart_id", cart.id)
      .single();

    if (itemError) {
      return createErrorResponse("Cart item not found", "not_found");
    }

    // Check variant's stock
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", item.variant_id)
      .single();

    if (variantError || !variant) {
      return createErrorResponse("Product variant not found", "not_found");
    }

    if (variant.stock_quantity < quantity) {
      return createErrorResponse(
        `Insufficient stock. Only ${variant.stock_quantity} item(s) available.`,
        "insufficient_stock"
      );
    }

    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (deleteError) {
        return createErrorResponse(deleteError.message);
      }
    } else {
      // Update quantity
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (updateError) {
        return createErrorResponse(updateError.message);
      }
    }

    revalidatePath("/gio-hang");
    revalidatePath("/api/cart");

    return createSuccessResponse({
      message:
        quantity <= 0 ? "Item removed from cart" : "Cart updated successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(itemId: string) {
  const supabase = await getSupabaseServerClient();

  try {
    // Ensure user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(
        "You must be logged in to remove cart items",
        "unauthorized"
      );
    }

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from("shopping_carts")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (cartError) {
      return createErrorResponse("Cart not found", "not_found");
    }

    // Check if item exists and belongs to user's cart
    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select("id")
      .eq("id", itemId)
      .eq("cart_id", cart.id)
      .single();

    if (itemError) {
      return createErrorResponse("Cart item not found", "not_found");
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      return createErrorResponse(deleteError.message);
    }

    revalidatePath("/gio-hang");
    revalidatePath("/api/cart");

    return createSuccessResponse({
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Clear all items from the cart
 */
export async function clearCart() {
  const supabase = await getSupabaseServerClient();

  try {
    // Ensure user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(
        "You must be logged in to clear your cart",
        "unauthorized"
      );
    }

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from("shopping_carts")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (cartError) {
      if (cartError.code === "PGRST116") {
        // Cart not found, nothing to clear
        return createSuccessResponse({
          message: "Cart is already empty",
        });
      }
      return createErrorResponse(cartError.message);
    }

    // Delete all items in the cart
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (deleteError) {
      return createErrorResponse(deleteError.message);
    }

    revalidatePath("/gio-hang");
    revalidatePath("/api/cart");

    return createSuccessResponse({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Apply a discount code to the cart
 */
export async function applyDiscountCode(code: string, subtotal: number) {
  const supabase = await getSupabaseServerClient();

  try {
    // Find the discount code
    const { data: discount, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!discount) {
      return createErrorResponse("Mã giảm giá không tồn tại hoặc đã hết hạn");
    }

    // Check if discount is still valid (dates)
    const now = new Date();
    if (discount.start_date && new Date(discount.start_date) > now) {
      return createErrorResponse(
        `Mã giảm giá chưa có hiệu lực. Có hiệu lực từ: ${new Date(
          discount.start_date
        ).toLocaleDateString("vi-VN")}`
      );
    }

    if (discount.end_date && new Date(discount.end_date) < now) {
      return createErrorResponse("Mã giảm giá đã hết hạn");
    }

    // Check if discount has remaining uses
    if (
      discount.max_uses !== null &&
      discount.remaining_uses !== null &&
      discount.remaining_uses <= 0
    ) {
      return createErrorResponse("Mã giảm giá đã hết lượt sử dụng");
    }

    // Check if cart meets minimum order value
    if (discount.min_order_value && subtotal < discount.min_order_value) {
      return createErrorResponse(
        `Giá trị đơn hàng tối thiểu để áp dụng mã là ${new Intl.NumberFormat(
          "vi-VN",
          {
            style: "currency",
            currency: "VND",
          }
        ).format(discount.min_order_value)}`
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discount_percentage) {
      discountAmount = (subtotal * discount.discount_percentage) / 100;

      // Cap discount amount if max_discount_amount is set
      if (
        discount.max_discount_amount &&
        discountAmount > discount.max_discount_amount
      ) {
        discountAmount = discount.max_discount_amount;
      }
    }

    return createSuccessResponse({
      discount,
      discountAmount,
    });
  } catch (error) {
    console.error("Error applying discount code:", error);
    return createErrorResponse("Đã xảy ra lỗi khi áp dụng mã giảm giá");
  }
}

/**
 * Remove discount code
 */
export async function removeDiscountCode() {
  try {
    revalidatePath("/gio-hang");
    revalidatePath("/api/cart");

    return createSuccessResponse({
      message: "Discount code removed successfully",
    });
  } catch (error) {
    return createErrorResponse("Đã xảy ra lỗi khi xóa mã giảm giá");
  }
}

/**
 * Place an order
 */
export async function placeOrder({
  shippingAddress,
  paymentMethodId,
  deliveryNotes,
  discountId,
  cartItems,
  subtotal,
  discountAmount,
  shippingFee,
  total,
  guestInfo,
}: {
  shippingAddress: Address;
  paymentMethodId: number;
  deliveryNotes?: string;
  discountId?: number;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  guestInfo?: GuestCheckoutInfo | null;
}) {
  const supabase = await getSupabaseServerClient();

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Format numeric values correctly for PostgreSQL
    const numericSubtotal = Number(parseFloat(subtotal.toString()).toFixed(2));
    // Đảm bảo discountAmount luôn là số, ngay cả khi là 0
    const numericDiscountAmount = Number(
      parseFloat((discountAmount || 0).toString()).toFixed(2)
    );
    const numericShippingFee = Number(
      parseFloat(shippingFee.toString()).toFixed(2)
    );
    const numericTotal = Number(parseFloat(total.toString()).toFixed(2));

    // Log chi tiết các giá trị để debug
    console.log("CART ACTIONS - PLACE ORDER VALUES:", {
      subtotal_amount: numericSubtotal,
      discount_amount: numericDiscountAmount,
      shipping_fee: numericShippingFee,
      total: numericTotal,
      discount_id: discountId || null,
    });

    // Start transaction
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        guest_name: !userId ? guestInfo?.name : null,
        guest_email: !userId ? guestInfo?.email : null,
        guest_phone: !userId ? guestInfo?.phone : null,
        recipient_name: shippingAddress.recipient_name,
        recipient_phone: shippingAddress.phone_number,
        province_city: shippingAddress.province_city,
        district: shippingAddress.district,
        ward: shippingAddress.ward,
        street_address: shippingAddress.street_address,
        order_date: new Date().toISOString(),
        delivery_notes: deliveryNotes || null,
        payment_method_id: paymentMethodId,
        payment_status: "Pending",
        order_status_id: 1, // Pending status
        discount_id: discountId || null,
        subtotal_amount: numericSubtotal,
        discount_amount: numericDiscountAmount, // Fix: explicit numeric value
        shipping_fee: numericShippingFee,
        total_amount: numericTotal,
      })
      .select("id")
      .single();

    if (orderError) {
      throw orderError;
    }

    // Get order ID
    const orderId = newOrder.id;

    // Insert order items
    for (const item of cartItems) {
      // Get product variant details
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select(
          `
          id,
          volume_ml,
          price,
          sale_price,
          products(id, name)
        `
        )
        .eq("id", item.variant_id)
        .single();

      if (variantError) {
        throw variantError;
      }

      // Calculate unit price (use sale_price if available)
      const unitPrice = variant.sale_price || variant.price;

      // Insert order item
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: item.variant_id,
        product_name: variant.products.name,
        variant_volume_ml: variant.volume_ml,
        quantity: item.quantity,
        unit_price_at_order: unitPrice,
      });

      if (itemError) {
        throw itemError;
      }
    }

    // If user is logged in, clear their cart
    if (userId) {
      const { data: cart, error: cartError } = await supabase
        .from("shopping_carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cartError && cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);
      }
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      payment_date: new Date().toISOString(),
      payment_method_id: paymentMethodId,
      amount: total,
      status: "Pending",
    });

    if (paymentError) {
      throw paymentError;
    }

    // Revalidate relevant pages
    revalidatePath("/gio-hang");
    revalidatePath("/thanh-toan");
    revalidatePath(`/xac-nhan-don-hang?id=${orderId}`);
    revalidatePath("/tai-khoan/don-hang");
    revalidatePath("/api/cart");

    return createSuccessResponse({
      orderId,
      orderNumber: `#${orderId.toString().padStart(6, "0")}`,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return createErrorResponse(
      "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau."
    );
  }
}

/**
 * Validate a discount code for cart page
 * This is specifically for the cart page to validate and return discount info
 * without actually applying it to the database yet
 */
export async function validateDiscountCode(code: string, subtotal = 0) {
  const supabase = await getSupabaseServerClient();

  if (!code.trim()) {
    return { success: false, error: "Vui lòng nhập mã giảm giá" };
  }

  // Get discount details
  const { data: discount, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !discount) {
    return { success: false, error: "Mã giảm giá không hợp lệ" };
  }

  // Check if discount is valid
  const now = new Date();

  // Check start date
  if (discount.start_date && new Date(discount.start_date) > now) {
    return { success: false, error: "Mã giảm giá chưa có hiệu lực" };
  }

  // Check end date
  if (discount.end_date && new Date(discount.end_date) < now) {
    return { success: false, error: "Mã giảm giá đã hết hạn" };
  }

  // Check remaining uses
  if (
    discount.max_uses &&
    discount.remaining_uses !== null &&
    discount.remaining_uses <= 0
  ) {
    return { success: false, error: "Mã giảm giá đã hết lượt sử dụng" };
  }

  // Check min order value
  if (discount.min_order_value && subtotal < discount.min_order_value) {
    return {
      success: false,
      error: `Giá trị đơn hàng tối thiểu để sử dụng mã là ${new Intl.NumberFormat(
        "vi-VN",
        {
          style: "currency",
          currency: "VND",
        }
      ).format(discount.min_order_value)}`,
    };
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (!discount.discount_percentage) {
    // Mã giảm giá cứng: lấy max_discount_amount (không vượt quá subtotal)
    discountAmount =
      discount.max_discount_amount && discount.max_discount_amount > 0
        ? Math.min(discount.max_discount_amount, subtotal)
        : 0;
  } else {
    // Mã giảm giá phần trăm
    discountAmount = (subtotal * discount.discount_percentage) / 100;
    if (
      discount.max_discount_amount &&
      discountAmount > discount.max_discount_amount
    ) {
      discountAmount = discount.max_discount_amount;
    }
  }

  // Nếu không có giảm giá hợp lệ
  if (!discountAmount || discountAmount <= 0) {
    return {
      success: false,
      error: "Mã giảm giá không áp dụng được cho đơn hàng này",
    };
  }

  return {
    success: true,
    data: {
      discount: discount,
      discountAmount: discountAmount,
    },
  };
}

/**
 * Get product variant details
 */
export async function getProductVariantDetails(variantId: number) {
  const supabase = await getSupabaseServerClient();

  try {
    // Get variant details with product info
    const { data, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        product_id,
        price,
        sale_price,
        stock_quantity,
        volume_ml,
        products:product_id(
          id,
          name,
          slug,
          images:product_images(
            id,
            image_url,
            is_main
          )
        )
      `
      )
      .eq("id", variantId)
      .single();

    if (error) {
      return createErrorResponse(error.message);
    }

    if (!data) {
      return createErrorResponse("Product variant not found");
    }

    // Transform data to match product structure in CartItem
    const productData = {
      id: data.products.id,
      name: data.products.name,
      slug: data.products.slug,
      price: data.price,
      sale_price: data.sale_price,
      volume_ml: data.volume_ml,
      images: data.products.images,
    };

    return createSuccessResponse(productData);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Merge guest cart items into the authenticated user's cart after login
 * - guestItems: array of CartItem from localStorage
 * - userId: Supabase user id
 *
 * This function will:
 * 1. Get or create the user's shopping cart
 * 2. For each guest item, upsert (add or update) into cart_items
 * 3. Return success or error
 */
export async function mergeGuestCartAction(
  guestItems: CartItem[],
  userId: string
) {
  if (!userId) return { error: "User not authenticated" };
  if (!Array.isArray(guestItems) || guestItems.length === 0)
    return { success: true };

  const supabase = await getSupabaseServerClient();

  // Get or create shopping cart
  let cartId: number;
  const { data: cart, error: cartError } = await supabase
    .from("shopping_carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (cartError) {
    if (cartError.code === "PGRST116") {
      // Not found, create
      const { data: newCart, error: createError } = await supabase
        .from("shopping_carts")
        .insert({ user_id: userId })
        .select("id")
        .single();
      if (createError) return { error: createError.message };
      cartId = newCart.id;
    } else {
      return { error: cartError.message };
    }
  } else {
    cartId = cart.id;
  }

  // Upsert each guest item
  for (const item of guestItems) {
    // Check if item exists
    const { data: existing, error: checkError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variant_id", item.variant_id)
      .maybeSingle();
    if (checkError && checkError.code !== "PGRST116")
      return { error: checkError.message };
    if (existing) {
      // Update quantity (sum)
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + item.quantity })
        .eq("id", existing.id);
      if (updateError) return { error: updateError.message };
    } else {
      // Insert new
      const { error: insertError } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
      if (insertError) return { error: insertError.message };
    }
  }

  return { success: true };
}
