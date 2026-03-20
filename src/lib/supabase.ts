import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client — lazy-initialized to avoid build-time env var errors
let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = {
  get from() {
    return getSupabase().from.bind(getSupabase());
  },
} as unknown as SupabaseClient;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
  }
  return _supabase;
}

// Re-export getSupabase for cases where the full client is needed
export { getSupabase };
