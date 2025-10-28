"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { ROUTES, COPY, getMatchStatusVariant, getMatchStatusColor, getScaleBadgeVariant } from "@/data/MockData";
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
  createdAt: string | null;
  oem: {
    organizationId: string;
    name: string;
    slug: string | null;
    industry: string | null;
    location: string | null;
    scale: "small" | "medium" | "large" | null;
    rating: number | null;
    totalReviews: number | null;
    certifications: string[];
  } | null;
};

function DashboardContent() {
  const { session } = useSupabase();

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
                              {request.productBrief ?? request.title ?? "Request"}
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
                              {request.type === "prototype" ? "Prototype" : "Quote"}
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
                                  {new Date(request.createdAt).toLocaleDateString()}
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
                                <p>{request.shippingTerms ?? "Not specified"}</p>
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
                  <p className="text-muted-foreground mb-4">
                    Based on your requirements and preferences, we&apos;ve found{" "}
                    {matches.length} potential OEM partners.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {
                        matches.filter(
                          (m) => m.status === "new_match" || m.status === "New Match"
                        ).length
                      }{" "}
                      new
                    </Badge>
                    <Badge variant="outline">
                      {
                        matches.filter(
                          (m) => m.status === "in_discussion" || m.status === "In Discussion"
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
                    No matches yet. Complete onboarding to generate your matches.
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
                      return (
                        <Card
                          key={match.id}
                          className="p-6 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
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
                                <span className={getMatchStatusColor(match.status)}>
                                  Match score: {match.score ?? 100}%
                                </span>
                                {oem.location && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      <MapPin className="inline h-3 w-3 mr-1" />
                                      {oem.location}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" asChild>
                                  <Link
                                    href={ROUTES.oemProfile(oem.slug ?? oem.organizationId)}
                                  >
                                    View Profile
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link
                                    href={ROUTES.requestQuote(oem.organizationId)}
                                  >
                                    <Zap className="h-4 w-4 mr-1" />
                                    Request Quote
                                  </Link>
                                </Button>
                              </div>
                            </div>
                            <div className="text-right">
                              <Target className="h-5 w-5 text-primary" />
                            </div>
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
