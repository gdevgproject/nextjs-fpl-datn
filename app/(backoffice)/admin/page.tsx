import { AdminLayout } from "@/features/admin/shared/components/admin-layout";
import { DashboardOverview } from "@/features/admin/dashboard/components/dashboard-overview";
import { DashboardOrders } from "@/features/admin/dashboard/components/dashboard-orders";
import { DashboardProducts } from "@/features/admin/dashboard/components/dashboard-products";
import { DashboardCustomers } from "@/features/admin/dashboard/components/dashboard-customers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="products">Sản phẩm & Tồn kho</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="promotions" disabled>
              Khuyến mãi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <DashboardOrders />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <DashboardProducts />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <DashboardCustomers />
          </TabsContent>

          <TabsContent value="promotions">
            <p className="text-muted-foreground">Chức năng đang phát triển</p>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
