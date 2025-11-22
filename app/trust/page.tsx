import Link from "next/link";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Trust & Verification | YUMYUM",
  description:
    "Every OEM on YUMYUM undergoes rigorous verification to ensure quality, reliability, and professionalism. Learn about our verification tiers and standards.",
  openGraph: {
    title: "Trust & Verification | YUMYUM",
    description:
      "Every OEM on YUMYUM undergoes rigorous verification to ensure quality, reliability, and professionalism.",
  },
};

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

          {/* Verification Standard */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              The Verified Partner Standard
            </h2>
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 animate-scale-in border-2 border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-xl font-medium">
                  Highest Standard
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="shrink-0 text-center">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Award className="h-12 w-12 text-primary" />
                    </div>
                    <Badge variant="verified" className="text-lg px-4 py-1">
                      Verified Partner
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">
                      Factory Inspection & Compliance Check
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      The &quot;Verified Partner&quot; badge is our highest seal
                      of trust. It means the manufacturer has undergone a
                      rigorous physical or virtual inspection, their
                      certifications have been validated, and their production
                      capabilities are confirmed.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="font-medium">Factory Inspection</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="font-medium">Compliance Check</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="font-medium">Factory Tour Video</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="font-medium">
                          QC Process Verification
                        </span>
                      </div>
                    </div>
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
              To become a Verified Partner, OEMs must pass our comprehensive
              4-step validation
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: FileCheck,
                  title: "1. Document Verification",
                  description:
                    "We validate business registration, tax ID, and operational licenses to ensure the company is a legal entity.",
                },
                {
                  icon: Shield,
                  title: "2. Certification Validation",
                  description:
                    "We verify claimed certifications (GMP, ISO, Halal, FDA) directly with issuing bodies to ensure they are active and valid.",
                },
                {
                  icon: Eye,
                  title: "3. Factory Inspection",
                  description:
                    "Our team or certified partners conduct an inspection (on-site or virtual) to verify machinery, production lines, and capacity.",
                },
                {
                  icon: Star,
                  title: "4. Video Verification",
                  description:
                    "We require and review Factory Tour and QC Process videos to ensure transparency in operations.",
                },
              ].map((step, index) => (
                <Card key={index} className="p-6 animate-fade-in">
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
