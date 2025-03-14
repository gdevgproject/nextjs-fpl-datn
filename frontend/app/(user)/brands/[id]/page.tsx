import { fetchBrand, fetchProducts } from "@/lib/mockData";
import ProductGrid from "@/components/ProductGrid";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Globe } from "lucide-react";

interface BrandPageProps {
  params: {
    id: string;
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brand = await fetchBrand(params.id);
  if (!brand) notFound();

  const allProducts = await fetchProducts();
  const brandProducts = allProducts.filter(
    (product) => product.fragrance_brand_id === params.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 relative">
              <Image
                src={brand.logo || "/brand-placeholder.png"}
                alt={brand.name}
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-4">{brand.name}</h1>
              <p className="text-gray-600 text-lg mb-6 max-w-2xl">
                {brand.description}
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button variant="outline" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
                <Button variant="outline" size="sm">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
                <Button variant="outline" size="sm">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="products" className="flex-1">
              Sản phẩm ({brandProducts.length})
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1">
              Về thương hiệu
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              Lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            {/* Filters and Sort */}
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Button variant="outline">Lọc</Button>
                <select className="px-4 py-2 border rounded-md">
                  <option>Mới nhất</option>
                  <option>Giá: Thấp đến cao</option>
                  <option>Giá: Cao đến thấp</option>
                  <option>Phổ biến nhất</option>
                </select>
              </div>
              <p className="text-gray-600">
                Hiển thị {brandProducts.length} sản phẩm
              </p>
            </div>

            {/* Products Grid */}
            <ProductGrid products={brandProducts} />
          </TabsContent>

          <TabsContent value="about">
            <div className="prose prose-lg max-w-none">
              <h2>Về {brand.name}</h2>
              <p>{brand.description}</p>
              {/* Thêm nội dung chi tiết về thương hiệu */}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="prose prose-lg max-w-none">
              <h2>Lịch sử phát triển</h2>
              {/* Thêm timeline hoặc nội dung về lịch sử thương hiệu */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
