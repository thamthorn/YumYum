"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase/session-context";

export default function OEMRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Company Information
    company_name_en: "",
    company_name_th: "",
    address: "",
    country: "",
    website: "",
    // Contact Information
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    line_id: "",
    wechat_id: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.company_name_en || !formData.company_name_th) {
      toast({
        variant: "destructive",
        description: "Please provide both English and Thai company names.",
      });
      return;
    }

    if (!formData.contact_email || !formData.contact_phone) {
      toast({
        variant: "destructive",
        description: "Please provide contact email and phone number.",
      });
      return;
    }

    if (!formData.country) {
      toast({
        variant: "destructive",
        description: "Please select a country.",
      });
      return;
    }

    if (!session) {
      toast({
        variant: "destructive",
        description: "Please login first to register your company.",
      });
      router.push(`/login?next=/onboarding/oem/register`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/oem/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register company");
      }

      toast({
        description: "Company registered successfully! Redirecting to setup...",
      });

      // Redirect to setup wizard
      setTimeout(() => {
        router.push("/onboarding/oem/setup/products");
      }, 1000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        description:
          error.message || "Failed to register company. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    "Thailand",
    "Vietnam",
    "China",
    "Japan",
    "South Korea",
    "Taiwan",
    "Malaysia",
    "Indonesia",
    "India",
    "Singapore",
    "Philippines",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Register Your Company</h1>
              <p className="text-muted-foreground">
                Provide your company information to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">
                  Company Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name_en">
                      Company Name (English){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name_en"
                      name="company_name_en"
                      value={formData.company_name_en}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC Manufacturing Co., Ltd."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name_th">
                      Company Name (Thai){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name_th"
                      name="company_name_th"
                      value={formData.company_name_th}
                      onChange={handleInputChange}
                      placeholder="e.g., บริษัท เอบีซี แมนูแฟคเจอริ่ง จำกัด"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Company address"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">
                  Contact Information
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    placeholder="Full name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">
                      Contact Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="contact@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">
                      Contact Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="+66 123 456 789"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="line_id">Line ID (Optional)</Label>
                    <Input
                      id="line_id"
                      name="line_id"
                      value={formData.line_id}
                      onChange={handleInputChange}
                      placeholder="@line_id"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wechat_id">WeChat ID (Optional)</Label>
                    <Input
                      id="wechat_id"
                      name="wechat_id"
                      value={formData.wechat_id}
                      onChange={handleInputChange}
                      placeholder="wechat_id"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button type="button" variant="ghost" asChild>
                  <Link href="/dashboard/oem">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Continue to Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
