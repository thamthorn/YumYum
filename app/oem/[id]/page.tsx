"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Factory,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Globe,
  Rocket,
  FileText,
  Package,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { isAuthenticated } from "@/lib/auth";
import { getOEMById, ROUTES, COPY, getReviewsForOEM } from "@/data/MockData";

export default function OEMProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isLoggedIn = isAuthenticated();

  const oem = getOEMById(Number(id));

  if (!oem) {
    notFound();
  }

  const reviews = getReviewsForOEM(oem.id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6">
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Factory className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{oem.name}</h1>
                    {oem.verification === "Trusted Partner" && (
                      <Badge variant="trusted">✨ Trusted Partner</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <Badge variant="scale" className="flex items-center gap-1">
                      <Factory className="h-3 w-3" /> Factory-grade
                    </Badge>
                    <Badge variant="scale" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {oem.location}
                    </Badge>
                    {oem.established && (
                      <Badge
                        variant="scale"
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" /> Est. {oem.established}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold text-foreground">
                        {oem.rating}
                      </span>
                      <span>({oem.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{oem.responseTime}h avg response</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg" asChild>
                  <Link href={ROUTES.requestQuote(oem.id)}>
                    {COPY.ctas.requestQuote}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={ROUTES.requestPrototype(oem.id)}>
                    <Rocket className="mr-2 h-4 w-4" />
                    {COPY.ctas.requestPrototype}
                  </Link>
                </Button>
                {isLoggedIn && (
                  <Button variant="outline" asChild>
                    <Link href={ROUTES.messageThread(oem.id.toString())}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {COPY.ctas.directMessage}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                MOQ Range
              </div>
              <div className="text-lg font-semibold">
                {oem.moqMin}–{oem.moqMax}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Lead Time
              </div>
              <div className="text-lg font-semibold">{oem.leadTime} days</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Team Size
              </div>
              <div className="text-lg font-semibold">{oem.employees}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Languages
              </div>
              <div className="text-sm font-semibold">
                {oem.languages?.join(", ")}
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="previous-products">
                Previous Products
              </TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {oem.shortDescription}
                </p>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Industries Served
                </h2>
                <div className="flex flex-wrap gap-2">
                  {oem.industry.map((industry) => (
                    <Badge key={industry} variant="secondary">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold">Verified by YUM²</div>
                      <div className="text-sm text-muted-foreground">
                        {oem.verification}
                      </div>
                    </div>
                  </div>
                  {oem.crossBorder && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <div className="font-semibold">Cross-Border Ready</div>
                        <div className="text-sm text-muted-foreground">
                          International shipping
                        </div>
                      </div>
                    </div>
                  )}
                  {oem.prototypeSupport && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Rocket className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Prototype Support</div>
                        <div className="text-sm text-muted-foreground">
                          Small run samples
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Fast Response</div>
                      <div className="text-sm text-muted-foreground">
                        {oem.responseTime}h average
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Services Offered
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {oem.services.map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Production Capacity
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Minimum Order</span>
                    <span className="font-semibold">{oem.moqMin} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maximum Order</span>
                    <span className="font-semibold">{oem.moqMax} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Standard Lead Time
                    </span>
                    <span className="font-semibold">{oem.leadTime} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Workforce</span>
                    <span className="font-semibold">
                      {oem.employees} employees
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="previous-products" className="space-y-6">
              {oem.previousProducts && oem.previousProducts.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {oem.previousProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden border-2 hover:shadow-lg transition-all"
                    >
                      <div className="relative aspect-4/3 overflow-hidden bg-muted">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {product.note && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {product.note}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Previous Products
                  </h3>
                  <p className="text-muted-foreground">
                    This manufacturer hasn&apos;t uploaded any previous work
                    samples yet.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="certifications" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Certifications & Compliance
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {oem.certifications.map((cert) => (
                    <Card key={cert.name} className="p-4 border-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{cert.name}</h3>
                        {cert.verified ? (
                          <Badge variant="verified">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Documentation verified by YUM²
                      </p>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {oem.rating}
                  </div>
                  <div className="flex justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(oem.rating || 0)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {oem.totalReviews} reviews
                  </div>
                </Card>
                {[
                  { label: "Speed", value: 4.7 },
                  { label: "Quality", value: 4.9 },
                  { label: "On-Time", value: 4.6 },
                ].map((metric) => (
                  <Card key={metric.label} className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.label}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{review.buyer}</div>
                        <div className="text-sm text-muted-foreground">
                          {review.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {review.comment}
                    </p>
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                      {Object.entries(review.scores).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-sm font-semibold">{value}/5</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {key}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Bottom CTA */}
          <Card className="p-8 text-center bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 mt-8">
            <h2 className="text-2xl font-bold mb-2">Ready to Work Together?</h2>
            <p className="text-muted-foreground mb-6">
              Request a quote or prototype to get started
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={ROUTES.requestQuote(oem.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  {COPY.ctas.requestQuote}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={ROUTES.requestPrototype(oem.id)}>
                  <Rocket className="mr-2 h-4 w-4" />
                  {COPY.ctas.requestPrototype}
                </Link>
              </Button>
              {isLoggedIn && (
                <Button variant="outline" size="lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask for Liaison
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
