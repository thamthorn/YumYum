import Link from "next/link";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Shield, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing Plans | YUMYUM",
  description:
    "Choose the perfect plan for your manufacturing needs. Start free and upgrade as you grow. Compare our Free, Pro, and Partner plans.",
  openGraph: {
    title: "Pricing Plans | YUMYUM",
    description:
      "Choose the perfect plan for your manufacturing needs. Start free and upgrade as you grow.",
  },
};

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      icon: Zap,
      price: "$0",
      period: "forever",
      description: "Perfect for exploring and discovering OEMs",
      features: [
        "Browse all verified OEMs",
        "Basic filtering and search",
        "Request quotes",
        "Direct messaging",
        "Compare up to 3 OEMs",
      ],
      cta: "Start Free",
      href: "/onboarding/buyer",
      popular: false,
    },
    {
      name: "Pro",
      icon: Shield,
      price: "$49",
      period: "per month",
      description: "For serious buyers with regular manufacturing needs",
      features: [
        "Everything in Free",
        "Advanced filters & search",
        "Unlimited comparisons",
        "Priority support",
        "Request prototype marking",
        "Group order coordination",
        "Analytics dashboard",
      ],
      cta: "Start Pro Trial",
      href: "/onboarding/buyer",
      popular: true,
    },
    {
      name: "Partner",
      icon: Star,
      price: "$199",
      period: "per month",
      description: "Complete manufacturing partnership with premium services",
      features: [
        "Everything in Pro",
        "Dedicated liaison service",
        "Escrow payment protection",
        "Quality audit services",
        "Factory visit coordination",
        "Legal document support",
        "Preferred OEM access",
        "Custom matching algorithm",
      ],
      cta: "Contact Sales",
      href: "#",
      popular: false,
    },
  ];

  const oemFeatures = [
    {
      tier: "Free",
      price: "$0",
      features: [
        "Basic profile listing",
        "Up to 5 photos",
        "Accept quote requests",
      ],
    },
    {
      tier: "Pro",
      price: "$99/mo",
      features: [
        "Featured placement",
        "Unlimited photos & videos",
        "Analytics dashboard",
        "Priority in search",
        "Verified badge",
      ],
    },
    {
      tier: "Partner",
      price: "$299/mo",
      features: [
        "Trusted Partner badge",
        "Dedicated account manager",
        "Lead generation support",
        "Premium support",
        "Marketing assistance",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include access to
              our verified OEM network.
            </p>
          </div>

          {/* Buyer Plans */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              For Buyers & Brands
            </h2>
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`p-8 relative animate-slide-up ${
                    plan.popular ? "border-2 border-primary shadow-xl" : ""
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <plan.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* OEM Plans */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">
              For OEM Manufacturers
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Get discovered by qualified buyers. Pay only for the visibility
              and features you need.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {oemFeatures.map((tier) => (
                <Card key={tier.tier} className="p-6 animate-scale-in">
                  <h3 className="text-xl font-bold mb-2">{tier.tier}</h3>
                  <div className="text-3xl font-bold text-primary mb-6">
                    {tier.price}
                  </div>
                  <div className="space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6" asChild>
                    <Link href="/dashboard/oem">Get Started</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Is the buyer free plan really free forever?",
                  a: "Yes! Buyers can browse, search, and request quotes completely free. We only charge OEMs for enhanced visibility.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers. Enterprise customers can arrange invoicing.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, all plans are month-to-month with no long-term commitment. Cancel anytime from your dashboard.",
                },
                {
                  q: "What's included in the liaison service?",
                  a: "Our liaison team acts as a trusted intermediary, helping with communication, negotiation, and ensuring smooth transactions between you and the OEM.",
                },
                {
                  q: "How does escrow protection work?",
                  a: "We hold your payment securely until you confirm delivery and quality. If there's a dispute, our team mediates fairly.",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="p-6 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms` as unknown as string,
                  }}
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="p-12 text-center bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 mt-20">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of brands manufacturing smarter with YUMYUM
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/onboarding/buyer">Start Free</Link>
              </Button>
              <Button size="lg" variant="outline">
                Talk to Sales
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
