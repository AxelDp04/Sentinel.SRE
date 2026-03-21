import { NextResponse } from "next/server";
import { getSupabaseAdmin, getAllConfiguredProjects } from "@/lib/admin";

export async function GET() {
  try {
    const projects = getAllConfiguredProjects();
    let allUsers: any[] = [];
    let totalLiveCount = 0;

    for (const projectId of projects) {
      const supabaseAdmin = getSupabaseAdmin(projectId);
      if (!supabaseAdmin) continue;
      
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) {
        console.error(`Error fetching users for ${projectId}:`, error.message);
        continue;
      }

      const projectUsers = users.map((user: any) => ({
        id: `${projectId}-${user.id}`,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "Sentinel_Identity",
        project: projectId,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        is_live: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 300000 : false,
        is_active: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 86400000 : false
      }));

      allUsers = [...allUsers, ...projectUsers];
      totalLiveCount += projectUsers.filter((u: any) => u.is_live).length;
    }

    // Sort users by registration date (descending) to show newest first
    allUsers.sort((a, b) => {
       const dateA = new Date(a.created_at).getTime();
       const dateB = new Date(b.created_at).getTime();
       return dateB - dateA;
    });

    return NextResponse.json({ 
      users: allUsers,
      total_count: allUsers.length,
      live_count: totalLiveCount,
      debug: projects.map(p => `[DEBUG] Legacy Sync in ${p.toUpperCase()}... Registered: ${allUsers.filter(u => u.project === p).length}`)
    });
  } catch (err: any) {
    console.error("Sheriff API Error (List/Sync):", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
