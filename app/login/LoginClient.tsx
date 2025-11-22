"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase/session-context";
import type { Database } from "@/types/database";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase, session, isLoading: authLoading } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast({ description: "Logged in successfully!" });

    // Check if there's a specific redirect path
    const nextPath = searchParams.get("next");
    if (nextPath) {
      router.push(nextPath);
      router.refresh();
      setIsSubmitting(false);
      return;
    }

    // Check user's organization type to determine redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const orgResult = await supabase
        .from("organizations")
        .select("type")
        .eq("owner_id", user.id)
        .maybeSingle();

      const org = orgResult.data as
        | Database["public"]["Tables"]["organizations"]["Row"]
        | null;

      if (org?.type === "oem") {
        router.push("/dashboard/oem");
      } else {
        // Buyers go to homepage
        router.push("/");
      }
    } else {
      // Fallback to homepage
      router.push("/");
    }

    router.refresh();
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      return;
    }
    toast({ description: "You've logged out." });
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-20">
          <div className="container mx-auto max-w-md">
            <Card className="p-8">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <section className="pt-32 pb-20">
          <div className="container mx-auto max-w-md">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg">
                  You&apos;re logged in as {session.user.email}.
                </p>
                <Button onClick={handleLogout} size="lg" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your buyer dashboard
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </p>
            </div>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Enter the credentials you created in Supabase auth.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
