"use client";

import { memo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink } from "lucide-react";

interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  products: {
    name: string;
    slug: string;
  };
}

interface UserReviewsTabProps {
  reviews: Review[];
  isLoading?: boolean;
}

// Format date helper
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function UserReviewsTabComponent({
  reviews,
  isLoading = false,
}: UserReviewsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-16 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Người dùng này chưa đánh giá sản phẩm nào.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <Link
                href={`/admin/products/${review.products.slug}`}
                className="font-medium hover:underline"
              >
                {review.products.name}
              </Link>
              <Badge variant={review.is_approved ? "success" : "warning"}>
                {review.is_approved ? "Đã duyệt" : "Chờ duyệt"}
              </Badge>
            </div>
            <div className="mb-2">
              <RatingStars rating={review.rating} />
            </div>
            <p className="text-sm mb-4 line-clamp-3">{review.comment}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/reviews/${review.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default memo(UserReviewsTabComponent);
