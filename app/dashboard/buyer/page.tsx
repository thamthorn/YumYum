"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  MessageSquare,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Zap,
  Target,
  Building2,
  FileText,
  Trash2,
} from "lucide-react";
import {
  ROUTES,
  COPY,
  getMatchStatusVariant,
  getScaleBadgeVariant,
} from "@/data/MockData";
import { useSupabase } from "@/lib/supabase/session-context";
import { toast } from "sonner";

type RequestResponse = {
  id: string;
  status: string;
  type: string;
  title: string | null;
  productBrief: string | null;
  quantityMin: number | null;
  quantityMax: number | null;
  unit: string | null;
  timeline: string | null;
  shippingTerms: string | null;
  paymentTerms: string | null;
  addEscrow: boolean | null;
  addAudit: boolean | null;
  submittedAt: string | null;
  createdAt: string | null;
  oem: {
    id: string;
    name: string;
    slug: string | null;
    industry: string | null;
    location: string | null;
    scale: "small" | "medium" | "large" | null;
    rating: number | null;
    totalReviews: number | null;
  } | null;
};

type MatchResponse = {
  id: string;
  status: string;
  score: number | null;
  digest: Record<string, unknown> | null; // JSON from database
  createdAt: string | null;
  updatedAt: string | null;
  oem: {
    organizationId: string;
    name: string;
    slug: string | null;
    industry: string | null;
    location: string | null;
    scale: "small" | "medium" | "large" | null;
    rating: number | null;
    totalReviews: number | null;
    certifications: Array<{ name: string; issuedBy: string }>;
  } | null;
};

function DashboardContent() {
  const { session } = useSupabase();
  const queryClient = useQueryClient();

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    error: requestError,
  } = useQuery<RequestResponse[]>({
    queryKey: ["buyer-requests"],
    queryFn: async () => {
      const response = await fetch("/api/requests");
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Unable to load requests");
      }
      const body = (await response.json()) as { data: RequestResponse[] };
      return body.data ?? [];
    },
    enabled: Boolean(session),
  });

  const {
    data: matches = [],
    isLoading: isLoadingMatches,
    error: matchesError,
  } = useQuery<MatchResponse[]>({
    queryKey: ["buyer-matches"],
    queryFn: async () => {
      const response = await fetch("/api/matches");
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Unable to load matches");
      }
      const body = (await response.json()) as { data: MatchResponse[] };
      return body.data ?? [];
    },
    enabled: Boolean(session),
  });

  // Clear matches mutation
  const clearMatchesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/matches", {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to clear matches");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-matches"] });
      toast.success("All matches cleared successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleClearMatches = () => {
    if (matches.length === 0) {
      toast.info("No matches to clear");
      return;
    }

    if (
      confirm(
        `Are you sure you want to clear all ${matches.length} matches? This action cannot be undone.`
      )
    ) {
      clearMatchesMutation.mutate();
    }
  };

  if (requestError) {
    toast.error(requestError.message);
  }
  if (matchesError) {
    toast.error(matchesError.message);
  }

  const stats = [
    {
      label: "Active Requests",
      value: requests.length.toString(),
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Messages",
      value: "-",
      icon: MessageSquare,
      color: "text-info",
    },
    {
      label: "Saved OEMs",
      value: "-",
      icon: Heart,
      color: "text-destructive",
    },
    {
      label: "Matches",
      value: matches.length.toString(),
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8 animate-fade-in">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {COPY.pages.dashboard.welcome}
                </h1>
                <p className="text-muted-foreground">
                  {COPY.pages.dashboard.subtitle}
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href={ROUTES.onboarding}>
                  {COPY.pages.dashboard.newRequest}
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <Card
                  key={stat.label}
                  className="p-6 animate-scale-in"
                  style={{
                    animationDelay: `${index * 50}ms` as unknown as string,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="requests" className="cursor-pointer">
                  Requests
                </TabsTrigger>
                <TabsTrigger value="matches" className="cursor-pointer">
                  Matches
                </TabsTrigger>
                <TabsTrigger value="saved" className="cursor-pointer">
                  Saved
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="space-y-4">
                {isLoadingRequests ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Loading requests...
                  </Card>
                ) : requests.length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    You have not submitted any requests yet.
                  </Card>
                ) : (
                  requests.map((request) => (
                    <Card
                      key={request.id}
                      className="p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {request.productBrief ??
                                request.title ??
                                "Request"}
                            </h3>
                            <Badge
                              variant={
                                request.status === "quote_received"
                                  ? "verified"
                                  : request.status === "in_production"
                                    ? "certified"
                                    : "outline"
                              }
                            >
                              {request.status.replace(/_/g, " ")}
                            </Badge>
                            <Badge variant="scale">
                              {request.type === "prototype"
                                ? "Prototype"
                                : "Quote"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>
                              OEM:{" "}
                              {request.oem ? (
                                <Link
                                  href={ROUTES.oemProfile(
                                    request.oem.slug ?? request.oem.id
                                  )}
                                  className="underline"
                                >
                                  {request.oem.name}
                                </Link>
                              ) : (
                                "Unknown"
                              )}
                            </span>
                            {request.quantityMin && (
                              <>
                                <span>•</span>
                                <span>
                                  Qty: {request.quantityMin.toLocaleString()}{" "}
                                  {request.unit ?? "units"}
                                </span>
                              </>
                            )}
                            {request.createdAt && (
                              <>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setActiveRequestId(
                                  activeRequestId === request.id
                                    ? null
                                    : request.id
                                )
                              }
                            >
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={ROUTES.messageThread(request.id)}>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          {request.status === "pending_oem" ? (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          ) : request.status === "quote_received" ? (
                            <AlertCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </div>
                        {activeRequestId === request.id && (
                          <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground space-y-3">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">
                                Product Brief
                              </h4>
                              <p>{request.productBrief ?? "N/A"}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <span className="font-semibold text-foreground">
                                  Quantity
                                </span>
                                <p>
                                  {request.quantityMin?.toLocaleString() ?? "-"}{" "}
                                  {request.unit ?? "units"}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Timeline
                                </span>
                                <p>{request.timeline ?? "Not specified"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Shipping Terms
                                </span>
                                <p>
                                  {request.shippingTerms ?? "Not specified"}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Payment Terms
                                </span>
                                <p>{request.paymentTerms ?? "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>
                                <Badge variant="outline">
                                  Escrow {request.addEscrow ? "Yes" : "No"}
                                </Badge>
                              </span>
                              <span>
                                <Badge variant="outline">
                                  Audit {request.addAudit ? "Yes" : "No"}
                                </Badge>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="matches" className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-muted-foreground">
                      Based on your requirements and preferences, we&apos;ve
                      found {matches.length} potential OEM partners.
                    </p>
                    {matches.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearMatches}
                        disabled={clearMatchesMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {clearMatchesMutation.isPending
                          ? "Clearing..."
                          : "Clear All Matches"}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {
                        matches.filter(
                          (m) =>
                            m.status === "new_match" || m.status === "New Match"
                        ).length
                      }{" "}
                      new
                    </Badge>
                    <Badge variant="outline">
                      {
                        matches.filter(
                          (m) =>
                            m.status === "in_discussion" ||
                            m.status === "In Discussion"
                        ).length
                      }{" "}
                      in discussion
                    </Badge>
                  </div>
                </div>

                {isLoadingMatches ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Loading matches...
                  </Card>
                ) : matches.length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    No matches yet. Complete onboarding to generate your
                    matches.
                  </Card>
                ) : (
                  matches
                    .filter((match) => match.oem !== null)
                    .map((match) => {
                      const oem = match.oem!;
                      const scale =
                        oem.scale === "large"
                          ? "Large"
                          : oem.scale === "small"
                            ? "Small"
                            : "Medium";

                      // Parse match reasons from digest field
                      const matchReasons: string[] = [];
                      if (match.digest) {
                        try {
                          // digest is already a JSON object from Supabase
                          const digestData = match.digest as Record<
                            string,
                            unknown
                          >;
                          if (
                            digestData.reasons &&
                            Array.isArray(digestData.reasons)
                          ) {
                            matchReasons.push(...digestData.reasons);
                          } else if (typeof digestData === "string") {
                            matchReasons.push(digestData);
                          }
                        } catch (e) {
                          console.warn("Failed to parse digest:", e);
                        }
                      }

                      // Default reasons if none provided
                      if (matchReasons.length === 0) {
                        if (oem.industry) {
                          matchReasons.push(
                            `Industry expertise in ${oem.industry}`
                          );
                        }
                        if (
                          oem.certifications &&
                          oem.certifications.length > 0
                        ) {
                          matchReasons.push(
                            `Certified: ${oem.certifications.map((c) => c.name).join(", ")}`
                          );
                        }
                        if (oem.scale) {
                          matchReasons.push(
                            `${scale}-scale manufacturer with proven capacity`
                          );
                        }
                      }

                      return (
                        <Card
                          key={match.id}
                          className="p-6 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {oem.name}
                                </h3>
                                <Badge
                                  variant={getMatchStatusVariant(match.status)}
                                >
                                  {match.status.replace(/_/g, " ")}
                                </Badge>
                                <Badge variant={getScaleBadgeVariant(scale)}>
                                  {scale}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1 font-medium text-primary">
                                  <Target className="h-4 w-4" />
                                  {match.score ?? 100}% Match
                                </span>
                                {oem.location && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {oem.location}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Why this match section */}
                          {matchReasons.length > 0 && (
                            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                Why this match
                              </h4>
                              <ul className="space-y-1.5">
                                {matchReasons.slice(0, 3).map((reason, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Last Activity */}
                          {match.updatedAt &&
                            match.updatedAt !== match.createdAt && (
                              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    Last activity:{" "}
                                    {new Date(
                                      match.updatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}

                          {/* Action Buttons - Dynamic based on status */}
                          <div className="flex gap-2">
                            {(match.status === "new_match" ||
                              match.status === "New Match") && (
                              <>
                                <Button size="sm" asChild>
                                  <Link
                                    href={ROUTES.oemProfile(
                                      oem.slug ?? oem.organizationId
                                    )}
                                  >
                                    <Building2 className="h-4 w-4 mr-1" />
                                    View Profile
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={ROUTES.messageThread(match.id)}>
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Contact OEM
                                  </Link>
                                </Button>
                              </>
                            )}

                            {match.status === "contacted" && (
                              <>
                                <Button size="sm" asChild>
                                  <Link href={ROUTES.messageThread(match.id)}>
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Continue Chat
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link
                                    href={ROUTES.requestQuote(
                                      oem.organizationId
                                    )}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Request Quote
                                  </Link>
                                </Button>
                              </>
                            )}

                            {(match.status === "in_discussion" ||
                              match.status === "In Discussion") && (
                              <>
                                <Button size="sm" asChild>
                                  <Link
                                    href={ROUTES.requestQuote(
                                      oem.organizationId
                                    )}
                                  >
                                    <Zap className="h-4 w-4 mr-1" />
                                    Request Quote
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={ROUTES.messageThread(match.id)}>
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    View Messages
                                  </Link>
                                </Button>
                              </>
                            )}

                            {/* Default fallback for other statuses */}
                            {![
                              "new_match",
                              "New Match",
                              "contacted",
                              "in_discussion",
                              "In Discussion",
                            ].includes(match.status) && (
                              <>
                                <Button size="sm" asChild>
                                  <Link
                                    href={ROUTES.oemProfile(
                                      oem.slug ?? oem.organizationId
                                    )}
                                  >
                                    View Profile
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link
                                    href={ROUTES.requestQuote(
                                      oem.organizationId
                                    )}
                                  >
                                    <Zap className="h-4 w-4 mr-1" />
                                    Request Quote
                                  </Link>
                                </Button>
                              </>
                            )}
                          </div>
                        </Card>
                      );
                    })
                )}
              </TabsContent>

              <TabsContent value="saved">
                <Card className="p-12 text-center text-muted-foreground">
                  Saved OEMs will appear here once you start bookmarking them.
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedClient>
  );
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardContent />
    </Suspense>
  );
}
