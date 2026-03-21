import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        users: [], 
        warning: "Admin API in standby mode (Missing Credentials)" 
      });
    }

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    const activeUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
      is_active: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 86400000 : false
    }));

    return NextResponse.json({ users: activeUsers });
  } catch (err: any) {
    console.error("Sheriff API Error (List):", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
