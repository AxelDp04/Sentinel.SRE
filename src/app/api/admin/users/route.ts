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

    // Advanced Session Detection: Querying auth.sessions table directly for real-time presence
    // Note: We use the admin client but we might need a direct SQL query via RCP or RPC if auth schema isn't fully exposed
    // For now, we combine listUsers with a filter for session presence if available.
    // However, the best way using Admin Auth is listUsers and checking 'last_sign_in_at' + session metadata.
    
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    // We can also try to fetch the actual session count from the auth schema if the service role allows it
    // Some Supabase setups allow: const { count } = await supabaseAdmin.from('auth.sessions').select('*', { count: 'exact' });
    
    const activeUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
      // More aggressive check for "Live" status (last 5 minutes)
      is_live: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 300000 : false,
      is_active: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 86400000 : false
    }));

    return NextResponse.json({ 
      users: activeUsers,
      live_count: activeUsers.filter(u => u.is_live).length
    });
  } catch (err: any) {
    console.error("Sheriff API Error (List):", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
