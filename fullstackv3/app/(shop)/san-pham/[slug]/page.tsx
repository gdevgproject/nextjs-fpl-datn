import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import ProductImageGallery from "@/features/shop/product-details/components/product-image-gallery";
import ProductInfo from "@/features/shop/product-details/components/product-info";
import NotePyramid from "@/features/shop/product-details/components/note-pyramid";
import ProductDescription from "@/features/shop/product-details/components/product-description";
import ProductReviews from "@/features/shop/product-details/components/product-reviews";
import { Separator } from "@/components/ui/separator";
import { getProductDetailBySlug } from "@/features/shop/product-details/services";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductDetailBySlug(resolvedParams.slug);
  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
    };
  }
  return {
    title: `${product.name} | MyBeauty`,
    description:
      product.short_description ||
      product.long_description?.substring(0, 160) ||
      "Khám phá nước hoa cao cấp tại MyBeauty",
    openGraph: {
      images: product.images.find((img) => img.is_main)?.image_url
        ? [product.images.find((img) => img.is_main)?.image_url as string]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductDetailBySlug(resolvedParams.slug);
  if (!product) notFound();

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ProductImageGallery images={product.images} />
        <ProductInfo
          product={product}
          brand={product.brand}
          variants={product.variants}
          gender={product.gender}
          concentration={product.concentration}
          perfumeType={product.perfumeType}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Tháp hương</h2>
          <NotePyramid notePyramid={product.notePyramid} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Mô tả sản phẩm</h2>
          <ProductDescription product={product} />
        </div>
      </div>
      <Separator className="my-8" />
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Đánh giá từ khách hàng</h2>
        <ProductReviews reviews={product.reviews} productId={product.id} />
      </div>
    </div>
  );
}
