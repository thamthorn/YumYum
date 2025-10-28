import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServerComponentClient<Database>({
    // @ts-expect-error - Next.js 15 cookies() is async but auth-helpers types expect sync
    cookies: () => cookieStore,
  });
};
