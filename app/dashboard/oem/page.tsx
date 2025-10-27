"use client";

import { Suspense } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Settings,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { ROUTES } from "@/data/MockData";

export default function OEMDashboard() {
  const stats = [
    { label: "Profile Views", value: "342", change: "+12%", icon: Eye },
    { label: "Saved by Buyers", value: "28", change: "+4", icon: Heart },
    { label: "Quote Requests", value: "15", change: "+3", icon: FileText },
    {
      label: "Response Rate",
      value: "94%",
      change: "+2%",
      icon: MessageSquare,
    },
  ];

  const profileCompletion = 75;

  const leads = [
    {
      id: 1,
      buyer: "FashionBrand Co.",
      product: "Custom Apparel",
      quantity: 2000,
      status: "New",
      date: "2 hours ago",
    },
    {
      id: 2,
      buyer: "StyleHub Ltd.",
      product: "Prototype Bags",
      quantity: 50,
      status: "Responded",
      date: "1 day ago",
    },
    {
      id: 3,
      buyer: "BeautyLab Inc.",
      product: "Cosmetic Packaging",
      quantity: 1000,
      status: "In Discussion",
      date: "3 days ago",
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
              <div className="flex justify-between items-start mb-8 animate-fade-in">
                <div>
                  <h1 className="text-4xl font-bold mb-2">OEM Dashboard</h1>
                  <p className="text-muted-foreground">
                    Manage your profile and connect with buyers
                  </p>
                </div>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>

              {/* Profile Completion */}
              {profileCompletion < 100 && (
                <Card className="p-6 mb-8 border-primary/50 bg-primary/5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">
                        Complete Your Profile
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Complete profiles get 3x more visibility
                      </p>
                    </div>
                    <Badge variant="scale">{profileCompletion}%</Badge>
                  </div>
                  <Progress value={profileCompletion} className="mb-4" />
                  <div className="flex gap-2">
                    <Button size="sm">Upload Certifications</Button>
                    <Button size="sm" variant="outline">
                      Add Gallery
                    </Button>
                  </div>
                </Card>
              )}

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
                      <stat.icon className="h-5 w-5 text-primary" />
                      <Badge variant="scale" className="text-success">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Recent Leads */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Recent Leads</h2>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {leads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {lead.product}
                            </h3>
                            <Badge
                              variant={
                                lead.status === "New"
                                  ? "default"
                                  : lead.status === "Responded"
                                    ? "verified"
                                    : "certified"
                              }
                            >
                              {lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>Buyer: {lead.buyer}</span>
                            <span>•</span>
                            <span>Qty: {lead.quantity} units</span>
                            <span>•</span>
                            <span>{lead.date}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">
                              {lead.status === "New"
                                ? "Respond"
                                : "View Conversation"}
                            </Button>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          {lead.status === "New" ? (
                            <AlertCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Upgrade Prompt */}
              <Card className="p-8 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      Get More Visibility
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Upgrade to Pro or Partner status to get featured
                      placement, analytics, and more qualified leads.
                    </p>
                    <div className="flex gap-3">
                      <Button asChild>
                        <Link href={ROUTES.pricing}>View Plans</Link>
                      </Button>
                      <Button variant="outline">Learn More</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedClient>
    </Suspense>
  );
}
