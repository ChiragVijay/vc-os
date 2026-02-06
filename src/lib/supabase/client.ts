import { createClient } from "@supabase/supabase-js";
import { env, getMissingEnvKeys } from "../config";
import type { Database } from "./types";

export const getSupabaseClient = () => {
  const missingSupabaseKeys = getMissingEnvKeys([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);

  if (missingSupabaseKeys.length > 0) {
    throw new Error("Supabase keys are missing. Add them to .env.local.");
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.SUPABASE_SERVICE_ROLE_KEY as string,
  );
};
