"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, LogOut } from "lucide-react";
import { isAuthenticated, setAuth, clearAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setAuth("mock_token", email);
      const nextPath = searchParams.get("next") || "/dashboard/buyer";
      router.push(nextPath);
    }, 800);
  };

  const handleLogout = () => {
    clearAuth();
    toast({ description: "You've logged out." });
    router.push("/");
  };

  if (isAuthenticated()) {
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
                <p className="text-lg">You&apos;re logged in.</p>
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
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/onboarding/buyer">Get matched as a buyer</a>
                </Button>
              </p>
            </div>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>For demo purposes, use any email/password to login</p>
          </div>
        </div>
      </section>
    </div>
  );
}
