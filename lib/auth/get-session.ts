import type { Session } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppError, AuthError } from "@/utils/errors";

export const getServerSession = async (): Promise<Session | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new AppError("Failed to retrieve session", {
      cause: error,
      code: "session_fetch_failed",
    });
  }

  return session;
};

export const requireServerSession = async (): Promise<Session> => {
  const session = await getServerSession();
  if (!session) {
    throw new AuthError();
  }
  return session;
};
