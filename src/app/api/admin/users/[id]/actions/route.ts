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

    const { action, projectId } = await req.json();
    const userId = params.id;

    const supabaseAdmin = getSupabaseAdmin(projectId);
    if (!supabaseAdmin) return NextResponse.json({ error: "Invalid Project" }, { status: 400 });

    // Telemetry: [AUTH_ADMIN_TEST]
    const logMsg = `[AUTH_ADMIN_TEST] Attempting ${action.toUpperCase()} on UID: ${userId} (${projectId.toUpperCase()})...`;
    
    if (action === "logout") {
      const { error } = await supabaseAdmin.auth.admin.signOut(userId, "global");
      const result = error ? `Error: ${error.message}` : "SUCCESS";
      
      return NextResponse.json({ 
        success: !error, 
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
