import type { OrderService, Order, CreateOrderRequest } from "../types/orderTypes"

// Mock order data
const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "user-1",
    items: [
      {
        id: "item-1",
        productId: "1",
        name: "Viên uống NutriGrow Nutrimed bổ sung canxi, vitamin D3",
        price: 480000,
        quantity: 1,
        image: "/placeholder.svg",
      },
      {
        id: "item-2",
        productId: "2",
        name: "Viên uống Rama Bổ Phổi hỗ trợ bổ phổi, giảm ho hiệu quả",
        price: 155000,
        quantity: 2,
        image: "/placeholder.svg",
      },
    ],
    totalItems: 3,
    totalPrice: 790000,
    status: "delivered",
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      address: "123 Đường ABC",
      city: "Hà Nội",
      postalCode: "100000",
      country: "Việt Nam",
      phone: "0987654321",
    },
    paymentMethod: "cod",
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-01-18T10:45:00Z",
  },
  // Add more mock orders as needed
]

export class OrderMockService implements OrderService {
  async getOrders(): Promise<Order[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [...mockOrders]
  }

  async getOrderById(orderId: string): Promise<Order> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const order = mockOrders.find((o) => o.id === orderId)

    if (!order) {
      throw new Error(`Order with id "${orderId}" not found`)
    }

    return { ...order }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // In a real implementation, we would validate the order data
    // and create a new order in the database

    // Create a new order with mock data
    const newOrder: Order = {
      id: `order-${mockOrders.length + 1}`,
      userId: "user-1",
      items: orderData.items.map((item, index) => ({
        id: `item-${index + 1}`,
        productId: item.productId,
        name: `Product ${item.productId}`,
        price: 100000, // Mock price
        quantity: item.quantity,
        image: "/placeholder.svg",
      })),
      totalItems: orderData.items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: orderData.items.reduce((total, item) => total + 100000 * item.quantity, 0), // Mock price calculation
      status: "pending",
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add the new order to the mock data
    mockOrders.push(newOrder)

    return { ...newOrder }
  }
}

// Export a singleton instance
export const orderMockService = new OrderMockService()

