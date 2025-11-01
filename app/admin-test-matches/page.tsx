"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileIcon,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useSupabase } from "@/lib/supabase/session-context";

type Match = {
  id: string;
  status: string;
  score: number | null;
  buyer_org_id: string;
  oem_org_id: string;
  created_at: string;
  oem_name?: string;
  buyer_name?: string;
  request?: {
    id: string;
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
    files?: Array<{
      id: string;
      path: string;
      mimeType: string | null;
      sizeBytes: number | null;
    }>;
  } | null;
};

export default function AdminTestMatchesPage() {
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Fetch all matches
  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["admin-all-matches"],
    queryFn: async () => {
      const response = await fetch("/api/admin-test-matches");
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      const body = await response.json();
      return body.matches ?? [];
    },
  });

  // Approve match mutation
  const approveMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch("/api/admin-test-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      if (!response.ok) {
        throw new Error("Failed to approve match");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate admin matches list
      queryClient.invalidateQueries({ queryKey: ["admin-all-matches"] });
      // Invalidate buyer dashboard matches so they update automatically
      queryClient.invalidateQueries({ queryKey: ["buyer-matches"] });
      toast.success("Match approved! Status changed to 'contacted'");
      setApprovingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setApprovingId(null);
    },
  });

  const handleApprove = (matchId: string) => {
    setApprovingId(matchId);
    approveMutation.mutate(matchId);
  };

  // Decline match mutation
  const declineMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch("/api/admin-test-matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, action: "decline" }),
      });
      if (!response.ok) {
        throw new Error("Failed to decline match");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-matches"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-matches"] });
      toast.success("Match declined! Status changed to 'Declined'");
      setDecliningId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setDecliningId(null);
    },
  });

  const handleDecline = (matchId: string) => {
    setDecliningId(matchId);
    declineMutation.mutate(matchId);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔧 Admin Test Panel</h1>
          <p className="text-muted-foreground">
            Hidden route to approve matches for testing. Access:{" "}
            <code className="bg-muted px-2 py-1 rounded">
              /admin-test-matches
            </code>
          </p>
        </div>

        <Card className="p-6 mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200">
          <h3 className="font-semibold mb-2">⚠️ How to Use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Complete onboarding or quick match to generate matches (status:
              new_match)
            </li>
            <li>
              Click &quot;Approve Match&quot; to change status to
              &quot;contacted&quot; OR click &quot;Decline Match&quot; to change
              status to &quot;Declined&quot;
            </li>
            <li>
              Go to /dashboard/buyer → Matches tab to see the approved/declined
              matches
            </li>
            <li>
              The &quot;View Order&quot; button will appear if you set up mock
              order data
            </li>
          </ol>
        </Card>

        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading matches...</p>
          </Card>
        ) : matches.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No matches found. Complete onboarding first to generate matches.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Match ID: {match.id.slice(0, 8)}...
                      </h3>
                      <Badge
                        variant={
                          match.status === "new_match"
                            ? "secondary"
                            : match.status === "contacted"
                              ? "default"
                              : "outline"
                        }
                      >
                        {match.status}
                      </Badge>
                      {match.score && (
                        <Badge variant="outline">{match.score}% match</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">
                          OEM Org ID:
                        </span>
                        <p className="font-mono text-xs mt-1">
                          {match.oem_org_id}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Buyer Org ID:
                        </span>
                        <p className="font-mono text-xs mt-1">
                          {match.buyer_org_id}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="text-xs mt-1">
                          {new Date(match.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Request Details Button */}
                    {match.request && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedMatchId(
                            expandedMatchId === match.id ? null : match.id
                          )
                        }
                        className="mb-2"
                      >
                        {expandedMatchId === match.id ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Request Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            View Request Details
                          </>
                        )}
                      </Button>
                    )}

                    {/* Expanded Request Details */}
                    {expandedMatchId === match.id && match.request && (
                      <div className="mt-4 border-t border-border pt-4 text-sm space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            Request: {match.request.title || "Untitled"}
                          </h4>
                          <Badge variant="outline" className="mb-2">
                            {match.request.type}
                          </Badge>
                        </div>

                        <div>
                          <span className="font-semibold text-foreground">
                            Product Brief
                          </span>
                          <p className="text-muted-foreground mt-1">
                            {match.request.product_brief || "N/A"}
                          </p>
                        </div>

                        {/* Uploaded Files */}
                        {match.request.files &&
                          match.request.files.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">
                                Uploaded Files
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {match.request.files.map((file) => {
                                  const isImage =
                                    file.mimeType?.startsWith("image/") ??
                                    false;
                                  const imageUrl = supabase.storage
                                    .from("request-files")
                                    .getPublicUrl(file.path).data.publicUrl;

                                  return (
                                    <div
                                      key={file.id}
                                      className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted"
                                    >
                                      {isImage ? (
                                        <Image
                                          src={imageUrl}
                                          alt="Uploaded file"
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                          <FileIcon className="h-8 w-8 mb-2" />
                                          <span className="text-xs text-center px-2">
                                            {file.path
                                              .split("/")
                                              .pop()
                                              ?.slice(0, 20)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <span className="font-semibold text-foreground">
                              Quantity
                            </span>
                            <p className="text-muted-foreground">
                              {match.request.quantity_min?.toLocaleString() ??
                                "-"}{" "}
                              {match.request.unit ?? "units"}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              Timeline
                            </span>
                            <p className="text-muted-foreground">
                              {match.request.timeline ?? "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              Shipping Terms
                            </span>
                            <p className="text-muted-foreground">
                              {match.request.shipping_terms ?? "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              Payment Terms
                            </span>
                            <p className="text-muted-foreground">
                              {match.request.payment_terms ?? "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            Escrow {match.request.add_escrow ? "Yes" : "No"}
                          </Badge>
                          <Badge variant="outline">
                            Audit {match.request.add_audit ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  {match.status === "new_match" && (
                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        onClick={() => handleApprove(match.id)}
                        disabled={
                          approvingId === match.id || decliningId === match.id
                        }
                        size="sm"
                      >
                        {approvingId === match.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve Match
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDecline(match.id)}
                        disabled={
                          approvingId === match.id || decliningId === match.id
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {decliningId === match.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Declining...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline Match
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
