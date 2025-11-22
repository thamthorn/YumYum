"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function OEMOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  async function checkProfile() {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/onboarding/oem");
        return;
      }

      // Check if user has an OEM organization
      const { data: org } = await (supabase as any)
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .eq("type", "oem")
        .maybeSingle();

      if (org) {
        // Check if OEM profile exists
        const { data: profile } = await (supabase as any)
          .from("oem_profiles")
          .select("organization_id")
          .eq("organization_id", org?.id)
          .maybeSingle();

        if (profile) {
          // Profile exists, go to setup
          setHasProfile(true);
          router.replace("/onboarding/oem/setup/products");
        } else {
          // Organization exists but no profile, go to register
          setHasProfile(false);
        }
      } else {
        // No organization, go to register
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-2xl pt-24 pb-12 px-4">
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-2xl pt-24 pb-12 px-4">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Register Your Company</h1>
            <p className="text-muted-foreground mb-6">
              Please register your company information first before setting up
              your profile.
            </p>
            <Button asChild>
              <Link href="/onboarding/oem/register">Register Company</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
