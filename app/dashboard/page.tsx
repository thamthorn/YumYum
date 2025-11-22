"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    checkUserTypeAndRedirect();
  }, []);

  async function checkUserTypeAndRedirect() {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/dashboard");
        return;
      }

      // Check user's organization type
      const orgResult = await supabase
        .from("organizations")
        .select("type")
        .eq("owner_id", user.id)
        .maybeSingle();

      const org = orgResult.data as
        | Database["public"]["Tables"]["organizations"]["Row"]
        | null;

      if (org?.type === "oem") {
        router.replace("/dashboard/oem");
      } else {
        // Buyers go to homepage
        router.replace("/");
      }
    } catch (error) {
      console.error("Error checking user type:", error);
      // Fallback to homepage
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-2xl pt-24 pb-12 px-4">
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </Card>
      </div>
    </div>
  );
}
