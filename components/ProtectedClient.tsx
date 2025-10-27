"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface Props {
  children: ReactNode;
}

export default function ProtectedClient({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated()) {
      const next =
        pathname + (search?.toString() ? `?${search.toString()}` : "");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router, pathname, search]);

  if (!isAuthenticated()) return null;
  return <>{children}</>;
}
