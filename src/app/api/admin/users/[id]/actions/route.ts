import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action, projectId } = await req.json();
    const userId = params.id;

    const supabaseAdmin = getSupabaseAdmin(projectId);
    if (!supabaseAdmin) return NextResponse.json({ error: "Invalid Project" }, { status: 400 });

    if (action === "logout") {
      const { error } = await supabaseAdmin.auth.admin.signOut(userId, "global");
      if (error) throw error;
      return NextResponse.json({ success: true, message: "User session invalidated globally." });
    }

    if (action === "reset-password") {
      // In a real scenario, this would send a recovery email or return a link
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        uuid: userId,
      });
      if (error) throw error;
      return NextResponse.json({ success: true, link: data.properties.action_link });
    }

    return NextResponse.json({ error: "Unknown Action" }, { status: 400 });
  } catch (err: any) {
    console.error("Management Action Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
