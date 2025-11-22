"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import MediaManager from "@/components/dashboard/oem/MediaManager";
import Image from "next/image";

interface Service {
  id: string;
  name: string;
}

interface OEMProfileData {
  organization_id: string;
  company_name_en: string;
  company_name_th: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  contact_person: string;
  website: string;
  line_id: string;
  wechat_id: string;
  location: string;
  country_code: string;
  lead_time_days: number | null;
  moq_min: number | null;
  moq_max: number | null;
  languages: string;
  selected_service_ids: string[];
  logo_url: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentTier, setCurrentTier] = useState<
    "FREE" | "INSIGHTS" | "VERIFIED_PARTNER"
  >("FREE");
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [formData, setFormData] = useState<OEMProfileData>({
    organization_id: "",
    company_name_en: "",
    company_name_th: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    contact_person: "",
    website: "",
    line_id: "",
    wechat_id: "",
    location: "",
    country_code: "TH",
    lead_time_days: null,
    moq_min: null,
    moq_max: null,
    languages: "",
    selected_service_ids: [],
    logo_url: null,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get Organization
      const orgResult = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)
        .eq("type", "oem")
        .single();

      const org = orgResult.data as
        | Database["public"]["Tables"]["organizations"]["Row"]
        | null;

      if (!org) {
        router.push("/onboarding/oem/setup/products");
        return;
      }

      // Get Profile
      const profileResult = await supabase
        .from("oem_profiles")
        .select("*")
        .eq("organization_id", org.id)
        .single();

      const profile = profileResult.data as
        | Database["public"]["Tables"]["oem_profiles"]["Row"]
        | null;

      // Get Capabilities
      const capabilitiesResult = await supabase
        .from("oem_capabilities")
        .select("*")
        .eq("oem_org_id", org.id)
        .single();

      const capabilities = capabilitiesResult.data as
        | Database["public"]["Tables"]["oem_capabilities"]["Row"]
        | null;

      // Get Available Services
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name")
        .order("name");

      if (servicesData) {
        setAvailableServices(servicesData);
      }

      // Get Selected Services
      const { data: oemServicesData } = await (supabase as any)
        .from("oem_services")
        .select("service_id")
        .eq("oem_org_id", org.id);

      const selectedServiceIds =
        (oemServicesData as any[])?.map((s) => s.service_id) || [];

      // Get Tier (RPC)
      const tierResult = await (supabase as any).rpc("get_oem_tier", {
        org_id: org.id,
      } as any);
      const tier = (tierResult as any)?.data;
      setCurrentTier((tier as any) || "FREE");

      if (profile) {
        setFormData({
          organization_id: org.id,
          company_name_en: org.display_name || "",
          company_name_th: profile.company_name_th || "",
          description: profile.short_description || "",
          contact_email: profile.contact_email || "",
          contact_phone: profile.contact_phone || "",
          contact_person: profile.contact_person || "",
          website: org.website || "",
          line_id: profile.line_id || "",
          wechat_id: profile.wechat_id || "",
          location: org.location || "",
          country_code: org.country_code || "TH",
          lead_time_days: profile.lead_time_days || null,
          moq_min: profile.moq_min || null,
          moq_max: profile.moq_max || null,
          languages:
            (capabilities?.languages as string[] | undefined)?.join(", ") || "",
          selected_service_ids: selectedServiceIds,
          logo_url: org.logo_url || null,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo file size must be less than 5MB");
        return;
      }
      setLogoFile(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${formData.organization_id}/logo-${Date.now()}.${fileExt}`;

      console.log("Uploading logo to:", fileName);

      const { error: uploadError } = await supabase.storage
        .from("oem-media")
        .upload(fileName, logoFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("oem-media").getPublicUrl(fileName);

      console.log("Logo uploaded successfully. Public URL:", publicUrl);

      // Save logo_url to database immediately
      const { error: updateError } = await (supabase as any)
        .from("organizations")
        .update({ logo_url: publicUrl })
        .eq("id", formData.organization_id);

      if (updateError) {
        console.error("Error saving logo to database:", updateError);
        throw updateError;
      }

      console.log("Logo saved to database successfully");

      setFormData((prev) => {
        const updated = { ...prev, logo_url: publicUrl };
        console.log("Updated formData with logo_url:", updated.logo_url);
        return updated;
      });
      setLogoFile(null);
      toast.success("Logo uploaded and saved successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      
      const { error } = await (supabase as any)
        .from("organizations")
        .update({ logo_url: null })
        .eq("id", formData.organization_id);

      if (error) {
        console.error("Error removing logo from database:", error);
        toast.error("Failed to remove logo");
        return;
      }

      setFormData((prev) => ({ ...prev, logo_url: null }));
      setLogoFile(null);
      toast.success("Logo removed successfully");
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove logo");
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const current = prev.selected_service_ids;
      if (current.includes(serviceId)) {
        return {
          ...prev,
          selected_service_ids: current.filter((id) => id !== serviceId),
        };
      } else {
        return {
          ...prev,
          selected_service_ids: [...current, serviceId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();

      console.log("Saving profile with logo_url:", formData.logo_url);

      // Update Organization table
      const { error: orgError } = await (supabase as any)
        .from("organizations")
        .update({
          display_name: formData.company_name_en,
          website: formData.website,
          location: formData.location,
          country_code: formData.country_code,
          logo_url: formData.logo_url,
        })
        .eq("id", formData.organization_id);

      if (orgError) {
        console.error("Organization update error:", orgError);
        throw orgError;
      }

      // Update OEM Profile table
      const { error: profileError } = await (supabase as any)
        .from("oem_profiles")
        .update({
          company_name_th: formData.company_name_th,
          short_description: formData.description,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          contact_person: formData.contact_person,
          line_id: formData.line_id,
          wechat_id: formData.wechat_id,
          lead_time_days: formData.lead_time_days,
          moq_min: formData.moq_min,
          moq_max: formData.moq_max,
        })
        .eq("organization_id", formData.organization_id);

      if (profileError) throw profileError;

      // Update Capabilities (Languages)
      const languagesArray = formData.languages
        .split(",")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      const { error: capError } = await (supabase as any)
        .from("oem_capabilities")
        .upsert(
          {
            oem_org_id: formData.organization_id,
            languages: languagesArray,
          },
          { onConflict: "oem_org_id" }
        );

      if (capError) throw capError;

      // Update OEM Services
      // 1. Delete existing services for this OEM
      const { error: deleteError } = await (supabase as any)
        .from("oem_services")
        .delete()
        .eq("oem_org_id", formData.organization_id);

      if (deleteError) throw deleteError;

      // 2. Insert new services
      if (formData.selected_service_ids.length > 0) {
        const servicesToInsert = formData.selected_service_ids.map((id) => ({
          oem_org_id: formData.organization_id,
          service_id: id,
        }));

        const { error: insertError } = await (supabase as any)
          .from("oem_services")
          .insert(servicesToInsert);

        if (insertError) throw insertError;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-3xl pt-24 pb-12">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/oem")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Company Profile</h1>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General Info</TabsTrigger>
              <TabsTrigger value="media">Media Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                      Company Information
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company_name_en">
                          Company Name (English) *
                        </Label>
                        <Input
                          id="company_name_en"
                          name="company_name_en"
                          value={formData.company_name_en}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_name_th">
                          Company Name (Thai)
                        </Label>
                        <Input
                          id="company_name_th"
                          name="company_name_th"
                          value={formData.company_name_th}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Short Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Briefly describe your company..."
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location">Address / Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Company Logo */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Company Logo</h2>
                    <p className="text-sm text-muted-foreground">
                      Upload your company logo. This will be displayed in the OEM
                      directory listing.
                    </p>
                    <div className="flex items-start gap-6">
                      {/* Logo Preview */}
                      <div className="flex-shrink-0">
                        {formData.logo_url || logoFile ? (
                          <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                            <Image
                              src={
                                logoFile
                                  ? URL.createObjectURL(logoFile)
                                  : formData.logo_url!
                              }
                              alt="Company Logo"
                              fill
                              className="object-contain p-2"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={handleLogoRemove}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="logo">Select Logo Image</Label>
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            disabled={uploadingLogo}
                          />
                          <p className="text-xs text-muted-foreground">
                            Recommended: Square image, max 5MB. PNG or JPG format.
                          </p>
                        </div>
                        {logoFile && (
                          <Button
                            type="button"
                            onClick={handleLogoUpload}
                            disabled={uploadingLogo}
                            size="sm"
                          >
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Click to Upload Logo
                              </>
                            )}
                          </Button>
                        )}
                        {formData.logo_url && !logoFile && (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Logo saved successfully
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Operational Details */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                      Operational Details
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                        <Input
                          id="lead_time_days"
                          name="lead_time_days"
                          type="number"
                          value={formData.lead_time_days || ""}
                          onChange={handleChange}
                          placeholder="e.g. 30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="moq_min">Min MOQ</Label>
                        <Input
                          id="moq_min"
                          name="moq_min"
                          type="number"
                          value={formData.moq_min || ""}
                          onChange={handleChange}
                          placeholder="e.g. 1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="moq_max">Max MOQ</Label>
                        <Input
                          id="moq_max"
                          name="moq_max"
                          type="number"
                          value={formData.moq_max || ""}
                          onChange={handleChange}
                          placeholder="e.g. 50000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="languages">
                        Supported Languages (comma separated)
                      </Label>
                      <Input
                        id="languages"
                        name="languages"
                        value={formData.languages}
                        onChange={handleChange}
                        placeholder="e.g. Thai, English, Chinese"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Key Services */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Key Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableServices
                        .slice(
                          0,
                          servicesExpanded ? availableServices.length : 4
                        )
                        .map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={formData.selected_service_ids.includes(
                                service.id
                              )}
                              onCheckedChange={() =>
                                handleServiceToggle(service.id)
                              }
                            />
                            <Label
                              htmlFor={`service-${service.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {service.name}
                            </Label>
                          </div>
                        ))}
                    </div>
                    {availableServices.length > 4 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setServicesExpanded(!servicesExpanded)}
                        className="text-primary hover:text-primary/80"
                      >
                        {servicesExpanded ? "Show less" : `Show more (${availableServices.length - 4} more)`}
                      </Button>
                    )}
                    {availableServices.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No services available to select.
                      </p>
                    )}
                  </div>

                  <hr className="border-gray-200" />

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Contact Details</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input
                          id="contact_person"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email *</Label>
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Phone Number</Label>
                        <Input
                          id="contact_phone"
                          name="contact_phone"
                          value={formData.contact_phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="line_id">Line ID</Label>
                        <Input
                          id="line_id"
                          name="line_id"
                          value={formData.line_id}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wechat_id">WeChat ID</Label>
                        <Input
                          id="wechat_id"
                          name="wechat_id"
                          value={formData.wechat_id}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/oem")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card className="p-6">
                <MediaManager
                  oemOrgId={formData.organization_id}
                  tier={currentTier}
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedClient>
  );
}
