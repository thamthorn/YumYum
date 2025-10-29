import type { Session } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppError, AuthError } from "@/utils/errors";

export const getServerSession = async (): Promise<Session | null> => {
  const supabase = await createSupabaseServerClient();

  // Use getUser() for secure authentication (validates with Supabase Auth server)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new AppError("Failed to authenticate user", {
      cause: userError,
      code: "user_auth_failed",
    });
  }

  if (!user) {
    return null;
  }

  // Get session after validating user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
};

export const requireServerSession = async (): Promise<Session> => {
  const session = await getServerSession();
  if (!session) {
    throw new AuthError();
  }
  return session;
};
