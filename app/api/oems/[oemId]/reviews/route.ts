import { withErrorHandling } from "@/lib/http/error-handler";
import { jsonResponse } from "@/lib/http/responses";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { getOemReviews } from "@/domain/reviews/service";

type Params = {
  params: Promise<{ oemId: string }>;
};

// GET /api/oems/[oemId]/reviews - Get all reviews for an OEM
export const GET = withErrorHandling(
  async (request: Request, props: Params) => {
    const params = await props.params;
    const context = await createSupabaseRouteContext();

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const result = await getOemReviews(params.oemId, context, limit, offset);

    return jsonResponse({
      data: result.reviews,
      meta: {
        total: result.total,
        limit,
        offset,
      },
    });
  }
);
