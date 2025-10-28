import { withErrorHandling } from "@/lib/http/error-handler";
import { jsonResponse } from "@/lib/http/responses";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { processBuyerOnboarding } from "@/domain/buyers/service";

export const POST = withErrorHandling(async (request: Request) => {
  const context = await createSupabaseRouteContext();
  const payload = await request.json();
  const result = await processBuyerOnboarding(payload, context);
  return jsonResponse({ data: result }, 201);
});
