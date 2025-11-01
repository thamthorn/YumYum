import { SupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";
import type { Database } from "@/types/database";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

export type CreateReviewInput = {
  oemOrgId: string;
  orderId?: string;
  rating: number;
  qualityRating?: number;
  communicationRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
  title?: string;
  reviewText?: string;
};

export type UpdateReviewInput = {
  reviewId: string;
  rating?: number;
  qualityRating?: number;
  communicationRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
  title?: string;
  reviewText?: string;
};

export type ReviewResponse = {
  id: string;
  buyerOrgId: string;
  buyerName: string | null;
  oemOrgId: string;
  orderId: string | null;
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
  updatedAt: string;
};

/**
 * Create a new review
 */
export async function createReview(
  input: CreateReviewInput,
  context: SupabaseRouteContext
): Promise<ReviewResponse> {
  const { supabase, userId } = context;

  // Get buyer's organization ID
  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(type, display_name)")
    .eq("profile_id", userId)
    .single();

  if (membershipError || !membership) {
    throw new AppError("Buyer organization not found", {
      cause: membershipError,
      code: "buyer_org_not_found",
    });
  }

  // @ts-ignore
  if (membership.organizations?.type !== "buyer") {
    throw new AppError("Only buyers can create reviews", {
      code: "not_a_buyer",
    });
  }

  const buyerOrgId = membership.organization_id;

  // Validate ratings are within 1-5
  if (input.rating < 1 || input.rating > 5) {
    throw new AppError("Rating must be between 1 and 5", {
      code: "invalid_rating",
    });
  }

  // Check if buyer has already reviewed this OEM
  let duplicateQuery = supabase
    .from("reviews")
    .select("id")
    .eq("buyer_org_id", buyerOrgId)
    .eq("oem_org_id", input.oemOrgId);

  if (input.orderId) {
    duplicateQuery = duplicateQuery.eq("order_id", input.orderId);
  } else {
    duplicateQuery = duplicateQuery.is("order_id", null);
  }

  const { data: existingReview } = await duplicateQuery.maybeSingle();

  if (existingReview) {
    throw new AppError("You have already reviewed this OEM for this order", {
      code: "duplicate_review",
    });
  }

  // Create the review
  const reviewInsert: ReviewInsert = {
    buyer_org_id: buyerOrgId,
    reviewer_profile_id: userId,
    oem_org_id: input.oemOrgId,
    order_id: input.orderId || null,
    rating: input.rating,
    quality_rating: input.qualityRating || null,
    communication_rating: input.communicationRating || null,
    delivery_rating: input.deliveryRating || null,
    service_rating: input.serviceRating || null,
    title: input.title || null,
    review_text: input.reviewText || null,
  };

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert(reviewInsert)
    .select()
    .single();

  if (reviewError || !review) {
    console.error("review_create_failed", reviewError);
    throw new AppError("Failed to create review", {
      cause: reviewError,
      code: "review_create_failed",
    });
  }

  return mapReviewToResponse(
    review as ReviewRow,
    membership.organizations?.display_name
  );
}

/**
 * Get reviews for an OEM
 */
export async function getOemReviews(
  oemOrgId: string,
  context: SupabaseRouteContext,
  limit: number = 20,
  offset: number = 0
): Promise<{ reviews: ReviewResponse[]; total: number }> {
  const { supabase } = context;

  // Get total count
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("oem_org_id", oemOrgId)
    .eq("is_visible", true);

  // Get reviews with buyer organization info
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      organizations!reviews_buyer_org_id_fkey(display_name)
    `
    )
    .eq("oem_org_id", oemOrgId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("reviews_fetch_failed", error);
    throw new AppError("Failed to fetch reviews", {
      cause: error,
      code: "reviews_fetch_failed",
    });
  }

  return {
    reviews: (reviews || []).map((r: any) =>
      mapReviewToResponse(r, r.organizations?.display_name)
    ),
    total: count || 0,
  };
}

/**
 * Update a review
 */
export async function updateReview(
  input: UpdateReviewInput,
  context: SupabaseRouteContext
): Promise<ReviewResponse> {
  const { supabase, userId } = context;

  // Verify ownership
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("*, organizations!reviews_buyer_org_id_fkey(display_name)")
    .eq("id", input.reviewId)
    .eq("reviewer_profile_id", userId)
    .single();

  if (!existingReview) {
    throw new AppError(
      "Review not found or you don't have permission to edit it",
      {
        code: "review_not_found",
      }
    );
  }

  const reviewUpdate: ReviewUpdate = {};
  if (input.rating !== undefined) reviewUpdate.rating = input.rating;
  if (input.qualityRating !== undefined)
    reviewUpdate.quality_rating = input.qualityRating;
  if (input.communicationRating !== undefined)
    reviewUpdate.communication_rating = input.communicationRating;
  if (input.deliveryRating !== undefined)
    reviewUpdate.delivery_rating = input.deliveryRating;
  if (input.serviceRating !== undefined)
    reviewUpdate.service_rating = input.serviceRating;
  if (input.title !== undefined) reviewUpdate.title = input.title;
  if (input.reviewText !== undefined)
    reviewUpdate.review_text = input.reviewText;

  const { data: review, error } = await supabase
    .from("reviews")
    .update(reviewUpdate)
    .eq("id", input.reviewId)
    .select()
    .single();

  if (error || !review) {
    console.error("review_update_failed", error);
    throw new AppError("Failed to update review", {
      cause: error,
      code: "review_update_failed",
    });
  }

  return mapReviewToResponse(
    review as ReviewRow,
    (existingReview as any).organizations?.display_name
  );
}

/**
 * Delete a review
 */
export async function deleteReview(
  reviewId: string,
  context: SupabaseRouteContext
): Promise<void> {
  const { supabase, userId } = context;

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("reviewer_profile_id", userId);

  if (error) {
    console.error("review_delete_failed", error);
    throw new AppError("Failed to delete review", {
      cause: error,
      code: "review_delete_failed",
    });
  }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(
  reviewId: string,
  context: SupabaseRouteContext
): Promise<void> {
  const { supabase, userId } = context;

  // Add helpful vote
  const { error: voteError } = await supabase
    .from("review_helpful_votes")
    .insert({
      review_id: reviewId,
      profile_id: userId,
    });

  if (voteError) {
    // Already voted, try to remove vote
    const { error: removeError } = await supabase
      .from("review_helpful_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("profile_id", userId);

    if (removeError) {
      console.error("helpful_vote_failed", removeError);
      throw new AppError("Failed to vote", {
        cause: removeError,
        code: "helpful_vote_failed",
      });
    }
  }

  // Update helpful count
  const { count } = await supabase
    .from("review_helpful_votes")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId);

  await supabase
    .from("reviews")
    .update({ helpful_count: count || 0 })
    .eq("id", reviewId);
}

/**
 * Get buyer's reviews
 */
export async function getBuyerReviews(
  context: SupabaseRouteContext
): Promise<ReviewResponse[]> {
  const { supabase, userId } = context;

  // Get buyer's organization ID
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("profile_id", userId)
    .single();

  if (!membership) {
    return [];
  }

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      organizations!reviews_buyer_org_id_fkey(display_name)
    `
    )
    .eq("buyer_org_id", membership.organization_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("buyer_reviews_fetch_failed", error);
    throw new AppError("Failed to fetch your reviews", {
      cause: error,
      code: "buyer_reviews_fetch_failed",
    });
  }

  return (reviews || []).map((r: any) =>
    mapReviewToResponse(r, r.organizations?.display_name)
  );
}

function mapReviewToResponse(
  review: ReviewRow,
  buyerName?: string | null
): ReviewResponse {
  return {
    id: review.id,
    buyerOrgId: review.buyer_org_id,
    buyerName: buyerName || null,
    oemOrgId: review.oem_org_id,
    orderId: review.order_id,
    rating: review.rating,
    qualityRating: review.quality_rating,
    communicationRating: review.communication_rating,
    deliveryRating: review.delivery_rating,
    serviceRating: review.service_rating,
    title: review.title,
    reviewText: review.review_text,
    isVerified: review.is_verified || false,
    helpfulCount: review.helpful_count || 0,
    createdAt: review.created_at || "",
    updatedAt: review.updated_at || "",
  };
}
