import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

const getBrowserConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase browser credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  return { url, anonKey };
};

export const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getBrowserConfig();
  return createClientComponentClient<Database>({
    supabaseUrl: url,
    supabaseKey: anonKey,
  });
};
