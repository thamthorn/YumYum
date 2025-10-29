"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ReviewResponse = {
  id: string;
  buyerName: string | null;
  rating: number;
  qualityRating: number | null;
  communicationRating: number | null;
  deliveryRating: number | null;
  serviceRating: number | null;
  title: string | null;
  reviewText: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
};

type ReviewsListProps = {
  oemOrgId: string;
  initialRating?: number;
  initialTotalReviews?: number;
};

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function ReviewsList({
  oemOrgId,
  initialRating = 0,
  initialTotalReviews = 0,
}: ReviewsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading } = useQuery<{
    data: ReviewResponse[];
    meta: { total: number };
  }>({
    queryKey: ["oem-reviews", oemOrgId],
    queryFn: async () => {
      const response = await fetch(`/api/oems/${oemOrgId}/reviews?limit=20`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to mark review as helpful");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oem-reviews", oemOrgId] });
      toast({
        title: "Thank you!",
        description: "Your feedback has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reviews = reviewsData?.data || [];
  const total = reviewsData?.meta?.total || initialTotalReviews;

  // Calculate average rating from actual reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : initialRating;

  // Calculate category averages
  const categoryAverages =
    reviews.length > 0
      ? {
          quality:
            reviews.reduce((sum, r) => sum + (r.qualityRating || r.rating), 0) /
            reviews.length,
          communication:
            reviews.reduce(
              (sum, r) => sum + (r.communicationRating || r.rating),
              0
            ) / reviews.length,
          delivery:
            reviews.reduce(
              (sum, r) => sum + (r.deliveryRating || r.rating),
              0
            ) / reviews.length,
          service:
            reviews.reduce((sum, r) => sum + (r.serviceRating || r.rating), 0) /
            reviews.length,
        }
      : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center text-muted-foreground">
          Loading reviews...
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {avgRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(avgRating)
                    ? "fill-primary text-primary"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">{total} reviews</div>
        </Card>

        {categoryAverages &&
          [
            { label: "Quality", value: categoryAverages.quality },
            { label: "Communication", value: categoryAverages.communication },
            { label: "Delivery", value: categoryAverages.delivery },
          ].map((metric) => (
            <Card key={metric.label} className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">
                {metric.value.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
            </Card>
          ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No reviews yet. Be the first to review this OEM!
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      {review.buyerName || "Anonymous Buyer"}
                    </div>
                    {review.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatRelativeDate(review.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{review.rating}</span>
                </div>
              </div>

              {review.title && (
                <h3 className="font-semibold mb-2">{review.title}</h3>
              )}

              {review.reviewText && (
                <p className="text-muted-foreground mb-4">
                  {review.reviewText}
                </p>
              )}

              {/* Category Ratings */}
              {(review.qualityRating ||
                review.communicationRating ||
                review.deliveryRating ||
                review.serviceRating) && (
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                  {[
                    { label: "Quality", value: review.qualityRating },
                    {
                      label: "Communication",
                      value: review.communicationRating,
                    },
                    { label: "Delivery", value: review.deliveryRating },
                    { label: "Service", value: review.serviceRating },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="text-center">
                        <div className="text-sm font-semibold">{value}/5</div>
                        <div className="text-xs text-muted-foreground">
                          {label}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => markHelpfulMutation.mutate(review.id)}
                  disabled={markHelpfulMutation.isPending}
                >
                  {markHelpfulMutation.isPending
                    ? "..."
                    : `Helpful (${review.helpfulCount})`}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
