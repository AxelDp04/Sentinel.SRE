import { NextResponse } from "next/server";
import { getSupabaseAdmin, getAllConfiguredProjects } from "@/lib/admin";

export async function GET() {
  try {
    const projects = getAllConfiguredProjects();
    let allUsers: any[] = [];
    let totalLiveCount = 0;
    const projectStats: Record<string, { total: number; live: number }> = {};

    for (const projectId of projects) {
      const supabaseAdmin = getSupabaseAdmin(projectId);
      if (!supabaseAdmin) continue;
      
      // Perform exact headcount census
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) {
        console.error(`Error fetching users for ${projectId}:`, error.message);
        continue;
      }

      const projectUsers = users.map((user: any) => ({
        id: `${projectId}-${user.id}`,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "Ecosystem_Identity",
        project: projectId,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        is_live: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 300000 : false,
        is_active: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 86400000 : false
      }));

      allUsers = [...allUsers, ...projectUsers];
      const liveOnProject = projectUsers.filter((u: any) => u.is_live).length;
      totalLiveCount += liveOnProject;
      
      projectStats[projectId] = {
        total: projectUsers.length,
        live: liveOnProject
      };
    }

    // Sort by registration date
    allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ 
      users: allUsers,
      total_count: allUsers.length,
      live_count: totalLiveCount,
      stats: projectStats,
      debug: projects.map(p => `[DB] ${p.toUpperCase()} Census: Found ${projectStats[p].total} identities. Status: MASTERED.`)
    });
  } catch (err: any) {
    console.error("Sheriff API Error (Sovereign Scan):", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
