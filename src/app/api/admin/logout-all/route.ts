import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin";

export async function POST() {
  try {
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

    // Supabase does not have a single "logout all" for every user at once,
    // so we iterate through users and invalidate their sessions/JWTs.
    // In a production environment with thousands of users, this would be a background job.
    for (const user of users) {
      await supabaseAdmin.auth.admin.signOut(user.id, "global");
    }

    return NextResponse.json({ success: true, message: "All sessions invalidated" });
  } catch (err: any) {
    console.error("Sheriff API Error (Logout All):", err.message);
    return NextResponse.json({ error: "Logout operation failed" }, { status: 500 });
  }
}
