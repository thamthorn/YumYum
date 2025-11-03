"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
  Wand2,
  X,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { toast } from "sonner";

type FormData = {
  companyName: string;
  industry: string;
  productType: string;
  moqRange: number[];
  priceRange: number[];
  timeline: string;
  prototypeNeeded: boolean;
  crossBorder: boolean;
};

export default function BuyerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quickMatch, setQuickMatch] = useState(false);
  const [aiSearch, setAiSearch] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productTypeSearch, setProductTypeSearch] = useState("");
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    industry: "",
    productType: "",
    moqRange: [1, 5000],
    priceRange: [0, 1000],
    timeline: "",
    prototypeNeeded: false,
    crossBorder: false,
  });

  const totalSteps = aiSearch ? 1 : 2; // Only 2 steps for Quick Match, 1 for AI
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

  // Unused - kept for future implementation
  // const certifications = [
  //   "ISO 9001:2015",
  //   "ISO 9001",
  //   "GMP",
  //   "OEKO-TEX",
  //   "Organic",
  //   "ISO 22000",
  //   "HACCP",
  //   "FDA",
  //   "Natural Certification",
  //   "ISO 22716",
  //   "CE Mark",
  //   "Safety Standards",
  //   "Organic Certification",
  //   "ISO 13485",
  // ];

  // Fetch product categories from database filtered by industry only
  const { data: productCategories = [] } = useQuery<string[]>({
    queryKey: ["product-categories", formData.industry],
    queryFn: async () => {
      if (!formData.industry) {
        return [];
      }
      const params = new URLSearchParams({
        industry: formData.industry,
      });

      const response = await fetch(
        `/api/product-categories?${params.toString()}`
      );
      if (!response.ok) {
        return [];
      }
      const body = await response.json();
      return body.data || [];
    },
    enabled: Boolean(formData.industry), // Only fetch when industry is selected
  });

  // Fetch ALL product categories when "Other" industry is selected for smart search
  const { data: allProductCategories = [] } = useQuery<string[]>({
    queryKey: ["all-product-categories"],
    queryFn: async () => {
      const response = await fetch(`/api/product-categories`);
      if (!response.ok) {
        return [];
      }
      const body = await response.json();
      return body.data || [];
    },
    enabled: formData.industry === "Other",
  });

  // Filter product categories based on search input for "Other" industry
  const filteredProductCategories = useMemo(() => {
    if (formData.industry !== "Other") {
      return productCategories;
    }

    if (!productTypeSearch.trim()) {
      return allProductCategories.slice(0, 10); // Show first 10 if no search
    }

    const searchLower = productTypeSearch.toLowerCase();
    return allProductCategories
      .filter((category) => category.toLowerCase().includes(searchLower))
      .slice(0, 10); // Limit to 10 results
  }, [
    formData.industry,
    productCategories,
    allProductCategories,
    productTypeSearch,
  ]);

  // Clear product type when industry changes
  useEffect(() => {
    if (formData.productType) {
      updateFormData("productType", "");
    }
    setProductTypeSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.industry]);

  const updateFormData = (
    key: keyof FormData,
    value: string | number[] | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    // AI Search validation
    if (aiSearch && step === 1) {
      return aiSearchQuery.trim().length >= 5;
    }

    // Quick Match step 1: Company info + Industry + Product Type
    if (step === 1) {
      return (
        formData.companyName.trim().length > 0 &&
        formData.industry.trim().length > 0 &&
        formData.productType.trim().length > 0
      );
    }

    // Quick Match step 2: Timeline
    if (step === 2) {
      return formData.timeline.trim().length > 0;
    }

    return true;
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // Handle AI Search separately
      if (aiSearch) {
        const response = await fetch("/api/ai-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: aiSearchQuery,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "AI search failed");
        }

        const result = await response.json();

        // Store AI search results in sessionStorage for the results page
        sessionStorage.setItem(
          "aiSearchResults",
          JSON.stringify(result.recommendations)
        );
        sessionStorage.setItem("searchMode", "ai");

        toast.success("AI found your perfect matches!", {
          icon: <Sparkles className="h-4 w-4" />,
        });
        router.push("/results");
        return;
      }

      // Handle Quick Match onboarding
      const response = await fetch("/api/onboarding/buyer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          location: undefined, // Remove location (moved to Results filter)
          certifications: [], // Remove certifications (moved to Results filter)
          crossBorder: false, // Default value
          quickMatch,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? "Unable to save onboarding data"
        );
      }

      sessionStorage.setItem("searchMode", "quick");

      // Store user preferences for results page filtering
      sessionStorage.setItem(
        "userPreferences",
        JSON.stringify({
          moqRange: formData.moqRange,
          priceRange: formData.priceRange,
          timeline: formData.timeline,
          productType: formData.productType,
          industry: formData.industry,
          quickMatch, // Include quickMatch flag
        })
      );

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
    setAiSearch(false);
    toast.success("Quick Match activated! Just 2 quick questions.", {
      icon: <Zap className="h-4 w-4" />,
    });
  };

  const handleAiSearch = () => {
    setAiSearch(true);
    setQuickMatch(false);
    toast.success("AI Search activated! Describe what you're looking for.", {
      icon: <Wand2 className="h-4 w-4" />,
    });
  };

  const isContinueDisabled =
    isSubmitting || !isStepValid() || (step === 1 && !quickMatch && !aiSearch);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div>Loading...</div>
        </div>
      }
    >
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
                  {aiSearch
                    ? "AI Search - Let AI find your perfect match"
                    : quickMatch
                      ? "Quick Match - Get instant suggestions"
                      : "Tell us about your manufacturing needs"}
                </p>
              </div>

              <div className="mb-8">
                <Progress value={progress} className="h-2" />
              </div>

              <Card className="p-8 animate-scale-in">
                {!quickMatch && !aiSearch && step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold mb-2">
                        Choose Your Flow
                      </h2>
                      <p className="text-muted-foreground">
                        Choose how you want to find your perfect OEM match
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
                        onClick={handleAiSearch}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Wand2 className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">AI Search</h3>
                            <Badge variant="secondary" className="text-xs">
                              ~1 min
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Describe what you need and let AI find the best
                          matches.
                        </p>
                      </Card>
                    </div>
                  </div>
                )}

                {aiSearch && step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="h-8 w-8 text-purple-500" />
                      </div>
                      <h2 className="text-2xl font-semibold mb-2">
                        AI-Powered Search
                      </h2>
                      <p className="text-muted-foreground">
                        Describe what you are looking for and our AI will find
                        the perfect OEM matches
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aiQuery">What are you looking for?</Label>
                      <textarea
                        id="aiQuery"
                        className="w-full min-h-[150px] px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Example: I need an OEM in Thailand that can manufacture cosmetic products with FDA certification, minimum order of 500 units, and can support prototyping..."
                        value={aiSearchQuery}
                        onChange={(e) => setAiSearchQuery(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Be as specific as possible. Include details like
                        industry, location, certifications, MOQ, etc.
                      </p>
                    </div>

                    {aiSearchQuery.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {aiSearchQuery.length < 5 ? (
                          <p className="text-destructive">
                            Please provide more details (at least 5 characters)
                          </p>
                        ) : (
                          <p className="text-green-600">
                            ✓ Looking good! Ready to search.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(quickMatch && step === 1) ||
                (!quickMatch && !aiSearch && step === 2) ? (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">
                      Basic Information
                    </h2>

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
                      {formData.industry === "Other" ? (
                        <div className="space-y-2">
                          <Input
                            id="product"
                            placeholder="Start typing to search product type..."
                            value={productTypeSearch}
                            onChange={(e) =>
                              setProductTypeSearch(e.target.value)
                            }
                            onFocus={() =>
                              setProductTypeSearch(productTypeSearch || "")
                            }
                          />
                          {productTypeSearch.trim() &&
                            filteredProductCategories.length > 0 && (
                              <div className="border rounded-md bg-background max-h-48 overflow-y-auto">
                                {filteredProductCategories.map((category) => (
                                  <div
                                    key={category}
                                    className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => {
                                      updateFormData("productType", category);
                                      setProductTypeSearch(category);
                                    }}
                                  >
                                    {category}
                                  </div>
                                ))}
                              </div>
                            )}
                          {formData.productType && (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {formData.productType}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  onClick={() => {
                                    updateFormData("productType", "");
                                    setProductTypeSearch("");
                                  }}
                                />
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Select
                          value={formData.productType}
                          onValueChange={(value) =>
                            updateFormData("productType", value)
                          }
                        >
                          <SelectTrigger id="product">
                            <SelectValue placeholder="Select product category" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredProductCategories.length > 0 ? (
                              filteredProductCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      {formData.industry &&
                        filteredProductCategories.length === 0 &&
                        formData.industry !== "Other" && (
                          <p className="text-xs text-muted-foreground">
                            No categories available. Try selecting a different
                            industry.
                          </p>
                        )}
                    </div>
                  </div>
                ) : null}

                {quickMatch && step === 2 ? (
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
                          min={1}
                          max={10000}
                          step={1}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formData.moqRange[0]} units</span>
                          <span>{formData.moqRange[1]} units</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Price Range (Per Unit in THB)</Label>
                      <div className="pt-2">
                        <Slider
                          value={formData.priceRange}
                          onValueChange={(value) =>
                            updateFormData("priceRange", value)
                          }
                          min={0}
                          max={10000}
                          step={10}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>฿{formData.priceRange[0]}</span>
                          <span>฿{formData.priceRange[1]}</span>
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
