import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  TimeFilter,
  DashboardOverviewMetrics,
  DashboardOrdersMetrics,
  OrderStatusDistribution,
  PaymentMethodRevenue,
  RecentOrder,
  DashboardProductsMetrics,
  TopSellingProduct,
  LowStockProduct,
  NonMovingProduct,
  BrandRevenue,
  WishlistedProduct,
} from "./types";

// Helper interfaces for Supabase results
interface OrderStatusRow {
  id: number;
  name: string;
}
interface PaymentMethodRow {
  id: number;
  name: string;
}
interface CompletedStatusRow {
  id: number;
}
interface ProductVariantRow {
  id: number;
  volume_ml: number;
  sku: string;
  stock_quantity: number;
  product_id?: number;
  products?: { id: number; name: string };
}
interface HighStockProductRow extends ProductVariantRow {}
interface LastOrderDataRow {
  order_id: number;
  orders: { order_date: string };
}

// Get dashboard overview metrics
export async function getDashboardOverviewMetrics(
  timeFilter: TimeFilter
): Promise<DashboardOverviewMetrics> {
  // Use service role client to bypass RLS
  const supabase = await createServiceRoleClient();

  // Get completed order status IDs (Đã giao, Đã hoàn thành)
  const { data: completedStatuses } = await supabase
    .from("order_statuses")
    .select("id")
    .in("name", ["Đã giao", "Đã hoàn thành"]);

  const completedStatusIds = Array.isArray(completedStatuses)
    ? (completedStatuses as CompletedStatusRow[]).map((status) => status.id)
    : [];

  // Total revenue from completed orders - Using completed_at instead of created_at
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
    0;

  // Total orders created in period - This one keeps created_at since we want ALL orders created in this period
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString());

  // Completed orders in period - Using completed_at for when they were actually completed
  const { count: completedOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  // Average order value
  const averageOrderValue =
    completedOrders && completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Total products sold - Step 1: Get completed order IDs using completed_at
  const { data: completedOrderIds } = await supabase
    .from("orders")
    .select("id")
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  // Then query order_items for these specific order IDs
  let totalProductsSold = 0;
  if (completedOrderIds && completedOrderIds.length > 0) {
    const orderIds = completedOrderIds.map((order) => order.id);

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("quantity")
      .in("order_id", orderIds);

    totalProductsSold =
      orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  }

  // New customers in period
  const { count: newCustomers } = await supabase
    .from("profiles") // Using profiles table instead of auth.users
    .select("id", { count: "exact", head: true })
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString());

  return {
    totalRevenue,
    totalOrders: totalOrders || 0,
    completedOrders: completedOrders || 0,
    averageOrderValue,
    totalProductsSold,
    newCustomers: newCustomers || 0,
  };
}

// Get dashboard orders metrics (Tab 2)
export async function getDashboardOrdersMetrics(
  timeFilter: TimeFilter
): Promise<DashboardOrdersMetrics> {
  // Use service role client to bypass RLS
  const supabase = await createServiceRoleClient();

  // Get all order status IDs and names for reference
  const { data: orderStatuses } = await supabase
    .from("order_statuses")
    .select("id, name");

  const orderStatusesTyped = (orderStatuses || []) as OrderStatusRow[];

  if (!orderStatusesTyped || orderStatusesTyped.length === 0) {
    throw new Error("Failed to fetch order statuses");
  }

  // Status ID mappings
  const statusMap = new Map(
    orderStatusesTyped.map((status: OrderStatusRow) => [status.id, status.name])
  );
  const completedStatusIds = orderStatusesTyped
    .filter((status: OrderStatusRow) =>
      ["Đã giao", "Đã hoàn thành"].includes(status.name)
    )
    .map((status: OrderStatusRow) => status.id);
  const pendingStatusIds = orderStatusesTyped
    .filter((status: OrderStatusRow) =>
      ["Chờ xác nhận", "Đã xác nhận"].includes(status.name)
    )
    .map((status: OrderStatusRow) => status.id);
  const shippingStatusIds = orderStatusesTyped
    .filter((status: OrderStatusRow) => ["Đang giao"].includes(status.name))
    .map((status: OrderStatusRow) => status.id);
  const cancelledStatusIds = orderStatusesTyped
    .filter((status: OrderStatusRow) => ["Đã hủy"].includes(status.name))
    .map((status: OrderStatusRow) => status.id);

  // Define proper interfaces for our data
  interface OrderStatusCount {
    order_status_id: number;
    count: number;
  }

  // 1. Order distribution by status (for pie chart) - FILTERED BY TIME RANGE
  const { data: allOrders } = await supabase
    .from("orders")
    .select("order_status_id")
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString());

  // Group by order_status_id and count with proper typing
  const ordersByStatusData: OrderStatusCount[] = [];

  if (allOrders && allOrders.length > 0) {
    // Using a Map for grouping by order_status_id
    const statusCounts = new Map<number, number>();

    (allOrders as { order_status_id: number }[]).forEach((order) => {
      const statusId = order.order_status_id;
      statusCounts.set(statusId, (statusCounts.get(statusId) || 0) + 1);
    });

    // Convert Map to array of OrderStatusCount objects
    statusCounts.forEach((count, order_status_id) => {
      ordersByStatusData.push({ order_status_id, count });
    });
  }

  // Transform and assign colors based on status
  const statusColors: Record<string, string> = {
    "Chờ xác nhận": "#FFC107", // Yellow
    "Đã xác nhận": "#3B82F6", // Blue
    "Đang giao": "#6366F1", // Indigo
    "Đã giao": "#10B981", // Green
    "Đã hoàn thành": "#059669", // Emerald
    "Đã hủy": "#EF4444", // Red
    "Hoàn tiền": "#F97316", // Orange
    "Đổi trả": "#8B5CF6", // Violet
  };

  const ordersByStatus: OrderStatusDistribution[] = ordersByStatusData.map(
    (item: OrderStatusCount) => {
      const statusName =
        statusMap.get(item.order_status_id) || `Status ${item.order_status_id}`;
      return {
        name: statusName,
        count:
          typeof item.count === "string"
            ? parseInt(item.count)
            : item.count || 0,
        color: statusColors[statusName] || "#6B7280", // Gray fallback color
      };
    }
  );

  // 2. Pending Orders Count (Chờ xác nhận, Đã xác nhận)
  // Get current pending orders (as of now)
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", pendingStatusIds);

  // 3. Orders in delivery (Đang giao)
  // Get current shipping orders (as of now)
  const { count: shippingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", shippingStatusIds);

  // 4. Cancelled Orders in period - FILTERED BY TIME RANGE
  const { count: cancelledOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", cancelledStatusIds)
    .gte("updated_at", timeFilter.startDate.toISOString())
    .lte("updated_at", timeFilter.endDate.toISOString());

  // 5. Total Orders in period (for cancellation rate) - FILTERED BY TIME RANGE
  const { count: totalOrdersInPeriod } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString());

  // Calculate cancellation rate
  const cancellationRate = totalOrdersInPeriod
    ? Math.round(((cancelledOrders || 0) / totalOrdersInPeriod) * 100)
    : 0;

  // 6. Revenue by Payment Method - FILTERED BY TIME RANGE
  const { data: paymentMethods } = await supabase
    .from("payment_methods")
    .select("id, name");

  const paymentMethodsTyped = (paymentMethods || []) as PaymentMethodRow[];
  const paymentMethodMap = new Map(
    paymentMethodsTyped.map((pm: PaymentMethodRow) => [pm.id, pm.name]) || []
  );

  // Define proper interface for payment method revenue data
  interface PaymentMethodSum {
    payment_method_id: number;
    sum: number;
  }

  // For payment method revenue, use strongly-typed approach and filter by completed orders in the time range
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("payment_method_id, total_amount")
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  // Calculate sums in JavaScript with proper typing
  const paymentMethodRevenueData: PaymentMethodSum[] = [];

  if (completedOrders && completedOrders.length > 0) {
    const paymentSums = new Map<number, number>();

    completedOrders.forEach((order) => {
      if (order.payment_method_id) {
        const methodId = order.payment_method_id;
        paymentSums.set(
          methodId,
          (paymentSums.get(methodId) || 0) + (order.total_amount || 0)
        );
      }
    });

    // Convert Map to array of PaymentMethodSum objects
    paymentSums.forEach((sum, payment_method_id) => {
      paymentMethodRevenueData.push({ payment_method_id, sum });
    });
  }

  // Payment method colors
  const paymentMethodColors: Record<string, string> = {
    COD: "#3B82F6", // Blue
    MoMo: "#EC4899", // Pink
    VNPay: "#10B981", // Green
    "Chuyển khoản": "#6366F1", // Indigo
    "Ví điện tử": "#8B5CF6", // Violet
    ZaloPay: "#06B6D4", // Cyan
    "Thẻ tín dụng": "#F59E0B", // Amber
    "Thẻ ATM": "#10B981", // Emerald
  };

  const paymentMethodRevenue: PaymentMethodRevenue[] =
    paymentMethodRevenueData.map((item: PaymentMethodSum) => {
      const methodName =
        paymentMethodMap.get(item.payment_method_id) ||
        `Method ${item.payment_method_id}`;
      return {
        name: methodName,
        value:
          typeof item.sum === "string" ? parseFloat(item.sum) : item.sum || 0,
        color: paymentMethodColors[methodName] || "#6B7280", // Gray fallback
      };
    });

  // 7. Recent Orders - FILTERED BY TIME RANGE
  const { data: recentOrdersRaw } = await supabase
    .from("orders")
    .select(
      `
      id, 
      user_id, 
      guest_name,
      order_date,
      total_amount, 
      order_status_id,
      payment_method_id
    `
    )
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString())
    .order("order_date", { ascending: false })
    .limit(10);

  let recentOrders: RecentOrder[] = [];

  if (recentOrdersRaw && recentOrdersRaw.length > 0) {
    // Get user profiles for orders with user_id
    const userIds = recentOrdersRaw
      .filter((order) => order.user_id)
      .map((order) => order.user_id);

    let userMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", userIds);

      if (profiles) {
        profiles.forEach((profile) => {
          userMap.set(profile.id, profile.display_name || profile.email);
        });
      }
    }

    // Process the orders - generating order number from ID
    recentOrders = recentOrdersRaw.map((order: any) => {
      const statusName = statusMap.get(order.order_status_id) || "Unknown";
      const paymentMethod = order.payment_method_id
        ? paymentMethodMap.get(order.payment_method_id) || "Unknown"
        : undefined;

      return {
        id: order.id,
        orderNumber: `#${order.id}`, // Generate order number from ID
        customerName: order.user_id
          ? userMap.get(order.user_id) || "Unknown User"
          : order.guest_name || "Guest",
        orderDate: order.order_date,
        totalAmount: order.total_amount,
        status: statusName,
        statusColor: statusColors[statusName] || "#6B7280",
        paymentMethod: paymentMethod,
      };
    });
  }

  return {
    ordersByStatus,
    pendingOrders: pendingOrders || 0,
    shippingOrders: shippingOrders || 0,
    cancelledOrders: cancelledOrders || 0,
    cancellationRate,
    paymentMethodRevenue,
    recentOrders,
  };
}

// Get dashboard products & inventory metrics (Tab 3)
export async function getDashboardProductsMetrics(
  timeFilter: TimeFilter
): Promise<DashboardProductsMetrics> {
  // Use service role client to bypass RLS
  const supabase = await createServiceRoleClient();

  // Get completed order status IDs (Đã giao, Đã hoàn thành)
  const { data: completedStatuses } = await supabase
    .from("order_statuses")
    .select("id")
    .in("name", ["Đã giao", "Đã hoàn thành"]);

  const completedStatusIds = Array.isArray(completedStatuses)
    ? (completedStatuses as CompletedStatusRow[]).map((status) => status.id)
    : [];

  // ================== 1. Top Selling Products (Quantity) ==================
  // Sửa lỗi: Thay trường url thành image_url cho phù hợp với schema thật
  const { data: topSellingByQuantityData } = await supabase
    .from("order_items")
    .select(
      `
      quantity,
      product_variants!inner(
        product_id,
        products!inner(
          id,
          name,
          brands(
            name
          ),
          product_images(
            image_url,
            is_main
          )
        )
      ),
      orders!inner(
        id,
        order_status_id,
        completed_at
      )
    `
    )
    .in("orders.order_status_id", completedStatusIds)
    .gte("orders.completed_at", timeFilter.startDate.toISOString())
    .lte("orders.completed_at", timeFilter.endDate.toISOString());

  // Xử lý kết quả thô để tính tổng số lượng cho mỗi sản phẩm
  const productQuantityMap = new Map<number, number>();
  const productInfoMap = new Map<
    number,
    { name: string; brand: string; imageUrl?: string }
  >();

  if (topSellingByQuantityData) {
    for (const item of topSellingByQuantityData) {
      if (!item.product_variants || !item.product_variants.product_id) continue;

      const productId = item.product_variants.product_id;
      const currentQuantity = productQuantityMap.get(productId) || 0;
      productQuantityMap.set(productId, currentQuantity + (item.quantity || 0));

      if (!productInfoMap.has(productId) && item.product_variants.products) {
        const product = item.product_variants.products;
        const brandName =
          product.brands && product.brands.name
            ? product.brands.name
            : "Unknown";

        // Lấy URL ảnh chính (is_main = true) nếu có - Sửa thành image_url
        let imageUrl: string | undefined = undefined;
        if (product.product_images && Array.isArray(product.product_images)) {
          const mainImage = product.product_images.find(
            (img) => img.is_main === true
          );
          if (mainImage) {
            imageUrl = mainImage.image_url;
          } else if (product.product_images.length > 0) {
            // Nếu không có ảnh chính, lấy ảnh đầu tiên
            imageUrl = product.product_images[0].image_url;
          }
        }

        productInfoMap.set(productId, {
          name: product.name || "Unknown Product",
          brand: brandName,
          imageUrl,
        });
      }
    }
  }

  // Tạo danh sách các sản phẩm bán chạy theo số lượng
  const topSellingByQuantity = Array.from(productQuantityMap.entries())
    .map(([id, quantity]) => {
      const info = productInfoMap.get(id) || {
        name: "Unknown",
        brand: "Unknown",
      };
      return {
        id,
        name: info.name,
        brand: info.brand,
        quantity,
        revenue: 0, // Chưa tính được doanh thu ở đây
        imageUrl: info.imageUrl,
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // ================== 2. Top Selling Products (Revenue) ==================
  // Sửa lỗi: Thay trường url thành image_url cho phù hợp với schema thật
  const { data: topSellingByRevenueData } = await supabase
    .from("order_items")
    .select(
      `
      quantity,
      unit_price_at_order,
      product_variants!inner(
        product_id,
        products!inner(
          id,
          name,
          brands(
            name
          ),
          product_images(
            image_url,
            is_main
          )
        )
      ),
      orders!inner(
        id,
        order_status_id,
        completed_at
      )
    `
    )
    .in("orders.order_status_id", completedStatusIds)
    .gte("orders.completed_at", timeFilter.startDate.toISOString())
    .lte("orders.completed_at", timeFilter.endDate.toISOString());

  // Xử lý kết quả để tính tổng doanh thu cho mỗi sản phẩm
  const productRevenueMap = new Map<number, number>();

  if (topSellingByRevenueData) {
    for (const item of topSellingByRevenueData) {
      if (!item.product_variants || !item.product_variants.product_id) continue;

      const productId = item.product_variants.product_id;
      const currentRevenue = productRevenueMap.get(productId) || 0;
      const itemRevenue =
        (item.quantity || 0) * (item.unit_price_at_order || 0);
      productRevenueMap.set(productId, currentRevenue + itemRevenue);

      // Thông tin sản phẩm và ảnh đã được lưu trong productInfoMap từ bước trước
      // Chỉ cập nhật nếu chưa có trong productInfoMap
      if (!productInfoMap.has(productId) && item.product_variants.products) {
        const product = item.product_variants.products;
        const brandName =
          product.brands && product.brands.name
            ? product.brands.name
            : "Unknown";

        // Lấy URL ảnh chính (is_main = true) nếu có - Sửa thành image_url
        let imageUrl: string | undefined = undefined;
        if (product.product_images && Array.isArray(product.product_images)) {
          const mainImage = product.product_images.find(
            (img) => img.is_main === true
          );
          if (mainImage) {
            imageUrl = mainImage.image_url;
          } else if (product.product_images.length > 0) {
            // Nếu không có ảnh chính, lấy ảnh đầu tiên
            imageUrl = product.product_images[0].image_url;
          }
        }

        productInfoMap.set(productId, {
          name: product.name || "Unknown Product",
          brand: brandName,
          imageUrl,
        });
      }
    }
  }

  const topSellingByRevenue = Array.from(productRevenueMap.entries())
    .map(([id, revenue]) => {
      const info = productInfoMap.get(id) || {
        name: "Unknown",
        brand: "Unknown",
      };
      return {
        id,
        name: info.name,
        brand: info.brand,
        quantity: productQuantityMap.get(id) || 0, // Lấy thông tin số lượng từ map trước
        revenue,
        imageUrl: info.imageUrl,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ================== 3. Low Stock Products ==================
  const lowStockThreshold = 15;
  const { data: lowStockProductsData } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      volume_ml,
      sku,
      stock_quantity,
      products (
        id,
        name
      )
    `
    )
    .is("deleted_at", null)
    .lt("stock_quantity", lowStockThreshold)
    .gt("stock_quantity", 0)
    .order("stock_quantity")
    .limit(20);

  // Process low stock products data
  const lowStockProducts: LowStockProduct[] = Array.isArray(
    lowStockProductsData
  )
    ? lowStockProductsData.map((item: any) => ({
        id: item.id,
        name:
          item.products && !Array.isArray(item.products)
            ? item.products.name || "Unknown Product"
            : Array.isArray(item.products) && item.products[0]
            ? item.products[0].name || "Unknown Product"
            : "Unknown Product",
        variant: `${item.volume_ml || 0}ml`,
        sku: item.sku || "",
        stockQuantity: item.stock_quantity || 0,
        threshold: lowStockThreshold,
      }))
    : [];

  // ================== 4. Non-Moving Products ==================
  // Tối ưu hóa: Query hiệu quả hơn với ORDER BY và LIMIT trong mỗi lồng nhau
  const highStockThreshold = 50;
  const dayThreshold = 30; // Consider non-moving if not sold in 30 days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dayThreshold);

  const { data: nonMovingProductsData } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      product_id,
      volume_ml,
      sku,
      stock_quantity,
      products(
        name
      ),
      latest_order:order_items(
        created_at,
        orders(
          order_date
        )
      )
    `
    )
    .is("deleted_at", null)
    .gte("stock_quantity", highStockThreshold)
    .order("stock_quantity", { ascending: false })
    .limit(100);

  // Xử lý kết quả để tìm sản phẩm không bán chạy
  const nonMovingProducts: NonMovingProduct[] = [];
  const currentDate = new Date();

  if (nonMovingProductsData && Array.isArray(nonMovingProductsData)) {
    for (const product of nonMovingProductsData) {
      // Tối ưu hóa: Tìm ngày order gần nhất một cách hiệu quả hơn
      let latestOrderDate: string | undefined = undefined;
      let orderDates: Date[] = [];

      // Thu thập tất cả các ngày đơn hàng vào một mảng
      if (product.latest_order && Array.isArray(product.latest_order)) {
        product.latest_order.forEach((orderItem) => {
          if (
            orderItem.orders &&
            typeof orderItem.orders === "object" &&
            orderItem.orders !== null &&
            "order_date" in orderItem.orders
          ) {
            const orderDateStr = orderItem.orders.order_date;
            if (orderDateStr) {
              orderDates.push(new Date(orderDateStr));
            }
          }
        });
      }

      // Tìm ngày gần đây nhất
      if (orderDates.length > 0) {
        const mostRecentDate = new Date(
          Math.max(...orderDates.map((date) => date.getTime()))
        );
        latestOrderDate = mostRecentDate.toISOString();
      }

      // Tính số ngày từ đơn hàng cuối cùng đến nay
      let daysSinceLastOrder: number;
      if (!latestOrderDate) {
        daysSinceLastOrder = 9999; // Chưa từng bán
      } else {
        daysSinceLastOrder = Math.floor(
          (currentDate.getTime() - new Date(latestOrderDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }

      // Thêm vào danh sách nếu không bán được trong thời gian dài
      if (daysSinceLastOrder >= dayThreshold) {
        nonMovingProducts.push({
          id: product.id,
          name:
            typeof product.products === "object" &&
            product.products !== null &&
            !Array.isArray(product.products) &&
            "name" in product.products
              ? String(product.products.name)
              : "Unknown Product",
          variant: `${product.volume_ml || 0}ml`,
          sku: product.sku || "",
          stockQuantity: product.stock_quantity || 0,
          lastOrderDate: latestOrderDate,
          daysSinceLastOrder,
        });

        // Giới hạn 20 sản phẩm
        if (nonMovingProducts.length >= 20) break;
      }
    }
  }

  // ================== 5. Revenue by Brand ==================
  const { data: brandRevenueRawData } = await supabase
    .from("order_items")
    .select(
      `
      quantity,
      unit_price_at_order,
      product_variants!inner(
        products!inner(
          brands(
            id, 
            name
          )
        )
      ),
      orders!inner(
        order_status_id
      )
    `
    )
    .in("orders.order_status_id", completedStatusIds)
    .gte("orders.completed_at", timeFilter.startDate.toISOString())
    .lte("orders.completed_at", timeFilter.endDate.toISOString());

  // Xử lý dữ liệu để tính doanh thu theo thương hiệu
  const brandRevenueMap = new Map<string, number>();

  if (brandRevenueRawData && Array.isArray(brandRevenueRawData)) {
    for (const item of brandRevenueRawData) {
      // Đảm bảo có đủ dữ liệu lồng nhau
      if (
        !item.product_variants ||
        !item.product_variants.products ||
        !item.product_variants.products.brands
      ) {
        continue;
      }

      const brand = item.product_variants.products.brands;
      const brandName = brand.name || "Unknown";
      const itemRevenue =
        (item.quantity || 0) * (item.unit_price_at_order || 0);

      const currentRevenue = brandRevenueMap.get(brandName) || 0;
      brandRevenueMap.set(brandName, currentRevenue + itemRevenue);
    }
  }

  // Brand colors for consistent color scheme
  const brandColors: Record<string, string> = {
    Chanel: "#000000", // Black
    Dior: "#E0BFB8", // Light pink
    Gucci: "#006F51", // Green
    Versace: "#FFD700", // Gold
    Burberry: "#C19A6B", // Tan
    "Dolce & Gabbana": "#B80000", // Red
    Hermès: "#FF8000", // Orange
    Prada: "#000080", // Navy blue
    "Tom Ford": "#4B0082", // Indigo
    "Yves Saint Laurent": "#000000", // Black
    "Jo Malone": "#F5F5DC", // Beige
    Creed: "#C0C0C0", // Silver
    "Acqua di Parma": "#FFFF00", // Yellow
    Byredo: "#FFFFFF", // White
    Diptyque: "#000000", // Black
    "Le Labo": "#8B4513", // Brown
    "Maison Francis Kurkdjian": "#FFD700", // Gold
    "Frederic Malle": "#800000", // Maroon
    Kilian: "#000000", // Black
  };

  // Default color palette for brands without specific colors
  const defaultColors = [
    "#1E88E5",
    "#13B2C4",
    "#7E57C2",
    "#43A047",
    "#FF7043",
    "#FFB300",
    "#00ACC1",
    "#26A69A",
    "#5C6BC0",
    "#EC407A",
    "#AB47BC",
    "#66BB6A",
  ];

  let colorIndex = 0;

  // Tạo đối tượng BrandRevenue từ dữ liệu đã tính
  const brandRevenue: BrandRevenue[] = Array.from(brandRevenueMap.entries())
    .map(([brandName, revenue]) => {
      const color =
        brandColors[brandName] ||
        defaultColors[colorIndex++ % defaultColors.length];
      return {
        name: brandName,
        revenue: revenue,
        color,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // ================== 6. Most Wishlisted Products ==================
  // Sửa lỗi: Xóa bỏ filter deleted_at không tồn tại trên bảng wishlists
  const { data: wishlistRawData } = await supabase.from("wishlists").select(
    `
      products!inner(
        id,
        name,
        brands!inner(
          name
        ),
        product_variants(
          stock_quantity
        )
      )
    `
  );

  // Xử lý dữ liệu để đếm số lượng sản phẩm trong wishlist
  const productWishlistCountMap = new Map<number, number>();
  const wishlistProductInfoMap = new Map<
    number,
    { name: string; brand: string; inStock: boolean }
  >();

  if (wishlistRawData && Array.isArray(wishlistRawData)) {
    for (const item of wishlistRawData) {
      if (!item.products || !item.products.id) continue;

      const productId = item.products.id;
      const currentCount = productWishlistCountMap.get(productId) || 0;
      productWishlistCountMap.set(productId, currentCount + 1);

      // Lưu thông tin sản phẩm và trạng thái còn hàng
      if (!wishlistProductInfoMap.has(productId)) {
        let inStock = false;

        // Kiểm tra nếu có variant nào còn hàng
        if (
          item.products.product_variants &&
          Array.isArray(item.products.product_variants)
        ) {
          inStock = item.products.product_variants.some(
            (variant) => (variant.stock_quantity || 0) > 0
          );
        }

        wishlistProductInfoMap.set(productId, {
          name: item.products.name || "Unknown Product",
          brand: item.products.brands?.name || "Unknown",
          inStock,
        });
      }
    }
  }

  // Tạo danh sách sản phẩm được yêu thích nhiều nhất
  const mostWishlisted: WishlistedProduct[] = Array.from(
    productWishlistCountMap.entries()
  )
    .map(([id, count]) => {
      const info = wishlistProductInfoMap.get(id) || {
        name: "Unknown",
        brand: "Unknown",
        inStock: false,
      };
      return {
        id,
        name: info.name,
        brand: info.brand,
        count,
        inStock: info.inStock,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ================== 7. Calculate Total Inventory Value ==================
  const { data: inventoryValueData } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      stock_quantity,
      price,
      sale_price
    `
    )
    .is("deleted_at", null);

  // Tính tổng giá trị tồn kho
  let totalInventoryValue = 0;

  if (inventoryValueData && Array.isArray(inventoryValueData)) {
    totalInventoryValue = inventoryValueData.reduce((total, variant) => {
      const price = variant.sale_price || variant.price || 0;
      return total + (variant.stock_quantity || 0) * price;
    }, 0);
  }

  // ================== 8. Product Counts ==================
  // Total active products
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  // Out of stock products
  const { count: outOfStockCount } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null)
    .eq("stock_quantity", 0);

  // Low stock products count
  const { count: lowStockCount } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null)
    .gt("stock_quantity", 0)
    .lt("stock_quantity", lowStockThreshold);

  return {
    topSellingByQuantity,
    topSellingByRevenue,
    lowStockProducts,
    nonMovingProducts,
    brandRevenue,
    mostWishlisted,
    totalInventoryValue,
    productCount: productCount || 0,
    outOfStockCount: outOfStockCount || 0,
    lowStockCount: lowStockCount || 0,
  };
}

// Generate time filter based on predefined options
export function generateTimeFilter(
  option: string,
  customRange?: { from: Date; to: Date }
): TimeFilter {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (option) {
    case "today":
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    }

    case "thisWeek": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(
        today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
      ); // Start on Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return {
        startDate: startOfWeek,
        endDate: endOfWeek,
      };
    }

    case "lastWeek": {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(
        today.getDate() - today.getDay() - 6 + (today.getDay() === 0 ? -7 : 0)
      );
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      return {
        startDate: startOfLastWeek,
        endDate: endOfLastWeek,
      };
    }

    case "thisMonth": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return {
        startDate: startOfMonth,
        endDate: endOfMonth,
      };
    }

    case "lastMonth": {
      const startOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      return {
        startDate: startOfLastMonth,
        endDate: endOfLastMonth,
      };
    }

    case "thisYear": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      return {
        startDate: startOfYear,
        endDate: endOfYear,
      };
    }

    case "custom":
      if (customRange?.from && customRange?.to) {
        const endDate = new Date(customRange.to);
        endDate.setHours(23, 59, 59, 999);
        return {
          startDate: customRange.from,
          endDate: endDate,
        };
      }
      // Fallback to this month if custom range is invalid
      return generateTimeFilter("thisMonth");

    default:
      return generateTimeFilter("thisMonth");
  }
}
