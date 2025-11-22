"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase/session-context";

export default function RegisterClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "oem">("buyer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    // Attempt to handle auto-login or guide user
    if (data.session) {
      toast({ description: "Account created! Logging you in..." });
      if (role === "oem") {
        router.push("/onboarding/oem/register");
      } else {
        router.push("/onboarding/buyer");
      }
    } else {
      // If session is missing, it usually means email verification is required.
      // However, for MVP testing, we try to sign in immediately in case it was actually allowed but session wasn't returned (rare)
      // or to trigger the specific error message.
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData.session) {
        toast({ description: "Account created! Logging you in..." });
        if (role === "oem") {
          router.push("/onboarding/oem/register");
        } else {
          router.push("/onboarding/buyer");
        }
      } else {
        // If sign in fails, it's definitely because of verification
        toast({
          title: "Verification Required",
          description:
            "Please check your email to verify your account. To skip this for testing, disable 'Confirm Email' in your Supabase Dashboard.",
          duration: 6000,
        });
        // Optional: Redirect to login anyway
        router.push("/login?registered=true");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="p-8 shadow-lg border-0 ring-1 ring-black/5">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
              <p className="text-muted-foreground">
                Join YUMYUM to connect with the best manufacturers.
              </p>
              <p className="text-xs mt-2 bg-yellow-500/10 text-yellow-600 p-2 rounded border border-yellow-500/20">
                MVP Note: Disable &quot;Confirm Email&quot; in Supabase to login
                immediately.
              </p>
            </div>

            <Tabs
              defaultValue="buyer"
              onValueChange={(v) => setRole(v as "buyer" | "oem")}
              className="w-full mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buyer">I&apos;m a Buyer</TabsTrigger>
                <TabsTrigger value="oem">I&apos;m an OEM</TabsTrigger>
              </TabsList>
              <TabsContent value="buyer">
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Find manufacturers, request quotes, and manage orders.
                </p>
              </TabsContent>
              <TabsContent value="oem">
                <p className="text-xs text-center text-muted-foreground mt-2">
                  List your factory, receive orders, and grow your business.
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Login
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
