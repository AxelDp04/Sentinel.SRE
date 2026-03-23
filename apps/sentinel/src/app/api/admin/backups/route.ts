import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminKey } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("nexus_backups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    return NextResponse.json({ backups: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { backupId } = await req.json();
    
    // Marcar como restaurado
    const { data, error } = await supabase
      .from("nexus_backups")
      .update({ status: "restored" })
      .eq("id", backupId)
      .select();

    if (error) throw error;

    // Opcional: Podríamos insertar un log en nexus_tasks indicando el rollback manual
    await supabase.from("nexus_tasks").insert({
        project_name: data[0].project_name,
        error_description: `🚨 MANUAL_ROLLBACK: Usuario ejecutó reversa para backup ${backupId}`,
        status: "completed",
        resolution_steps: ["Sentinel: Reversa manual ejecutada por el administrador."]
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
