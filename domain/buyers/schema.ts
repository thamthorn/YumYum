import { z } from "zod";

export const onboardingInputSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  productType: z.string().min(1, "Product description is required"),
  moqRange: z
    .array(z.number().int().nonnegative())
    .length(2, "MOQ range must contain min and max values")
    .transform(([min, max]) => ({
      min,
      max,
    })),
  timeline: z.string().min(1, "Production timeline is required"),
  location: z.string().min(1, "Location preference is required"),
  certifications: z.array(z.string()).default([]),
  prototypeNeeded: z.boolean(),
  crossBorder: z.boolean(),
  quickMatch: z.boolean().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema> & {
  moqRange: { min: number; max: number };
};

export interface BuyerOnboardingResult {
  buyerOrgId: string;
  matches: Array<{
    oemOrgId: string;
    name: string;
    slug: string | null;
    industry: string | null;
    location: string | null;
    scale: "small" | "medium" | "large" | null;
    moqMin: number | null;
    moqMax: number | null;
    rating: number | null;
    totalReviews: number | null;
  }>;
}
