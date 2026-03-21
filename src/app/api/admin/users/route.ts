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
      
      let projectUsers: any[] = [];

      if (projectId === 'arqovex') {
        // Phase 15: Switch to public.perfiles for ARQOVEX
        const { data: perfiles, error: perfilesError } = await supabaseAdmin
          .from('perfiles')
          .select('id, nombre_completo, email, created_at, es_admin');
        
        if (perfilesError) {
          console.error(`Error fetching perfiles for ${projectId}:`, perfilesError.message);
          // Fallback to auth for safety if profiles fail
          const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
          if (!authError) {
             projectUsers = users.map((user: any) => ({
                id: `${projectId}-${user.id}`,
                email: user.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name || "Ecosystem_Identity",
                project: projectId,
                last_sign_in_at: user.last_sign_in_at,
                created_at: user.created_at,
                is_admin: false,
                is_live: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 300000 : false
             }));
          }
        } else {
          projectUsers = (perfiles || []).map((p: any) => ({
            id: `${projectId}-${p.id}`,
            email: p.email,
            name: p.nombre_completo || "Legacy_User",
            project: projectId,
            last_sign_in_at: null, // Public table might not have this, we'll see if we can join later
            created_at: p.created_at,
            is_admin: p.es_admin || false,
            is_live: false, // Default to false unless we can verify session via auth join
          }));

          // Try to enrich with live status from auth (best effort)
          const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
          if (authUsers) {
            projectUsers = projectUsers.map(pUser => {
              const authUser = authUsers.find((au: any) => au.email === pUser.email);
              if (authUser) {
                return {
                  ...pUser,
                  last_sign_in_at: authUser.last_sign_in_at,
                  is_live: authUser.last_sign_in_at ? (new Date().getTime() - new Date(authUser.last_sign_in_at).getTime()) < 300000 : false
                };
              }
              return pUser;
            });
          }
        }
      } else {
        // Standard projects use Admin Auth API
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) {
          console.error(`Error fetching users for ${projectId}:`, error.message);
          continue;
        }

        projectUsers = users.map((user: any) => ({
          id: `${projectId}-${user.id}`,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || "Ecosystem_Identity",
          project: projectId,
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at,
          is_admin: false,
          is_live: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 300000 : false,
          is_active: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 86400000 : false
        }));
      }

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
      debug: projects.map(p => `[DB] ${p.toUpperCase()} Synced: Found ${projectStats[p].total} business profiles.`)
    });
  } catch (err: any) {
    console.error("Sheriff API Error (Profile Sync):", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
