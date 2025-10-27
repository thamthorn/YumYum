"use client";

import Link from "next/link";
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
import {
  QUOTE_REQUESTS,
  DASHBOARD_STATS,
  MATCHES,
  ROUTES,
  COPY,
  getStatusBadge,
  getMatchStatusVariant,
  getMatchStatusColor,
  getScaleBadgeVariant,
} from "@/data/MockData";

import { Suspense } from "react";

export default function BuyerDashboard() {
  const requests = QUOTE_REQUESTS;
  const matches = MATCHES;

  const stats = [
    {
      label: DASHBOARD_STATS[0].label,
      value: DASHBOARD_STATS[0].value,
      icon: Package,
      color: DASHBOARD_STATS[0].color,
    },
    {
      label: DASHBOARD_STATS[1].label,
      value: DASHBOARD_STATS[1].value,
      icon: MessageSquare,
      color: DASHBOARD_STATS[1].color,
    },
    {
      label: DASHBOARD_STATS[2].label,
      value: DASHBOARD_STATS[2].value,
      icon: Heart,
      color: DASHBOARD_STATS[2].color,
    },
    {
      label: DASHBOARD_STATS[3].label,
      value: DASHBOARD_STATS[3].value,
      icon: TrendingUp,
      color: DASHBOARD_STATS[3].color,
    },
  ];

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProtectedClient>
        <div className="min-h-screen bg-background">
          <Navigation />

          <div className="pt-24 pb-12">
            <div className="container mx-auto max-w-6xl">
              {/* Header */}
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

              {/* Stats Grid */}
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

              {/* Main Tabs */}
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
                  {requests.map((request) => (
                    <Card
                      key={request.id}
                      className="p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {request.product}
                            </h3>
                            <Badge variant={getStatusBadge(request.status)}>
                              {request.status}
                            </Badge>
                            <Badge variant="scale">
                              {request.type === "prototype"
                                ? "Prototype"
                                : "Quote"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>OEM: {request.oem}</span>
                            <span>•</span>
                            <span>Qty: {request.quantity} units</span>
                            <span>•</span>
                            <span>{request.date}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={ROUTES.messageThread(
                                  request.id.toString()
                                )}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Link>
                            </Button>
                            {request.status === "Quote Received" && (
                              <Button size="sm" className="cursor-pointer">
                                Review Quote
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {request.status === "Pending Response" ? (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          ) : request.status === "Quote Received" ? (
                            <AlertCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="matches" className="space-y-4">
                  <div className="mb-6">
                    <p className="text-muted-foreground mb-4">
                      Based on your requirements and preferences, we&apos;ve
                      found {matches.length} potential OEM partners.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {matches.filter((m) => m.status === "New Match").length}{" "}
                        New
                      </Badge>
                      <Badge variant="outline">
                        {
                          matches.filter((m) => m.status === "In Discussion")
                            .length
                        }{" "}
                        In Discussion
                      </Badge>
                      <Badge variant="outline">
                        {
                          matches.filter((m) => m.status === "Quote Requested")
                            .length
                        }{" "}
                        Quote Requested
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {matches.map((match) => (
                      <Card
                        key={match.id}
                        className="p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {match.oemName}
                              </h3>
                              <Badge
                                variant={getScaleBadgeVariant(match.scale)}
                              >
                                {match.scale}
                              </Badge>
                              <Badge
                                variant={getMatchStatusVariant(match.status)}
                              >
                                {match.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {match.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {match.responseTime} response
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                MOQ: {match.moqRange}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Target className="h-5 w-5 text-primary" />
                              <span className="text-2xl font-bold text-primary">
                                {match.matchScore}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Match Score
                            </p>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">
                            Why this match:
                          </p>
                          <ul className="space-y-1">
                            {match.matchReason
                              .slice(0, 3)
                              .map((reason, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                          </ul>
                        </div>

                        {/* Status Info */}
                        {match.lastActivity && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Zap
                                className={`h-4 w-4 ${getMatchStatusColor(match.status)}`}
                              />
                              <span className="font-medium">
                                Latest Activity:
                              </span>
                              <span className="text-muted-foreground">
                                {match.lastActivity}
                              </span>
                            </div>
                            {match.contactedDate && (
                              <p className="text-xs text-muted-foreground mt-1 ml-6">
                                Contacted {match.contactedDate}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {match.orderId ? (
                            <Button size="sm" asChild>
                              <Link href={ROUTES.orderDetail(match.orderId)}>
                                <Package className="h-4 w-4 mr-1" />
                                View Order
                              </Link>
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" asChild>
                                <Link href={ROUTES.oemProfile(match.oemId)}>
                                  View Profile
                                </Link>
                              </Button>
                              {match.status === "New Match" && (
                                <Button size="sm" variant="outline">
                                  Contact OEM
                                </Button>
                              )}
                              {(match.status === "Contacted" ||
                                match.status === "In Discussion") && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link
                                    href={ROUTES.messageThread(
                                      match.id.toString()
                                    )}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Continue Chat
                                  </Link>
                                </Button>
                              )}
                              {match.status === "In Discussion" && (
                                <Button size="sm" variant="outline">
                                  Request Quote
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {matches.length === 0 && (
                    <Card className="p-12 text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Matches Yet
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Complete your buyer profile to get personalized OEM
                        matches
                      </p>
                      <Button asChild>
                        <Link href={ROUTES.onboarding}>Complete Profile</Link>
                      </Button>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                  <Card className="p-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Saved OEMs</h3>
                    <p className="text-muted-foreground mb-6">
                      Save interesting manufacturers for quick access later
                    </p>
                    <Button asChild>
                      <Link href={ROUTES.results}>Find OEMs</Link>
                    </Button>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </ProtectedClient>
    </Suspense>
  );
}
