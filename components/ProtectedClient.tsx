"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/supabase/session-context";

interface Props {
  children: ReactNode;
}

export default function ProtectedClient({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !session) {
      const next =
        pathname + (search?.toString() ? `?${search.toString()}` : "");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router, pathname, search, session, isLoading]);

  if (isLoading || !session) return null;
  return <>{children}</>;
}
