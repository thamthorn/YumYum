"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Shield,
  Eye,
  FileCheck,
  Star,
  Award,
} from "lucide-react";

export default function Trust() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="verified" className="mb-4">
              Verified by YUM²
            </Badge>
            <h1 className="text-5xl font-bold mb-4">Trust & Verification</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every OEM on YUMYUM undergoes rigorous verification to ensure
              quality, reliability, and professionalism.
            </p>
          </div>

          {/* Verification Tiers */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Verification Tiers
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 animate-scale-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <Badge variant="verified">✓ Verified</Badge>
                </div>
                <h3 className="text-xl font-bold mb-3">Verified</h3>
                <p className="text-muted-foreground mb-4">
                  Basic verification of business registration, identity, and
                  contact information.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Business registration verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Identity confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Contact details validated</span>
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 animate-scale-in border-2 border-info"
                style={{ animationDelay: "100ms" as unknown as string }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-info" />
                  </div>
                  <Badge variant="certified">✓ Certified</Badge>
                </div>
                <h3 className="text-xl font-bold mb-3">Certified</h3>
                <p className="text-muted-foreground mb-4">
                  Enhanced verification including facility review,
                  certifications, and quality standards.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-info" />
                    <span>All Verified checks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-info" />
                    <span>Facility documentation reviewed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-info" />
                    <span>Certifications validated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-info" />
                    <span>Sample products assessed</span>
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 animate-scale-in border-2 border-primary"
                style={{ animationDelay: "200ms" as unknown as string }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-trusted/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-trusted" />
                  </div>
                  <Badge variant="trusted">✨ Trusted Partner</Badge>
                </div>
                <h3 className="text-xl font-bold mb-3">Trusted Partner</h3>
                <p className="text-muted-foreground mb-4">
                  Highest level including on-site audit, track record review,
                  and performance guarantee.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-trusted" />
                    <span>All Certified checks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-trusted" />
                    <span>On-site factory audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-trusted" />
                    <span>Performance guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-trusted" />
                    <span>Dedicated support liaison</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Verification Process */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">
              Our Verification Process
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Every OEM goes through a multi-step verification to ensure they
              meet our quality standards
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: FileCheck,
                  title: "Document Review",
                  description:
                    "We verify business registration, tax documents, and operational licenses to ensure legitimacy.",
                },
                {
                  icon: Eye,
                  title: "Facility Assessment",
                  description:
                    "Review of facility photos, equipment lists, and production capabilities to validate scale claims.",
                },
                {
                  icon: Shield,
                  title: "Certification Validation",
                  description:
                    "Independent verification of ISO, GMP, FDA, and other certification claims with issuing bodies.",
                },
                {
                  icon: Award,
                  title: "Performance Tracking",
                  description:
                    "Ongoing monitoring of response times, delivery reliability, and buyer satisfaction ratings.",
                },
              ].map((step, index) => (
                <Card
                  key={index}
                  className="p-6 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms` as unknown as string,
                  }}
                >
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Additional Safety Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Escrow Protection
                </h3>
                <p className="text-muted-foreground mb-4">
                  Optional escrow service holds payment until you confirm
                  delivery and quality. Fair dispute resolution if issues arise.
                </p>
                <Badge variant="scale">Partner Plan Feature</Badge>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Quality Audits</h3>
                <p className="text-muted-foreground mb-4">
                  Independent third-party inspection before shipment. Detailed
                  reports on quality, quantity, and specifications.
                </p>
                <Badge variant="scale">Partner Plan Feature</Badge>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Liaison Service</h3>
                <p className="text-muted-foreground mb-4">
                  Trusted intermediary helps with communication, negotiation,
                  and ensures smooth transactions between parties.
                </p>
                <Badge variant="scale">Partner Plan Feature</Badge>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Rating System</h3>
                <p className="text-muted-foreground mb-4">
                  Transparent buyer reviews covering speed, responsiveness,
                  quality, and on-time delivery performance.
                </p>
                <Badge variant="scale">All Plans</Badge>
              </Card>
            </div>
          </div>

          {/* How to Get Verified */}
          <Card className="p-8 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Are You an OEM?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get verified and start connecting with qualified buyers. Our
                verification process typically takes 3-5 business days.
              </p>
              <Button size="lg" asChild>
                <Link href="/dashboard/oem">Apply for Verification</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
