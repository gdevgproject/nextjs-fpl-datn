import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.number(),
  product_name: z.string(),
  variant_attributes: z.string(),
  quantity: z.number(),
  price: z.number(),
  product_image: z.string().nullable(), // snapshot image nếu có, hiện tại luôn null
});

export const OrderConfirmationSchema = z.object({
  id: z.number(),
  order_number: z.number(),
  created_at: z.string(),
  customer_name: z.string(),
  customer_email: z.string().nullable(),
  customer_phone: z.string().nullable(),
  shipping_address: z.string(),
  delivery_notes: z.string().nullable(),
  payment_method: z.string(),
  payment_status: z.string(),
  shipping_method: z.string(),
  subtotal: z.number(),
  discount: z.number(),
  shipping_fee: z.number(),
  total: z.number(),
  status: z.string(),
  items: z.array(OrderItemSchema),
  access_token: z.string().nullable(), // Mã tra cứu đơn hàng cho guest
});

export type OrderConfirmationData = z.infer<typeof OrderConfirmationSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
