"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

interface Review {
  id: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  product_name?: string;
  product_slug?: string;
  created_at?: string;
}

interface CustomerReviewsProps {
  reviews: Review[];
}

export function CustomerReviews({ reviews }: CustomerReviewsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Skip rendering if no reviews
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount =
        direction === "left" ? -container.offsetWidth : container.offsetWidth;

      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30 dark:bg-muted/10">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-muted-foreground mt-2">
              Trải nghiệm của khách hàng sau khi mua sắm tại MyBeauty
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              aria-label="Next reviews"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable reviews container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none" }}
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className={cn(
        "flex flex-col min-w-[300px] md:min-w-[400px] max-w-md",
        "p-6 rounded-lg bg-background border border-border shadow-sm",
        "snap-start hover:shadow-md transition-shadow"
      )}
    >
      <div className="flex items-start gap-4">
        {/* User avatar */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-muted relative flex items-center justify-center">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-lg font-medium bg-primary/10 text-primary">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User info and rating */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{review.user.name}</h3>
            <Quote className="h-5 w-5 text-primary/30 dark:text-primary/20" />
          </div>

          <div className="flex items-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < review.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted stroke-muted"
                )}
              />
            ))}
            {review.created_at && (
              <span className="text-xs text-muted-foreground ml-2">
                {formatDate(review.created_at)}
              </span>
            )}
          </div>

          {review.product_name && (
            <div className="text-xs text-muted-foreground mt-1">
              Đã mua:{" "}
              {review.product_slug ? (
                <Link
                  href={`/san-pham/${review.product_slug}`}
                  className="hover:underline text-primary"
                >
                  {review.product_name}
                </Link>
              ) : (
                <span>{review.product_name}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review comment */}
      <div className="mt-4">
        <p className="text-muted-foreground leading-relaxed">
          "{review.comment}"
        </p>
      </div>
    </div>
  );
}
