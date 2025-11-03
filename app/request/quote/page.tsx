"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
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
  CheckCircle2,
} from "lucide-react";
import { useSupabase } from "@/lib/supabase/session-context";
import { ROUTES } from "@/data/MockData";

type FormState = {
  productBrief: string;
  quantity: string;
  timeline: string;
  shipping: string;
  payment: string;
  addEscrow: boolean;
  addAudit: boolean;
};

type OemInfo = {
  id: string;
  name: string;
  slug: string | null;
};

type UploadedFile = {
  file: File;
  preview: string;
};

function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const oemParam = searchParams.get("oem");
  const isPrototype = pathname.includes("/request/prototype");
  const { supabase } = useSupabase();

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [oem, setOem] = useState<OemInfo | null>(null);
  const [isLoadingOem, setIsLoadingOem] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    const loadOem = async () => {
      if (!oemParam) {
        setIsLoadingOem(false);
        return;
      }

      setIsLoadingOem(true);

      const trySlug = await supabase
        .from("organizations")
        .select("id, display_name, slug")
        .eq("type", "oem")
        .eq("slug", oemParam)
        .maybeSingle();

      if (trySlug.data) {
        const orgData = trySlug.data as {
          id: string;
          display_name: string;
          slug: string | null;
        };
        setOem({
          id: orgData.id,
          name: orgData.display_name,
          slug: orgData.slug,
        });
        setIsLoadingOem(false);
        return;
      }

      if (trySlug.error && trySlug.error.code !== "PGRST116") {
        toast.error("Unable to load OEM details.");
        setIsLoadingOem(false);
        return;
      }

      const tryId = await supabase
        .from("organizations")
        .select("id, display_name, slug")
        .eq("type", "oem")
        .eq("id", oemParam)
        .maybeSingle();

      if (tryId.data) {
        const orgData = tryId.data as {
          id: string;
          display_name: string;
          slug: string | null;
        };
        setOem({
          id: orgData.id,
          name: orgData.display_name,
          slug: orgData.slug,
        });
      } else if (tryId.error && tryId.error.code !== "PGRST116") {
        toast.error("Unable to load OEM details.");
      }

      setIsLoadingOem(false);
    };

    loadOem();
  }, [oemParam, supabase]);

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [uploadedFiles]);

  const updateFormData = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Validate file type (images and PDFs)
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `File ${file.name} is not a supported format. Use JPG, PNG, WEBP, or PDF.`
        );
        continue;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    toast.success("File removed");
  };

  const uploadFilesToStorage = async (requestId: string, userId: string) => {
    if (uploadedFiles.length === 0) return;

    setIsUploadingFiles(true);

    try {
      for (const { file } of uploadedFiles) {
        // Generate unique file path
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${requestId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("request-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Save file metadata to database
        const { error: dbError } = await supabase.from("request_files").insert({
          request_id: requestId,
          bucket: "request-files",
          path: filePath,
          mime_type: file.type,
          size_bytes: file.size,
          uploaded_by: userId,
        } as never);

        if (dbError) {
          console.error("Database error:", dbError);
          toast.error(`Failed to save metadata for ${file.name}`);
        }
      }

      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload some files");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.productBrief.trim().length > 0;
    }
    if (step === 3) {
      return formData.quantity.trim().length > 0;
    }
    if (step === 4) {
      return formData.timeline.trim().length > 0;
    }
    if (step === 5) {
      return (
        formData.shipping.trim().length > 0 &&
        formData.payment.trim().length > 0
      );
    }
    return true;
  };

  const submitRequest = async () => {
    if (!oem) {
      toast.error("Select a valid OEM before submitting.");
      return;
    }

    const quantityValue = parseInt(formData.quantity, 10);
    if (Number.isNaN(quantityValue) || quantityValue <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oemOrgId: oem.id,
          type: isPrototype ? "prototype" : "quote",
          title: `${isPrototype ? "Prototype" : "Quote"} Request - ${oem.name}`,
          productBrief: formData.productBrief,
          quantityMin: quantityValue,
          unit: "units",
          timeline: formData.timeline,
          shippingTerms: formData.shipping,
          paymentTerms: formData.payment,
          addEscrow: formData.addEscrow,
          addAudit: formData.addAudit,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Unable to submit request");
      }

      const result = await response.json();
      const requestId = result.data?.id;

      // Upload files if any
      if (requestId && uploadedFiles.length > 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await uploadFilesToStorage(requestId, user.id);
        }
      }

      toast.success("Request submitted successfully!", {
        description: "The OEM will respond within 24-48 hours.",
      });
      router.push(ROUTES.buyerDashboard);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit request."
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
      return;
    }

    if (isSubmitting) return;
    await submitRequest();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isContinueDisabled = isSubmitting || !isStepValid();

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-3xl">
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
              {isLoadingOem ? (
                <p className="text-sm text-muted-foreground mt-2">
                  Loading OEM details...
                </p>
              ) : oem ? (
                <p className="text-sm text-muted-foreground mt-2">
                  Requesting from{" "}
                  <span className="font-semibold">{oem.name}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  OEM information was not found. Please return to{" "}
                  <Link href={ROUTES.oems} className="underline">
                    the OEM list
                  </Link>{" "}
                  and try again.
                </p>
              )}
            </div>

            <div className="mb-8">
              <Progress value={progress} className="h-2" />
            </div>

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
                          ? "Describe the prototype you want to create..."
                          : "Describe your product in detail..."
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
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium mb-1">
                        Upload reference files (optional)
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Design files, tech packs, reference images, or
                        specifications
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WEBP, or PDF (max 10MB per file)
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        aria-label="Upload files"
                      />
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Uploaded Files ({uploadedFiles.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {uploadedFiles.map((uploadedFile, index) => (
                            <div
                              key={index}
                              className="relative border rounded-lg p-2 group"
                            >
                              {uploadedFile.file.type.startsWith("image/") ? (
                                <Image
                                  src={uploadedFile.preview}
                                  alt={uploadedFile.file.name}
                                  width={200}
                                  height={96}
                                  className="w-full h-24 object-cover rounded"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-muted rounded">
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <p className="text-xs mt-1 truncate">
                                {uploadedFile.file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadedFile.file.size / 1024).toFixed(0)} KB
                              </p>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove file"
                                title="Remove file"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Quantity</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Estimated Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g. 1000"
                      value={formData.quantity}
                      onChange={(e) =>
                        updateFormData("quantity", e.target.value)
                      }
                      min={1}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the total units you expect for this order.
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Timeline</h2>
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
                  disabled={
                    isContinueDisabled ||
                    isLoadingOem ||
                    !oem ||
                    isUploadingFiles
                  }
                >
                  {isUploadingFiles
                    ? "Uploading files..."
                    : isSubmitting
                      ? "Submitting..."
                      : step === totalSteps
                        ? "Submit Request"
                        : "Continue"}
                  {!isSubmitting && !isUploadingFiles && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedClient>
  );
}

export default function RequestQuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RequestForm />
    </Suspense>
  );
}
