import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { isValidAdminKey } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminKey = req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized: Invalid Master Key" }, { status: 401 });
    }

    const { action, projectId, newPassword } = await req.json();
    const userId = params.id;

    const supabaseAdmin = getSupabaseAdmin(projectId);
    if (!supabaseAdmin) return NextResponse.json({ error: "Invalid Project" }, { status: 400 });

    // Telemetry: [AUTH_ADMIN_TEST]
    const logMsg = `[AUTH_ADMIN_TEST] ${action.toUpperCase()} on UID: ${userId} (${projectId.toUpperCase()})...`;
    
    // Strip project prefix from the ID before passing to Supabase (e.g. 'arqovex-1234' -> '1234')
    const cleanUserId = userId.startsWith(`${projectId}-`) 
      ? userId.substring(projectId.length + 1) 
      : userId;

    if (action === "logout") {
      // SOVEREIGN LOGOUT: Using the RPC tunnel granted by the user
      // This bypasses the schema 'auth' limitation by running with SECURITY DEFINER
      const { error } = await supabaseAdmin.rpc('force_logout_user', { 
        target_user_id: cleanUserId 
      });

      const success = !error;
      const result = success ? "SUCCESS" : `RPC_ERR: ${error.message}`;
      
      return NextResponse.json({ 
        success, 
        message: `Administrative Logout: ${result}`,
        debug_log: `${logMsg} Result: [${result}]`
      });
    }

    if (action === "reset-password") {
      if (!newPassword) {
        return NextResponse.json({ error: "No password provided for override" }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(cleanUserId, {
        password: newPassword,
      });
      
      const result = error ? `Error: ${error.message}` : "SUCCESS";
      
      return NextResponse.json({ 
        success: !error, 
        message: error ? error.message : "Sovereign Password Override Successful. The user's password has been forcefully changed.",
        debug_log: `${logMsg} [OVERRIDE_PWD] Result: [${result}]`
      });
    }

    return NextResponse.json({ error: "Unknown Action" }, { status: 400 });
  } catch (err: any) {
    console.error("Management Action Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
