import { AdminLayout } from "@/features/admin/shared/components/admin-layout";

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <p>Welcome to the admin dashboard</p>
        </div>
      </div>
    </AdminLayout>
  );
}
