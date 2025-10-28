"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { NAV, ROUTES } from "@/data/MockData";
import { useSupabase } from "@/lib/supabase/session-context";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { session, supabase } = useSupabase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!session;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      return;
    }
    router.push(ROUTES.login);
    router.refresh();
  };

  const navLinks = isLoggedIn ? NAV.loggedIn : NAV.loggedOut;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-foreground">YUM</span>
              <span className="text-primary">²</span>
            </div>
          </Link>

          {/* Desktop Navigation - Right Aligned */}
          <div className="hidden md:flex items-center gap-6 ml-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  Logout
                </button>
                <Button size="sm" asChild>
                  <Link href={ROUTES.onboarding}>Get Matched</Link>
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href={ROUTES.login}>Get Matched</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </Button>
                    <Button size="sm" asChild>
                      <Link
                        href={ROUTES.onboarding}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Matched
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button size="sm" asChild>
                    <Link
                      href={ROUTES.login}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Matched
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
