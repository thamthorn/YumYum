import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set - AI search will not work");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const context = await createSupabaseRouteContext();
    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length < 5) {
      return NextResponse.json(
        {
          error:
            "Please provide a more detailed search query (at least 5 characters)",
        },
        { status: 400 }
      );
    }

    // Fetch all OEMs with their information
    const { data: oemsData, error: oemsError } = await context.supabase
      .from("oem_profiles")
      .select(
        `
        organization_id,
        scale,
        moq_min,
        moq_max,
        cross_border,
        prototype_support,
        rating,
        total_reviews,
        response_time_hours,
        lead_time_days,
        organizations!oem_profiles_organization_id_fkey (
          id,
          display_name,
          slug,
          industry,
          location,
          established_year
        ),
        oem_services (
          services (
            name
          )
        ),
        oem_certifications (
          certifications (
            name
          ),
          verification_tier
        )
      `
      )
      .limit(100); // Limit to prevent token overload

    // Fetch products for all OEMs
    const oemIds = (oemsData || [])
      .map((oem: Record<string, unknown>) => oem["organization_id"])
      .filter((id): id is string => typeof id === "string");
    const { data: productsData } = await context.supabase
      .from("products")
      .select("oem_org_id, name, category, sku, moq")
      .in("oem_org_id", oemIds);

    if (oemsError) {
      console.error("Error fetching OEMs:", oemsError);
      throw new AppError("Failed to fetch OEM data", { status: 500 });
    }

    // Transform OEM data for AI consumption
    const oemsForAI = (oemsData || []).map((oem: Record<string, unknown>) => {
      const org = oem["organizations"] as Record<string, unknown> | undefined;
      const servicesArr = oem["oem_services"] as
        | Array<Record<string, unknown>>
        | undefined;
      const certsArr = oem["oem_certifications"] as
        | Array<Record<string, unknown>>
        | undefined;

      // Get products for this OEM
      const oemProducts =
        (productsData || []).filter(
          (p: Record<string, unknown>) =>
            p["oem_org_id"] === oem["organization_id"]
        ) || [];

      return {
        id: String(oem["organization_id"] ?? ""),
        name: String(org?.["display_name"] ?? "Unknown"),
        slug: (org?.["slug"] as string) ?? undefined,
        industry: (org?.["industry"] as string) ?? undefined,
        location: (org?.["location"] as string) ?? undefined,
        establishedYear: org?.["established_year"],
        scale: (oem["scale"] as string) ?? undefined,
        moqMin: (oem["moq_min"] as number) ?? undefined,
        moqMax: (oem["moq_max"] as number) ?? undefined,
        crossBorder: (oem["cross_border"] as boolean) ?? undefined,
        prototypeSupport: (oem["prototype_support"] as boolean) ?? undefined,
        rating: (oem["rating"] as number) ?? undefined,
        totalReviews: (oem["total_reviews"] as number) ?? undefined,
        responseTime: (oem["response_time_hours"] as number) ?? undefined,
        leadTimeDays: (oem["lead_time_days"] as number) ?? undefined,
        services:
          servicesArr
            ?.map(
              (s) =>
                ((s["services"] as Record<string, unknown>)?.[
                  "name"
                ] as string) ?? ""
            )
            .filter(Boolean) || [],
        certifications:
          certsArr?.map((c) => ({
            name: (c["certifications"] as Record<string, unknown>)?.["name"] as
              | string
              | undefined,
            tier: (c["verification_tier"] as string) ?? undefined,
          })) || [],
        products: oemProducts.map((p: Record<string, unknown>) => ({
          name: p["name"] as string,
          category: p["category"] as string,
          sku: p["sku"] as string,
          moq: p["moq"] as number,
        })),
      };
    });

    // Create AI prompt
    const prompt = `You are an expert OEM (Original Equipment Manufacturer) matchmaking assistant. 

User's requirement:
"${query}"

Available OEMs (${oemsForAI.length} total):
${JSON.stringify(oemsForAI, null, 2)}

Task: Analyze the user's requirement and recommend the TOP 5 most relevant OEMs from the list above.

Consider these factors in your ranking:
1. Industry match
2. Product catalog match (does the OEM make what the user needs?)
3. Location/cross-border capability match
4. MOQ (Minimum Order Quantity) match
5. Certifications match
6. Services offered
7. Prototype support (if mentioned)
8. Company scale
9. Rating and reviews
10. Response time

Return ONLY a valid JSON array with exactly 5 OEMs, ranked by relevance (most relevant first). Each object should have:
{
  "oemId": "the organization_id",
  "rank": 1-5,
  "relevanceScore": 0-100,
  "matchReasons": ["reason 1", "reason 2", "reason 3"]
}

IMPORTANT: 
- Return ONLY the JSON array, no additional text
- Include exactly 5 OEMs
- Use actual OEM IDs from the provided list
- Keep matchReasons concise (max 3 reasons per OEM)
- Ensure relevanceScore reflects how well the OEM matches the requirement`;

    // Log the prompt for debugging
    // console.log("=== AI SEARCH PROMPT ===");
    // console.log(prompt);
    // console.log("=== END PROMPT ===");

    // Call Gemini to rank OEMs using the official SDK
    let aiResponse: string;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });
      aiResponse = response.text ?? "";
      if (!aiResponse) {
        throw new Error("Empty response from Gemini");
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      throw new AppError("Failed to get AI recommendations", { status: 500 });
    }

    // Parse AI response
    let aiRecommendationsRaw: unknown;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      aiRecommendationsRaw = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      throw new AppError("AI returned invalid response format", {
        status: 500,
      });
    }

    // Validate and fetch full details for recommended OEMs
    if (!Array.isArray(aiRecommendationsRaw)) {
      throw new AppError("AI returned unexpected recommendations format", {
        status: 500,
      });
    }

    const aiRecommendations = aiRecommendationsRaw as Array<
      Record<string, unknown>
    >;
    const recommendedIds = aiRecommendations.map((r) =>
      String(r["oemId"] ?? "")
    );
    const { data: recommendedOems, error: recommendedError } =
      await context.supabase
        .from("oem_profiles")
        .select(
          `
        organization_id,
        scale,
        moq_min,
        moq_max,
        cross_border,
        prototype_support,
        rating,
        total_reviews,
        lead_time_days,
        organizations!oem_profiles_organization_id_fkey (
          id,
          display_name,
          slug,
          industry,
          location
        ),
        oem_certifications (
          certifications (
            name
          )
        ),
        oem_services (
          services (
            name
          )
        )
      `
        )
        .in("organization_id", recommendedIds);

    if (recommendedError) {
      console.error("Error fetching recommended OEMs:", recommendedError);
      throw new AppError("Failed to fetch recommended OEMs", { status: 500 });
    }

    // Merge AI rankings with full OEM data
    const mapped = aiRecommendations.map((aiRec) => {
      const oemId = String(aiRec["oemId"] ?? "");
      const oemData = recommendedOems?.find(
        (o: Record<string, unknown>) => o.organization_id === oemId
      );
      if (!oemData) return null;

      return {
        organizationId: oemData.organization_id,
        name: oemData.organizations?.display_name,
        slug: oemData.organizations?.slug,
        industry: oemData.organizations?.industry,
        location: oemData.organizations?.location,
        scale: oemData.scale,
        moqMin: oemData.moq_min,
        moqMax: oemData.moq_max,
        crossBorder: oemData.cross_border,
        prototypeSupport: oemData.prototype_support,
        rating: oemData.rating,
        totalReviews: oemData.total_reviews,
        leadTimeDays: oemData.lead_time_days,
        certifications:
          oemData.oem_certifications?.map((c) => ({
            name: (c.certifications as unknown as Record<string, unknown>)?.[
              "name"
            ],
          })) || [],
        services:
          oemData.oem_services?.map((s) => ({
            name: (s.services as unknown as Record<string, unknown>)?.[
              "name"
            ] as string,
          })) || [],
        aiRank: Number(aiRec["rank"] ?? 0),
        aiScore: Number(aiRec["relevanceScore"] ?? 0),
        matchReasons: (aiRec["matchReasons"] as string[] | undefined) ?? [],
      };
    });
    const recommendations = mapped
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .sort((a, b) => (a.aiRank ?? 0) - (b.aiRank ?? 0));

    return NextResponse.json({
      recommendations,
      query,
      totalResults: recommendations.length,
    });
  } catch (error) {
    console.error("AI Search error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process AI search" },
      { status: 500 }
    );
  }
}
