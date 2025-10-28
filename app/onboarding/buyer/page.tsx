"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { toast } from "sonner";

type FormData = {
  companyName: string;
  industry: string;
  productType: string;
  moqRange: number[];
  timeline: string;
  location: string;
  certifications: string[];
  prototypeNeeded: boolean;
  crossBorder: boolean;
};

export default function BuyerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quickMatch, setQuickMatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    industry: "",
    productType: "",
    moqRange: [100, 5000],
    timeline: "",
    location: "",
    certifications: [],
    prototypeNeeded: false,
    crossBorder: false,
  });

  const totalSteps = quickMatch ? 2 : 4;
  const progress = (step / totalSteps) * 100;

  const industries = useMemo(
    () => [
      "Fashion",
      "F&B",
      "Cosmetics",
      "Dental/Medical",
      "Education",
      "Packaging",
      "Other",
    ],
    []
  );

  const certifications = ["ISO", "GMP", "FDA", "Halal", "Organic", "CE"];

  useEffect(() => {
    if (quickMatch && !formData.location) {
      updateFormData("location", "any");
    }
  }, [quickMatch, formData.location]);

  const updateFormData = (
    key: keyof FormData,
    value: string | number[] | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCertification = (cert: string) => {
    setFormData((prev) => {
      const current = prev.certifications;
      if (current.includes(cert)) {
        return {
          ...prev,
          certifications: current.filter((c) => c !== cert),
        };
      }
      return { ...prev, certifications: [...current, cert] };
    });
  };

  const isStepValid = () => {
    if ((quickMatch && step === 1) || (!quickMatch && step === 2)) {
      return (
        formData.companyName.trim().length > 0 &&
        formData.industry.trim().length > 0 &&
        formData.productType.trim().length > 0
      );
    }
    if ((quickMatch && step === 2) || (!quickMatch && step === 3)) {
      return formData.timeline.trim().length > 0;
    }
    if (!quickMatch && step === 4) {
      return formData.location.trim().length > 0;
    }
    return true;
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding/buyer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quickMatch,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Unable to save onboarding data");
      }

      toast.success("Perfect! Finding your matches...", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      router.push("/results");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save your details. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!isStepValid()) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
      toast.success("Great! Let's continue", {
        icon: <Sparkles className="h-4 w-4" />,
      });
      return;
    }

    if (isSubmitting) return;
    await submitOnboarding();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleQuickMatch = () => {
    setQuickMatch(true);
    toast.success("Quick Match activated! Just 2 quick questions.", {
      icon: <Zap className="h-4 w-4" />,
    });
  };

  const isContinueDisabled =
    isSubmitting || !isStepValid() || (step === 1 && !quickMatch);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div>Loading...</div></div>}>
      <ProtectedClient>
        <div className="min-h-screen bg-background">
          <Navigation />

          <div className="pt-24 pb-12">
            <div className="container mx-auto max-w-3xl">
              <div className="text-center mb-8 animate-fade-in">
                <Badge variant="secondary" className="mb-4">
                  Step {step} of {totalSteps}
                </Badge>
                <h1 className="text-4xl font-bold mb-2">
                  Let&apos;s Find Your Perfect OEM
                </h1>
              <p className="text-muted-foreground">
                {quickMatch
                  ? "Quick Match - Get instant suggestions"
                  : "Tell us about your manufacturing needs"}
              </p>
            </div>

            <div className="mb-8">
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="p-8 animate-scale-in">
              {!quickMatch && step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      Choose Your Flow
                    </h2>
                    <p className="text-muted-foreground">
                      Get instant matches or provide detailed requirements
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card
                      className="p-6 cursor-pointer hover:border-primary transition-all border-2"
                      onClick={handleQuickMatch}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Quick Match</h3>
                          <Badge variant="secondary" className="text-xs">
                            ~2 min
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Minimum input, instant suggestions. Perfect for
                        exploration.
                      </p>
                    </Card>

                    <Card
                      className="p-6 cursor-pointer hover:border-primary transition-all border-2"
                      onClick={() => setStep(2)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-info" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Full Flow</h3>
                          <Badge variant="secondary" className="text-xs">
                            ~5 min
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Detailed requirements for precise matching and better
                        results.
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {(quickMatch && step === 1) || (!quickMatch && step === 2) ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Basic Information</h2>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={(e) =>
                        updateFormData("companyName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) =>
                        updateFormData("industry", value)
                      }
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product">Product Type</Label>
                    <Input
                      id="product"
                      placeholder="E.g., T-shirts, Cosmetic cream, Snack bars"
                      value={formData.productType}
                      onChange={(e) =>
                        updateFormData("productType", e.target.value)
                      }
                    />
                  </div>
                </div>
              ) : null}

              {(quickMatch && step === 2) || (!quickMatch && step === 3) ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Requirements</h2>

                  <div className="space-y-2">
                    <Label>MOQ Range (Minimum Order Quantity)</Label>
                    <div className="pt-2">
                      <Slider
                        value={formData.moqRange}
                        onValueChange={(value) =>
                          updateFormData("moqRange", value)
                        }
                        min={50}
                        max={10000}
                        step={50}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formData.moqRange[0]} units</span>
                        <span>{formData.moqRange[1]} units</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline / Deadline</Label>
                    <Select
                      value={formData.timeline}
                      onValueChange={(value) =>
                        updateFormData("timeline", value)
                      }
                    >
                      <SelectTrigger id="timeline">
                        <SelectValue placeholder="Select your timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">
                          Urgent (1-2 weeks)
                        </SelectItem>
                        <SelectItem value="standard">
                          Standard (1-2 months)
                        </SelectItem>
                        <SelectItem value="flexible">
                          Flexible (3+ months)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="prototype"
                      checked={formData.prototypeNeeded}
                      onCheckedChange={(checked) =>
                        updateFormData("prototypeNeeded", checked as boolean)
                      }
                    />
                    <Label htmlFor="prototype" className="cursor-pointer">
                      I need a prototype / sample run first
                    </Label>
                  </div>
                </div>
              ) : null}

              {!quickMatch && step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">
                    Additional Preferences
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="location">Preferred Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) =>
                        updateFormData("location", value)
                      }
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select preferred location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Location</SelectItem>
                        <SelectItem value="thailand">Thailand</SelectItem>
                        <SelectItem value="vietnam">Vietnam</SelectItem>
                        <SelectItem value="china">China</SelectItem>
                        <SelectItem value="sea">Southeast Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Required Certifications</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {certifications.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <Checkbox
                            id={cert}
                            checked={formData.certifications.includes(cert)}
                            onCheckedChange={() => toggleCertification(cert)}
                          />
                          <Label htmlFor={cert} className="cursor-pointer">
                            {cert}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="crossBorder"
                      checked={formData.crossBorder}
                      onCheckedChange={(checked) =>
                        updateFormData("crossBorder", checked as boolean)
                      }
                    />
                    <Label htmlFor="crossBorder" className="cursor-pointer">
                      Must support cross-border shipping
                    </Label>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className={step === 1 ? "w-full" : "ml-auto"}
                  disabled={isContinueDisabled}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : step === totalSteps
                      ? "Find Matches"
                      : "Continue"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </Card>

            <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Verified OEM Network</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Smart Matching Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedClient>
    </Suspense>
  );
}
