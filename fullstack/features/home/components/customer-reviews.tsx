"use client";

import { useRef } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <section className="py-12 md:py-16 bg-primary-foreground">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
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
        "p-6 rounded-lg bg-background shadow-sm",
        "snap-start border border-border"
      )}
    >
      <div className="flex items-start mb-4">
        {/* User avatar */}
        <div className="flex-shrink-0 mr-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-muted relative">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-lg font-medium">
                {review.user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* User info and rating */}
        <div className="flex-1">
          <h3 className="font-medium">{review.user.name}</h3>
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
          </div>
          {review.product_name && (
            <p className="text-xs text-muted-foreground mt-1">
              Đã mua: {review.product_name}
            </p>
          )}
        </div>

        {/* Quote icon */}
        <Quote className="h-6 w-6 text-primary/40" />
      </div>

      {/* Review comment */}
      <p className="text-muted-foreground leading-relaxed line-clamp-4">
        {review.comment}
      </p>
    </div>
  );
}
