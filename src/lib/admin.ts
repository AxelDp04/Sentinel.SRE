import { createClient } from "@supabase/supabase-js";

/**
 * Sentinel SRE - Supabase Admin Engine
 * WARNING: This client uses the SERVICE_ROLE_KEY and bypasses Row Level Security.
 * It MUST only be executed in a server-side context (Node.js/API Routes).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase Admin credentials missing for Phase 9.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
