import { NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

// GET - Fetch all matches (for admin testing)
export async function GET() {
  try {
    const context = await createSupabaseRouteContext();
    const { supabase } = context;

    // Fetch all matches with OEM and buyer organization details
    const { data: matches, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        status,
        score,
        buyer_org_id,
        oem_org_id,
        created_at,
        updated_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to fetch matches", {
        status: 500,
        cause: error,
      });
    }

    // Fetch latest request for each buyer org
    const buyerOrgIds = Array.from(
      new Set(matches?.map((m) => m.buyer_org_id).filter(Boolean) ?? [])
    );

    const requestsMap = new Map<
      string,
      {
        id: string;
        buyer_org_id: string;
        title: string | null;
        type: string;
        product_brief: string | null;
        quantity_min: number | null;
        quantity_max: number | null;
        unit: string | null;
        timeline: string | null;
        shipping_terms: string | null;
        payment_terms: string | null;
        add_escrow: boolean | null;
        add_audit: boolean | null;
        created_at: string;
        files?: Array<{
          id: string;
          path: string;
          mimeType: string | null;
          sizeBytes: number | null;
        }>;
      }
    >();
    if (buyerOrgIds.length > 0) {
      const { data: requests } = await supabase
        .from("requests")
        .select(
          `
          id,
          buyer_org_id,
          title,
          type,
          product_brief,
          quantity_min,
          quantity_max,
          unit,
          timeline,
          shipping_terms,
          payment_terms,
          add_escrow,
          add_audit,
          created_at
        `
        )
        .in("buyer_org_id", buyerOrgIds)
        .order("created_at", { ascending: false });

      // Get the latest request for each buyer_org
      requests?.forEach((req) => {
        if (!requestsMap.has(req.buyer_org_id)) {
          requestsMap.set(req.buyer_org_id, req);
        }
      });

      // Fetch files for these requests
      const requestIds = Array.from(requestsMap.values()).map((r) => r.id);
      if (requestIds.length > 0) {
        const { data: requestFiles } = await supabase
          .from("request_files")
          .select("id, request_id, path, mime_type, size_bytes")
          .in("request_id", requestIds);

        const filesMap = new Map<string, typeof requestFiles>();
        requestFiles?.forEach((file) => {
          const existing = filesMap.get(file.request_id) ?? [];
          filesMap.set(file.request_id, [...existing, file]);
        });

        // Add files to requests
        requestsMap.forEach((request) => {
          const files = filesMap.get(request.id) ?? [];
          request.files = files.map((f) => ({
            id: f.id,
            path: f.path,
            mimeType: f.mime_type,
            sizeBytes: f.size_bytes,
          }));
        });
      }
    }

    const matchesWithRequests = matches?.map((match) => ({
      ...match,
      request: requestsMap.get(match.buyer_org_id) || null,
    }));

    return NextResponse.json(
      { matches: matchesWithRequests ?? [] },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Unexpected error in GET /api/admin-test-matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Approve a match (change status to 'contacted')
export async function POST(request: Request) {
  try {
    const context = await createSupabaseRouteContext();
    const { supabase, userId } = context;
    const body = await request.json();
    const { matchId, requestId: requestIdFromBody } = body as {
      matchId?: string;
      requestId?: string;
    };

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

    // Load match so we can link back to the originating request (if any)
    const { data: matchRecord, error: matchFetchError } = await supabase
      .from("matches")
      .select("id, digest")
      .eq("id", matchId)
      .single();

    if (matchFetchError || !matchRecord) {
      throw new AppError("Failed to locate match", {
        status: 404,
        cause: matchFetchError ?? undefined,
      });
    }

    const digest = (matchRecord.digest ?? {}) as Record<string, unknown>;
    const requestId =
      requestIdFromBody && typeof requestIdFromBody === "string"
        ? requestIdFromBody
        : typeof digest.requestId === "string"
          ? digest.requestId
          : typeof digest.request_id === "string"
            ? digest.request_id
            : null;

    // Update match status to 'contacted'
    const { data, error } = await supabase
      .from("matches")
      .update({
        status: "contacted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to approve match", {
        status: 500,
        cause: error,
      });
    }

    if (requestId) {
      const { error: requestUpdateError } = await supabase
        .from("requests")
        .update({
          status: "quote_received",
          updated_at: new Date().toISOString(),
          updated_by: userId ?? null,
        })
        .eq("id", requestId)
        .in("status", ["submitted", "pending_oem"]);

      if (requestUpdateError) {
        console.warn("Warning: failed to update request status", {
          matchId,
          requestId,
          error: requestUpdateError,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        match: data,
        message: "Match approved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Unexpected error in POST /api/admin-test-matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Decline a match (change status to 'Declined')
export async function PATCH(request: Request) {
  try {
    const context = await createSupabaseRouteContext();
    const { supabase } = context;
    const body = await request.json();
    const { matchId, action } = body;

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

    if (action !== "decline") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update match status to 'declined'
    const { data, error } = await supabase
      .from("matches")
      .update({
        status: "declined",
      })
      .eq("id", matchId)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to decline match", {
        status: 500,
        cause: error,
      });
    }

    return NextResponse.json(
      {
        success: true,
        match: data,
        message: "Match declined successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Unexpected error in PATCH /api/admin-test-matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
