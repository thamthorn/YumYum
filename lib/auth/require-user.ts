import type { User } from "@supabase/supabase-js";
import { requireServerSession } from "@/lib/auth/get-session";

export const requireUser = async (): Promise<User> => {
  const session = await requireServerSession();
  return session.user;
};
