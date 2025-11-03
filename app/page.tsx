import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import {
  Factory,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Globe,
  Shield,
  Rocket,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "YUMYUM - Match with the Right OEM Manufacturer Faster",
  description:
    "From prototypes to production, find verified manufacturers who match your MOQ, timeline, and quality standards. Trusted by 500+ brands.",
  openGraph: {
    title: "YUMYUM - Match with the Right OEM Manufacturer Faster",
    description:
      "From prototypes to production, find verified manufacturers who match your MOQ, timeline, and quality standards. Trusted by 500+ brands.",
  },
};

export default function Home() {
  const heroImage = "/hero-manufacturing.jpg";
  const productsImage = "/products-variety.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto max-w-[1400px]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="scale" className="mb-4">
                🚀 Trusted by 500+ Brands
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Match with the right <span className="text-primary">OEM</span> —
                faster
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                From prototypes to production, find verified manufacturers who
                match your MOQ, timeline, and quality standards. No more endless
                searching.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="xl" variant="hero" asChild>
                  <Link href="/onboarding/buyer">
                    <ShoppingBag className="mr-2" />
                    Get Matched
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/oems">
                    <Factory className="mr-2" />
                    Browse OEMs
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Verified OEMs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Quick Match in 2 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-info" />
                  <span>Cross-border Ready</span>
                </div>
              </div>

              {/* Trust Partners */}
              <div className="mt-1 pt-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Trusted & Supported By
                </p>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">SEA Bridge</div>
                      <div className="text-xs text-muted-foreground">
                        Strategic Partner
                      </div>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Factory className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        Paiboon Products
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Founding OEM Partner
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <Image
                src={heroImage}
                alt="Modern manufacturing facility"
                width={1600}
                height={1200}
                className="rounded-2xl shadow-xl"
                priority
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border border-border hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">48h Average</div>
                    <div className="text-sm text-muted-foreground">
                      Response Time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold mb-4">How YUMYUM Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to find your perfect manufacturing partner
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Rocket,
                title: "Tell Us Your Needs",
                description:
                  "Share your product details, MOQ, timeline, and certification requirements. Takes just 2 minutes.",
                step: "01",
              },
              {
                icon: Users,
                title: "Get Matched",
                description:
                  "Our algorithm finds verified OEMs that fit your criteria. See scale, ratings, and capabilities instantly.",
                step: "02",
              },
              {
                icon: CheckCircle2,
                title: "Request & Compare",
                description:
                  "Request quotes or prototypes, compare options, and connect directly. Optional liaison service available.",
                step: "03",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Why Choose YUMYUM
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Built for Modern Manufacturing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "3-Tier Verification",
                description:
                  "Verified, Certified, or Trusted Partner status. Know exactly who you're working with.",
              },
              {
                icon: Zap,
                title: "Quick Match",
                description:
                  "Get instant OEM suggestions with minimal input. Perfect for fast-moving projects.",
              },
              {
                icon: Globe,
                title: "Cross-Border Ready",
                description:
                  "Filter for Thailand, Vietnam, China suppliers with import/export capabilities.",
              },
              {
                icon: Factory,
                title: "All Scale Types",
                description:
                  "Home-based, medium, or factory-grade OEMs. Find the right fit for your MOQ.",
              },
              {
                icon: TrendingUp,
                title: "Prototype Support",
                description:
                  "Mark requests as prototype runs. Test products before committing to large orders.",
              },
              {
                icon: Users,
                title: "Group Orders",
                description:
                  "Combine small orders with others to meet MOQ requirements. Smart and cost-effective.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-md transition-all duration-300 border-2 hover:border-primary/50"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Industries We Serve</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Specialized OEMs across multiple sectors
            </p>
          </div>

          <div className="relative">
            <Image
              src={productsImage}
              alt="Diverse product samples"
              width={1600}
              height={900}
              className="rounded-2xl shadow-xl w-full max-w-4xl mx-auto"
            />
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                "Fashion",
                "F&B",
                "Cosmetics",
                "Medical/Dental",
                "Education",
                "Packaging",
              ].map((industry) => (
                <Badge
                  key={industry}
                  variant="scale"
                  className="text-sm px-4 py-2"
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto max-w-[1400px]">
          <Card className="p-12 text-center bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of brands already manufacturing smarter with YUMYUM
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="hero" asChild>
                <Link href="/onboarding/buyer">Get Matched Now</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust & Partners Section */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              Trusted Partners & Supporters
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
              {/* SEA Bridge Network */}
              <div className="flex flex-col items-center gap-3 group">
                <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">SEA Bridge</div>
                  <div className="text-sm text-muted-foreground">
                    ASEAN Startup Accelerator
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Strategic Partner
                  </Badge>
                </div>
              </div>

              {/* Paiboon Products */}
              <div className="flex flex-col items-center gap-3 group">
                <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Factory className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">Paiboon Products</div>
                  <div className="text-sm text-muted-foreground">
                    Premium F&B Manufacturing
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Founding OEM Partner
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">
                Escrow Protected
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">Verified</div>
              <div className="text-sm text-muted-foreground">OEM Partners</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">
                Brands Trust Us
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">30+</div>
              <div className="text-sm text-muted-foreground">
                Years Experience
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold">
              <span className="text-foreground">YUM</span>
              <span className="text-primary">²</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                href="/trust"
                className="hover:text-primary transition-colors"
              >
                Trust & Safety
              </Link>
              <Link
                href="/pricing"
                className="hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <a href="#" className="hover:text-primary transition-colors">
                Contact
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 YUMYUM. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
