"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// ...existing code...
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSupabase } from "@/lib/supabase/session-context";
import { ROUTES } from "@/data/constants";
import { useToast } from "@/hooks/use-toast";
import {
  // ...existing code...
  Search,
  ArrowRight,
  Shield,
  Clock,
  // ...existing code...
  Loader2,
} from "lucide-react";

const CERTIFICATIONS = [
  "GMP",
  "ISO 9001",
  "ISO 22716",
  "Halal",
  "Organic",
  "FDA (Thailand)",
];

const LEAD_TIMES = [
  "1-2 weeks",
  "2-4 weeks",
  "1-2 months",
  "2-3 months",
  "Flexible",
];

const COUNTRIES = ["Thailand", "Vietnam", "China", "Japan", "No preference"];

export default function MatchingPage() {
  const router = useRouter();
  const { session } = useSupabase();
  const { toast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product categories from backend
  const { data: productCategories = [], isLoading: isLoadingCategories } =
    useQuery<string[]>({
      queryKey: ["product-categories"],
      queryFn: async () => {
        const response = await fetch("/api/product-categories");
        if (!response.ok) {
          throw new Error("Failed to fetch product categories");
        }
        const body = await response.json();
        return body.data || [];
      },
    });

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    volume: "",
    certifications: [] as string[],
    leadTime: "",
    country: "",
    requirements: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (cert: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.certifications;
      if (checked) {
        return { ...prev, certifications: [...current, cert] };
      } else {
        return { ...prev, certifications: current.filter((c) => c !== cert) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // If user provided specific requirements, use AI search
      if (formData.requirements && formData.requirements.length > 5) {
        const prompt = `
          Find an OEM for:
          Category: ${formData.category}
          Volume: ${formData.volume} units
          Target Price: ${formData.minPrice}-${formData.maxPrice} THB
          Certifications: ${formData.certifications.join(", ")}
          Lead Time: ${formData.leadTime}
          Country: ${formData.country}
          
          Specific Requirements: ${formData.requirements}
        `;

        const response = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: prompt }),
        });

        if (!response.ok) {
          throw new Error("AI Search failed");
        }

        const data = await response.json();

        // Store results in session storage for the results page to pick up
        sessionStorage.setItem("searchMode", "ai");
        sessionStorage.setItem(
          "aiSearchResults",
          JSON.stringify(data.recommendations)
        );

        toast({
          title: "AI Analysis Complete",
          description:
            "We've found the best matches based on your requirements.",
        });
      } else {
        // Standard matching (no AI)
        sessionStorage.setItem("searchMode", "standard");

        // Store preferences for standard filtering
        const preferences = {
          productType: formData.category,
          priceRange: [
            Number(formData.minPrice) || 0,
            Number(formData.maxPrice) || 0,
          ],
          timeline: formData.leadTime === "Flexible" ? "standard" : "urgent",
          quickMatch: true,
        };
        sessionStorage.setItem("userPreferences", JSON.stringify(preferences));
      }

      // Redirect to results
      const params = new URLSearchParams();
      params.set("matching", "true");
      if (formData.category) params.set("category", formData.category);

      router.push(`${ROUTES.results}?${params.toString()}`);
    } catch (error) {
      console.error("Matching error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Falling back to standard search.",
        variant: "destructive",
      });

      // Fallback to standard search
      const params = new URLSearchParams();
      params.set("matching", "true");
      if (formData.category) params.set("category", formData.category);
      router.push(`${ROUTES.results}?${params.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto max-w-[1200px] pt-24 pb-20 px-4">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Visuals */}
          <div className="lg:col-span-4 hidden lg:block space-y-6">
            <div className="sticky top-28">
              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Why Match with YUMYUM?
                </h3>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">AI-Powered Matching</h4>
                      <p className="text-sm text-muted-foreground">
                        Our algorithm finds the perfect factory based on your
                        specific needs.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Verified Partners</h4>
                      <p className="text-sm text-muted-foreground">
                        All recommended OEMs are verified for quality and
                        reliability.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Fast Turnaround</h4>
                      <p className="text-sm text-muted-foreground">
                        Get matched and start chatting with suppliers in
                        minutes.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-6 bg-card rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-muted border-2 border-background"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    500+ Brands matched
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  &quot;YUMYUM helped us find a GMP-certified factory in 2 days.
                  Highly recommended!&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="lg:col-span-8">
            <Card className="p-6 md:p-8 shadow-lg border-0 ring-1 ring-black/5">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Find Your Perfect OEM Partner
                </h1>
                <p className="text-muted-foreground">
                  Tell us what you need, and we&apos;ll match you with verified
                  manufacturers.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Category */}
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-semibold">
                    1. What are you looking to produce?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => handleInputChange("category", val)}
                    required
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue
                        placeholder={
                          isLoadingCategories
                            ? "Loading categories..."
                            : "Select a product category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : productCategories.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          No categories available
                        </div>
                      ) : (
                        productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Price Range */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    2. What&apos;s your target price range (per unit)?
                  </Label>
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ฿
                      </span>
                      <Input
                        type="number"
                        placeholder="Min"
                        className="pl-8 h-12"
                        value={formData.minPrice}
                        onChange={(e) =>
                          handleInputChange("minPrice", e.target.value)
                        }
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ฿
                      </span>
                      <Input
                        type="number"
                        placeholder="Max"
                        className="pl-8 h-12"
                        value={formData.maxPrice}
                        onChange={(e) =>
                          handleInputChange("maxPrice", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Volume */}
                <div className="space-y-3">
                  <Label htmlFor="volume" className="text-base font-semibold">
                    3. How many units do you need? (MOQ){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="volume"
                    type="number"
                    placeholder="e.g. 1,000"
                    className="h-12"
                    required
                    value={formData.volume}
                    onChange={(e) =>
                      handleInputChange("volume", e.target.value)
                    }
                  />
                </div>

                {/* 4. Certifications */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    4. What certifications do you need?
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {CERTIFICATIONS.map((cert) => (
                      <label
                        key={cert}
                        className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          id={cert}
                          checked={formData.certifications.includes(cert)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(cert, checked as boolean)
                          }
                        />
                        <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {cert}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* 5. Lead Time */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="leadTime"
                      className="text-base font-semibold"
                    >
                      5. Preferred Lead Time
                    </Label>
                    <Select
                      value={formData.leadTime}
                      onValueChange={(val) =>
                        handleInputChange("leadTime", val)
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_TIMES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 6. Country */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="country"
                      className="text-base font-semibold"
                    >
                      6. Preferred Country (Optional)
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(val) => handleInputChange("country", val)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 7. Additional Requirements */}
                <div className="space-y-3">
                  <Label
                    htmlFor="requirements"
                    className="text-base font-semibold"
                  >
                    7. Additional Requirements
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="e.g. Need eco-friendly packaging, R&D support, formula customization..."
                    className="min-h-[120px] resize-none"
                    value={formData.requirements}
                    onChange={(e) =>
                      handleInputChange("requirements", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Our AI will analyze this to find better matches for your
                    specific needs.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="xl"
                    className="w-full text-lg font-bold h-14"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span> Finding
                        Matches...
                      </>
                    ) : (
                      <>
                        Find My OEM Match{" "}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Modal for Guests */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Login Required
            </DialogTitle>
            <DialogDescription className="text-center">
              Please login or create an account to see your personalized OEM
              matches.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button size="lg" className="w-full" asChild>
              <Link href={`/login?next=/matching`}>Login</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href="/onboarding/buyer">Sign Up</Link>
            </Button>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
