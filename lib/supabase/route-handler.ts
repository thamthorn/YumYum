import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

export const createSupabaseRouteClient = async () => {
  const cookieStore = await cookies();
  return createRouteHandlerClient<Database>({
    // @ts-expect-error - Next.js 15 cookies() is async but auth-helpers types expect sync
    cookies: () => cookieStore,
  });
};
