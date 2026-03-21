import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { isValidAdminKey } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminKey = req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized: Invalid Master Key" }, { status: 401 });
    }

    const { action, projectId } = await req.json();
    const userId = params.id;

    // Get basic admin client for generic tasks (like password reset)
    const supabaseAdmin = getSupabaseAdmin(projectId);
    if (!supabaseAdmin) return NextResponse.json({ error: "Invalid Project" }, { status: 400 });

    // Telemetry: [AUTH_ADMIN_TEST]
    const logMsg = `[AUTH_ADMIN_TEST] ${action.toUpperCase()} on UID: ${userId} (${projectId.toUpperCase()})...`;
    
    if (action === "logout") {
      // SOVEREIGN LOGOUT: Direct DB intervention on 'auth' schema
      // auth.admin.signOut(id) requires a JWT, which we don't have.
      // We must delete from auth.sessions directly using the Service Role.
      
      const config = {
        url: (supabaseAdmin as any).supabaseUrl,
        key: (supabaseAdmin as any).supabaseKey
      };

      const authDbAdmin = createClient(config.url, config.key, {
        db: { schema: 'auth' }
      });

      // 1. Delete all active sessions for this user
      const { error: sessionError } = await authDbAdmin
        .from('sessions')
        .delete()
        .eq('user_id', userId);

      // 2. Delete all refresh tokens to prevent re-authentication
      const { error: tokenError } = await authDbAdmin
         .from('refresh_tokens')
         .delete()
         .eq('user_id', userId);

      const success = !sessionError && !tokenError;
      const result = success ? "SUCCESS" : `ERR: SESS(${sessionError?.message}) TOK(${tokenError?.message})`;
      
      return NextResponse.json({ 
        success, 
        message: `Administrative Logout: ${result}`,
        debug_log: `${logMsg} Result: [${result}]`
      });
    }

    if (action === "reset-password") {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        uuid: userId,
      });
      const result = error ? `Error: ${error.message}` : "SUCCESS";
      
      return NextResponse.json({ 
        success: !error, 
        link: data?.properties?.action_link,
        debug_log: `${logMsg} Result: [${result}]`
      });
    }

    return NextResponse.json({ error: "Unknown Action" }, { status: 400 });
  } catch (err: any) {
    console.error("Management Action Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
