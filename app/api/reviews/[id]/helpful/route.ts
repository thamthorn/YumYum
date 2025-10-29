import { withErrorHandling } from "@/lib/http/error-handler";
import { jsonResponse } from "@/lib/http/responses";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { markReviewHelpful } from "@/domain/reviews/service";

type Params = {
  params: Promise<{ id: string }>;
};

// POST /api/reviews/[id]/helpful - Mark review as helpful (toggle)
export const POST = withErrorHandling(
  async (request: Request, props: Params) => {
    const params = await props.params;
    const context = await createSupabaseRouteContext();

    await markReviewHelpful(params.id, context);

    return jsonResponse({ success: true });
  }
);
