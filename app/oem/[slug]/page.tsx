import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import ReviewsList from "@/components/ReviewsList";
import CreateReviewDialog from "@/components/CreateReviewDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Factory,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Globe,
  Rocket,
  FileText,
  Package,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  COPY,
  getScaleBadgeVariant,
  getVerifiedBadgeVariant,
  OEMS,
} from "@/data/MockData";
import type { Database } from "@/types/database";

type VerificationTier = Database["public"]["Enums"]["verification_tier"];
type ScaleType = Database["public"]["Enums"]["scale_type"];

const verificationLabel: Record<VerificationTier, string> = {
  trusted_partner: "Trusted Partner",
  certified: "Certified",
  verified: "Verified",
  none: "None",
};

const scaleLabel: Record<ScaleType, "Small" | "Medium" | "Large"> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const languageDisplay = (code: string) => {
  try {
    const formatter = new Intl.DisplayNames(["en"], { type: "language" });
    return formatter.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default async function OEMProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const profileSelect = `
    organization_id,
    scale,
    moq_min,
    moq_max,
    lead_time_days,
    response_time_hours,
    prototype_support,
    short_description,
    cross_border,
    rating,
    total_reviews,
    organizations:organizations!inner(
      id,
      slug,
      display_name,
      industry,
      location,
      description,
      website,
      headcount_range,
      established_year
    ),
    oem_services (
      services (
        name
      )
    ),
    oem_certifications (
      verification_tier,
      certifications (
        name
      )
    ),
    oem_languages (
      language_code,
      proficiency
    ),
    oem_previous_products (
      id,
      title,
      image_url,
      tags,
      note
    )
  `;

  type ProfileWithRelations =
    Database["public"]["Tables"]["oem_profiles"]["Row"] & {
      organizations: Database["public"]["Tables"]["organizations"]["Row"];
      oem_services: Array<{
        services: { name: string | null } | null;
      }> | null;
      oem_certifications: Array<{
        verification_tier:
          | Database["public"]["Enums"]["verification_tier"]
          | null;
        certifications: { name: string | null } | null;
      }> | null;
      oem_languages: Array<
        Pick<
          Database["public"]["Tables"]["oem_languages"]["Row"],
          "language_code" | "proficiency"
        >
      > | null;
      oem_previous_products: Array<
        Pick<
          Database["public"]["Tables"]["oem_previous_products"]["Row"],
          "id" | "title" | "image_url" | "tags" | "note"
        >
      > | null;
    };

  type OrganizationSlugLookup = Pick<
    Database["public"]["Tables"]["organizations"]["Row"],
    "id"
  >;

  const fetchProfileByOrganizationId = async (
    organizationId: Database["public"]["Tables"]["oem_profiles"]["Row"]["organization_id"]
  ) => {
    const { data, error } = await supabase
      .from("oem_profiles")
      .select(profileSelect)
      .filter("organization_id", "eq", organizationId)
      .maybeSingle();

    if (error || !data) {
      return { data: null, error };
    }
    return { data: data as unknown as ProfileWithRelations, error: null };
  };

  const fetchProfileBySlug = async (slugValue: string) => {
    const slugFilter: Database["public"]["Tables"]["organizations"]["Row"]["slug"] =
      slugValue;
    const { data: organizationResult, error: slugLookupError } = await supabase
      .from("organizations")
      .select("id")
      .filter("slug", "eq", slugFilter)
      .maybeSingle();

    if (slugLookupError || !organizationResult) {
      return { data: null, error: slugLookupError };
    }

    const organization =
      organizationResult as unknown as OrganizationSlugLookup;

    return fetchProfileByOrganizationId(organization.id);
  };

  const candidates = new Set<string>([slug]);

  if (/^\d+$/.test(slug)) {
    const match = OEMS.find((o) => o.id === Number(slug));
    if (match) {
      candidates.add(slugify(match.name));
    }
  }

  let profile: ProfileWithRelations | null = null;
  for (const candidate of candidates) {
    const result = await fetchProfileBySlug(candidate);
    if (result.data) {
      profile = result.data;
      break;
    }
  }

  if (!profile) {
    // Attempt to treat slug as organization id (uuid)
    const orgIdFilter: Database["public"]["Tables"]["oem_profiles"]["Row"]["organization_id"] =
      slug;
    const { data: byId } = await fetchProfileByOrganizationId(orgIdFilter);

    profile = byId ?? null;
  }

  if (!profile || !profile.organizations) {
    notFound();
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const organization = profile.organizations;
  const services =
    profile.oem_services
      ?.map((entry) => entry.services?.name ?? "")
      .filter((name): name is string => Boolean(name)) ?? [];
  const certifications =
    profile.oem_certifications
      ?.map((entry) => entry.certifications?.name ?? "")
      .filter((name): name is string => Boolean(name)) ?? [];
  const highestTier: VerificationTier =
    profile.oem_certifications?.reduce<VerificationTier>((acc, entry) => {
      const value = entry.verification_tier ?? "none";
      const order: VerificationTier[] = [
        "trusted_partner",
        "certified",
        "verified",
        "none",
      ];
      return order.indexOf(value) < order.indexOf(acc) ? value : acc;
    }, "none") ?? "none";

  const previousProducts = profile.oem_previous_products ?? [];
  const languages =
    profile.oem_languages?.map((entry) =>
      languageDisplay(entry.language_code)
    ) ?? [];
  const scaleKey = (profile.scale ?? "medium") as ScaleType;
  const readableScale = scaleLabel[scaleKey];

  const requestQuoteHref = `/request/quote?oem=${organization.id}`;
  const requestPrototypeHref = `/request/prototype?oem=${organization.id}`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6">
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Factory className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">
                      {organization.display_name}
                    </h1>
                    {highestTier !== "none" && (
                      <Badge
                        variant={getVerifiedBadgeVariant(
                          verificationLabel[highestTier]
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {verificationLabel[highestTier]}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <Badge variant={getScaleBadgeVariant(readableScale)}>
                      <Factory className="h-3 w-3" /> {readableScale}
                    </Badge>
                    {organization.location && (
                      <Badge
                        variant="scale"
                        className="flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3" /> {organization.location}
                      </Badge>
                    )}
                    {organization.established_year && (
                      <Badge
                        variant="scale"
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" /> Est.{" "}
                        {organization.established_year}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {typeof profile.rating === "number" && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold text-foreground">
                          {profile.rating.toFixed(1)}
                        </span>
                        <span>({profile.total_reviews ?? 0} reviews)</span>
                      </div>
                    )}
                    {profile.response_time_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{profile.response_time_hours}h avg response</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg" asChild>
                  <Link href={requestQuoteHref}>{COPY.ctas.requestQuote}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={requestPrototypeHref}>
                    <Rocket className="mr-2 h-4 w-4" />
                    {COPY.ctas.requestPrototype}
                  </Link>
                </Button>
                {session && (
                  <Button variant="outline" asChild>
                    <Link href={`/messages/new?oem=${organization.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {COPY.ctas.directMessage}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">
                MOQ Range
              </div>
              <div className="text-lg font-semibold">
                {profile.moq_min?.toLocaleString() ?? 0}
                {profile.moq_max ? `–${profile.moq_max.toLocaleString()}` : "+"}
              </div>
            </Card>
            {profile.lead_time_days && (
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Lead Time
                </div>
                <div className="text-lg font-semibold">
                  {profile.lead_time_days} days
                </div>
              </Card>
            )}
            {organization.headcount_range && (
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Team Size
                </div>
                <div className="text-lg font-semibold">
                  {organization.headcount_range}
                </div>
              </Card>
            )}
            {languages.length > 0 && (
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Languages
                </div>
                <div className="text-sm font-semibold">
                  {languages.join(", ")}
                </div>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="previous-products">
                Previous Products
              </TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.short_description ??
                    organization.description ??
                    "Details coming soon."}
                </p>
              </Card>

              {organization.industry && (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Industries Served
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{organization.industry}</Badge>
                  </div>
                </Card>
              )}

              {services.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Key Services</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div key={service} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                        <div className="font-semibold">{service}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Production Capabilities
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Prototype Support</span>
                    <span className="font-semibold text-foreground">
                      {profile.prototype_support ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Cross-border Friendly</span>
                    <span className="font-semibold text-foreground">
                      {profile.cross_border ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="previous-products" className="space-y-4">
              {previousProducts.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                  No project case studies yet.
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {previousProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      {product.image_url && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold">{product.title}</h3>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {product.note && (
                          <p className="text-sm text-muted-foreground">
                            {product.note}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4">
              {certifications.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                  No certifications added yet.
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {certifications.map((cert) => (
                    <Card key={cert} className="p-6 flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{cert}</div>
                        <div className="text-sm text-muted-foreground">
                          Verified {verificationLabel[highestTier]}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="flex justify-end">
                <CreateReviewDialog
                  oemOrgId={organization.id}
                  oemName={organization.display_name}
                >
                  <Button>Write a Review</Button>
                </CreateReviewDialog>
              </div>
              <ReviewsList
                oemOrgId={organization.id}
                initialRating={profile.rating || 0}
                initialTotalReviews={profile.total_reviews || 0}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
