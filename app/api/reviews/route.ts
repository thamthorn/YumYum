import { withErrorHandling } from "@/lib/http/error-handler";
import { jsonResponse } from "@/lib/http/responses";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { createReview, getBuyerReviews } from "@/domain/reviews/service";

// POST /api/reviews - Create a new review
export const POST = withErrorHandling(async (request: Request) => {
  const context = await createSupabaseRouteContext();
  const payload = await request.json();

  const review = await createReview(payload, context);

  return jsonResponse({ data: review }, 201);
});

// GET /api/reviews - Get buyer's own reviews
export const GET = withErrorHandling(async () => {
  const context = await createSupabaseRouteContext();

  const reviews = await getBuyerReviews(context);

  return jsonResponse({ data: reviews });
});
