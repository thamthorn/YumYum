import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { PRODUCT_CATEGORIES } from "@/data/constants";
import {
  Factory,
  // ...existing code...
  CheckCircle2,
  Clock,
  Globe,
  Shield,
  Rocket,
  Users,
  Zap,
  TrendingUp,
  Search,
  Sparkles,
  Pill,
  Palette,
  Coffee,
  Package,
  Shirt,
  Cpu,
  Home as HomeIcon,
} from "lucide-react";



// Map icon strings to components
const IconMap: Record<string, any> = {
  Sparkles,
  Pill,
  Palette,
  Coffee,
  Package,
  Shirt,
  Cpu,
  Home: HomeIcon,
};

export default function Home() {
  const productsImage = "/products-variety.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - Yellow Theme */}
      <section className="pt-24 pb-24 relative overflow-hidden">
        {/* Modern Gradient Background - Yellow to White to Yellow */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-white to-primary/15" />

        {/* Abstract Shapes & Depth */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px]" />

        <div className="container mx-auto max-w-[1400px] relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-1 text-xs font-medium bg-white/60 text-yellow-800 hover:bg-white/80 border-0 backdrop-blur-sm shadow-sm"
            >
              🚀 Trusted by 500+ Brands
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Find your{" "}
              <span className="text-primary underline decoration-4 decoration-primary/30 underline-offset-4">
                OEM match
              </span>
            </h1>
            <p className="text-lg text-slate-700 mb-6 font-medium max-w-2xl leading-relaxed">
              Connect with verified manufacturers for your brand in minutes.
              From prototype to production, we&apos;ve got you covered.
            </p>

            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="w-full md:w-auto h-12 px-8 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all rounded-xl bg-primary hover:bg-primary-hover text-white"
                asChild
              >
                <Link href="/matching">Start Matching</Link>
              </Button>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground/80">
                <div className="flex items-center gap-1.5">
                  <div className="bg-green-100 p-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Verified Factories</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Fast Response</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-purple-100 p-1 rounded-full">
                    <Shield className="h-3 w-3 text-purple-600" />
                  </div>
                  <span>Secure Escrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer - Overlapping Grid */}
      <section className="pb-12 -mt-12 relative z-20 px-4">
        <div className="container mx-auto max-w-[1000px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
            {PRODUCT_CATEGORIES.map((category) => {
              const Icon = IconMap[category.icon] || Package;
              return (
                <Link
                  key={category.slug}
                  href={`/oems?category=${category.slug}`}
                  className="group"
                >
                  <Card className="h-full p-4 hover:shadow-xl transition-all duration-300 border-0 bg-white hover:-translate-y-1.5 flex flex-col items-center text-center gap-3 relative overflow-hidden ring-1 ring-black/5">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                      <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors">
                      {category.label}
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Original Content Below */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How YUMYUM Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We streamline the entire manufacturing process, from finding the
              right partner to final delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "1. Match",
                desc: "Tell us what you need. Our AI matches you with verified OEMs that fit your criteria.",
              },
              {
                icon: Users,
                title: "2. Connect",
                desc: "Chat directly with manufacturers, request samples, and negotiate terms securely.",
              },
              {
                icon: Rocket,
                title: "3. Launch",
                desc: "Manage production, payments, and logistics all in one place. Launch faster.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Partners */}
      <section className="py-12 border-y border-border/50">
        <div className="container mx-auto max-w-[1400px]">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wider">
            Trusted & Supported By
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Partner Logos would go here - using placeholders */}
            <div className="flex items-center gap-2 font-bold text-xl">
              <Globe className="h-6 w-6" /> SEA Bridge
            </div>

            {/* <div className="flex items-center gap-2 font-bold text-xl">
              <CheckCircle2 className="h-6 w-6" /> VerifiedMfg
            </div> */}
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
                className="p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 ring-1 ring-black/5"
              >
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <item.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
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
                title: "Normal Matching",
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
                className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border hover:border-primary/50 group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
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
                <Link href="/matching">Get Matched Now</Link>
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
