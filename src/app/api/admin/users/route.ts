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

      // Simulate terminal debug log (handled by front-end event)
      // We return the debug signal in the metadata for the front-end to dispatch
      
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) {
        console.error(`Error fetching users for ${projectId}:`, error.message);
        continue;
      }

      const projectUsers = users.map((user: any) => ({
        id: `${projectId}-${user.id}`,
        email: user.email,
        project: projectId,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        is_live: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 300000 : false,
        is_active: user.last_sign_in_at ? (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 86400000 : false
      }));

      allUsers = [...allUsers, ...projectUsers];
      totalLiveCount += projectUsers.filter((u: any) => u.is_live).length;
    }

    // Sort users by activity
    allUsers.sort((a, b) => {
       const timeA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
       const timeB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
       return timeB - timeA;
    });

    return NextResponse.json({ 
      users: allUsers,
      live_count: totalLiveCount,
      debug: projects.map(p => `[DEBUG] Searching sessions in ${p.toUpperCase()}... Found: ${allUsers.filter((u: any) => u.project === p && u.is_live).length}`)
    });
  } catch (err: any) {
    console.error("Sheriff API Error (List):", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
