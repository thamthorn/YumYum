"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Package,
  Truck,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

type FormState = {
  productBrief: string;
  quantity: string;
  timeline: string;
  shipping: string;
  payment: string;
  addEscrow: boolean;
  addAudit: boolean;
};

function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // Resolve if present; value is not used in this prototype
  searchParams.get("oem");
  const isPrototype = pathname.includes("/request/prototype");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>({
    productBrief: "",
    quantity: "",
    timeline: "",
    shipping: "",
    payment: "",
    addEscrow: false,
    addAudit: false,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      toast.success("Request submitted successfully!", {
        description: "The OEM will respond within 24-48 hours.",
      });
      setTimeout(() => router.push("/dashboard/buyer"), 1200);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateFormData = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-3xl">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <Badge variant="secondary" className="mb-4">
                {isPrototype ? "Prototype Request" : "Quote Request"} - Step{" "}
                {step} of {totalSteps}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">
                {isPrototype ? "Request a Prototype" : "Request a Quote"}
              </h1>
              <p className="text-muted-foreground">
                {isPrototype
                  ? "Small-run samples to test your product before mass production"
                  : "Get a detailed quote for your manufacturing needs"}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Form */}
            <Card className="p-8 animate-scale-in">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Product Brief</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brief">Describe Your Product</Label>
                    <Textarea
                      id="brief"
                      placeholder={
                        isPrototype
                          ? "Describe the prototype you want to create. Include materials, design details, and any specific requirements..."
                          : "Describe your product in detail. Include materials, specifications, design elements, and any special requirements..."
                      }
                      rows={8}
                      value={formData.productBrief}
                      onChange={(e) =>
                        updateFormData("productBrief", e.target.value)
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      The more detail you provide, the more accurate the quote
                      will be.
                    </p>
                  </div>

                  {isPrototype && (
                    <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                      <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-info shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-semibold text-info mb-1">
                            Prototype Tip
                          </div>
                          <p className="text-muted-foreground">
                            Start with small quantities (5-50 units) to test
                            quality before committing to larger orders. Most
                            OEMs can deliver prototypes in 1-3 weeks.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Files & References
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Design files, tech packs, reference images, or
                        specifications
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF, PNG, JPG, AI, PSD up to 20MB each
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-2">
                        Helpful files to include:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Technical specifications or tech packs</li>
                        <li>Design mockups or reference images</li>
                        <li>Material samples or swatches</li>
                        <li>Brand guidelines or logo files</li>
                        <li>Packaging requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Quantity & Timeline
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      {isPrototype ? "Prototype Quantity" : "Order Quantity"}
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder={isPrototype ? "e.g., 10" : "e.g., 1000"}
                      value={formData.quantity}
                      onChange={(e) =>
                        updateFormData("quantity", e.target.value)
                      }
                    />
                    {isPrototype && (
                      <p className="text-sm text-muted-foreground">
                        Typical prototype runs are 5-50 units
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Deadline / Timeline</Label>
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
                        <SelectItem value="fast">Fast (2-4 weeks)</SelectItem>
                        <SelectItem value="standard">
                          Standard (1-2 months)
                        </SelectItem>
                        <SelectItem value="flexible">
                          Flexible (3+ months)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isPrototype && (
                    <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-semibold text-success">
                          Prototype Fast-Track
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Many OEMs prioritize prototype requests to help you move
                        faster
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Shipping Details</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping">Shipping Method</Label>
                    <Select
                      value={formData.shipping}
                      onValueChange={(value) =>
                        updateFormData("shipping", value)
                      }
                    >
                      <SelectTrigger id="shipping">
                        <SelectValue placeholder="Select shipping method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="air-express">
                          Air Express (3-5 days)
                        </SelectItem>
                        <SelectItem value="air-standard">
                          Air Standard (7-14 days)
                        </SelectItem>
                        <SelectItem value="sea">
                          Sea Freight (30-45 days)
                        </SelectItem>
                        <SelectItem value="local">Local Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete shipping address..."
                      rows={4}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Need help with shipping?</p>
                    <p>
                      Many OEMs can assist with customs, duties, and logistics.
                      Mention any specific requirements in your message.
                    </p>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Payment & Add-Ons
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment">Preferred Payment Method</Label>
                    <Select
                      value={formData.payment}
                      onValueChange={(value) =>
                        updateFormData("payment", value)
                      }
                    >
                      <SelectTrigger id="payment">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                        <SelectItem value="escrow">Escrow Service</SelectItem>
                        <SelectItem value="other">
                          Other (specify in notes)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Optional Services</Label>

                    <Card className="p-4 border-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="escrow"
                          checked={formData.addEscrow}
                          onCheckedChange={(checked) =>
                            updateFormData("addEscrow", checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="escrow"
                            className="cursor-pointer font-semibold"
                          >
                            Escrow Protection
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Secure payment held until delivery confirmation.
                            Recommended for first-time orders.
                          </p>
                          <Badge variant="scale" className="mt-2">
                            Partner Plan Feature
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="audit"
                          checked={formData.addAudit}
                          onCheckedChange={(checked) =>
                            updateFormData("addAudit", checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="audit"
                            className="cursor-pointer font-semibold"
                          >
                            Quality Audit
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Independent inspection before shipment. Includes
                            detailed quality report.
                          </p>
                          <Badge variant="scale" className="mt-2">
                            Partner Plan Feature
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements or questions for the OEM..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
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
                  disabled={step === 1 && !formData.productBrief}
                >
                  {step === totalSteps ? "Submit Request" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedClient>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RequestForm />
    </Suspense>
  );
}
