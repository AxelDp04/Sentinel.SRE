import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { isValidAdminKey } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminKey = req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized: Invalid Master Key" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "arqovex";
    const userId = params.id;

    const supabaseAdmin = getSupabaseAdmin(projectId);
    if (!supabaseAdmin) return NextResponse.json({ error: "Invalid Project" }, { status: 400 });

    const [citas, favoritos, ventas, newsletter] = await Promise.all([
      supabaseAdmin.from("citas").select("*").eq("id_usuario", userId).limit(5),
      supabaseAdmin.from("favoritos").select("*").eq("id_usuario", userId).limit(5),
      supabaseAdmin.from("ventas_planos").select("*").eq("id_usuario", userId).limit(5),
      supabaseAdmin.from("newsletter").select("email").eq("id_usuario", userId).maybeSingle()
    ]);

    return NextResponse.json({
      activity: {
        appointments: citas.data || [],
        favorites: favoritos.data || [],
        sales: ventas.data || [],
        is_subscribed: !!newsletter.data
      }
    });
  } catch (err: any) {
    console.error("Drilldown API Error:", err.message);
    return NextResponse.json({ error: "Unauthorized access or failure" }, { status: 500 });
  }
}
