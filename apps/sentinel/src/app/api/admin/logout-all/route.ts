import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Emergency actions unavailable (Missing Credentials)" }, { status: 503 });
    }

    // Audit Logging before action
    await supabaseAdmin.from("service_logs").insert({
      service_id: "sentinel-sheriff",
      status: "offline",
      latency: 0,
      error: "GLOBAL_LOGOUT_INITIATED",
      metadata: { action: "FORCE_GLOBAL_SESSION_INVALIDATION", trigger: "Admin_Command" }
    });

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    for (const user of users) {
      await supabaseAdmin.auth.admin.signOut(user.id, "global");
    }

    return NextResponse.json({ success: true, message: "All sessions invalidated" });
  } catch (err: any) {
    console.error("Sheriff API Error (Logout All):", err.message);
    return NextResponse.json({ error: "Logout operation failed" }, { status: 500 });
  }
}
