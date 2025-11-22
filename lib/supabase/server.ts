import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";


export const createSupabaseServerClient = async (): Promise<any> => {
  const cookieStore = await cookies();

  // NOTE: Cast to `any` to avoid strict generic incompatibilities
  // between the generated `Database` type and the `@supabase/ssr` helper.
  // This is a pragmatic short-term fix to unblock builds; consider
  // tightening these generics later.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  ) as any;
};
