import { createServerComponentClient } from "@/lib/supabase/server";
import { MainLayout } from "@/features/shop/shared/components/main-layout";
import { CartMergeOnLogin } from "@/features/shop/cart/components/cart-merge-on-login";
import { getShopSettings } from "@/features/shop/shared/services";
import { FloatingChatBot } from "@/features/shop/ai/components/floating-chat-bot";
import type { Category } from "@/features/shop/shared/hooks/use-categories";
import type { Gender } from "@/features/shop/shared/hooks/use-genders";
import type { ShopSettings } from "@/lib/types/shared.types";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerComponentClient();
  // Prefetch categories and genders on server
  const [{ data: catData }, { data: genData }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("display_order", { ascending: true }),
    supabase
      .from("genders")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);
  const initialCategories: Category[] = catData || [];
  const initialGenders: Gender[] = genData || [];
  // Prefetch shop settings
  const initialSettings: ShopSettings = await getShopSettings();

  return (
    <MainLayout
      initialCategories={initialCategories}
      initialGenders={initialGenders}
      initialSettings={initialSettings}
    >
      <CartMergeOnLogin />
      {children}
      <FloatingChatBot />
    </MainLayout>
  );
}
