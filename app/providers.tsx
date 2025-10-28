"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from "@/lib/supabase/session-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient once per app lifetime on the client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <TooltipProvider>
          {children}
          {/* shadcn/ui toasts */}
          <Toaster />
        </TooltipProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
