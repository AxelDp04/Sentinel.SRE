import { createClient } from "@supabase/supabase-js";

/**
 * Sentinel SRE - Supabase Admin Engine
 * WARNING: This client uses the SERVICE_ROLE_KEY and bypasses Row Level Security.
 * It MUST only be executed in a server-side context (Node.js/API Routes).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Lazy initialization to prevent build-time crashes
let adminClient: any = null;

export const getSupabaseAdmin = () => {
  if (adminClient) return adminClient;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn("SUPABASE_SERVICE_ROLE_KEY is missing in production environment.");
    }
    return null;
  }

  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
};
