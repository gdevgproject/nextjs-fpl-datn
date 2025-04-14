import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/shop/products/queries";
import { ProductDetailPage } from "@/features/shop/products/components/product-detail-page";

interface ProductPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Lấy thông tin sản phẩm
  const product = await getProductBySlug(params.slug);

  // Nếu không tìm thấy sản phẩm, trả về metadata mặc định
  if (!product) {
    return {
      title: "Sản phẩm không tồn tại - MyBeauty",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa",
    };
  }

  // Tạo metadata từ thông tin sản phẩm
  return {
    title: `${product.name} - MyBeauty`,
    description:
      product.short_description ||
      `${product.name} - Nước hoa chính hãng tại MyBeauty`,
    openGraph: {
      title: `${product.name} - MyBeauty`,
      description:
        product.short_description ||
        `${product.name} - Nước hoa chính hãng tại MyBeauty`,
      images: product.images?.find((img: any) => img.is_main)?.image_url
        ? [product.images.find((img: any) => img.is_main)!.image_url]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  // Lấy thông tin sản phẩm
  const product = await getProductBySlug(params.slug);

  // Nếu không tìm thấy sản phẩm, trả về trang 404
  if (!product) {
    notFound();
  }

  // Kiểm tra xem có yêu cầu hiển thị form đánh giá không
  const showReviewForm = searchParams.review === "true";

  return (
    <ProductDetailPage product={product} showReviewForm={showReviewForm} />
  );
}
