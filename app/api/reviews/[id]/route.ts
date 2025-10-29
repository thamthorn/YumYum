import { withErrorHandling } from "@/lib/http/error-handler";
import { jsonResponse } from "@/lib/http/responses";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { updateReview, deleteReview } from "@/domain/reviews/service";

type Params = {
  params: Promise<{ id: string }>;
};

// PATCH /api/reviews/[id] - Update a review
export const PATCH = withErrorHandling(
  async (request: Request, props: Params) => {
    const params = await props.params;
    const context = await createSupabaseRouteContext();
    const payload = await request.json();

    const review = await updateReview(
      { reviewId: params.id, ...payload },
      context
    );

    return jsonResponse({ data: review });
  }
);

// DELETE /api/reviews/[id] - Delete a review
export const DELETE = withErrorHandling(
  async (request: Request, props: Params) => {
    const params = await props.params;
    const context = await createSupabaseRouteContext();

    await deleteReview(params.id, context);

    return jsonResponse({ success: true });
  }
);
