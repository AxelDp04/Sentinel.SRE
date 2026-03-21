import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    // Filter or mask sensitive data if necessary, but for Sheriff mode we want visibility
    const activeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
      // Simulate "active" status based on sign-in recency (last 24h)
      is_active: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 86400000 : false
    }));

    return NextResponse.json({ users: activeUsers });
  } catch (err: any) {
    console.error("Sheriff API Error (List):", err.message);
    return NextResponse.json({ error: "Unauthorized access or configuration error" }, { status: 500 });
  }
}
