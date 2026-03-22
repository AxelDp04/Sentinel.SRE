import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { isValidAdminKey } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const adminKey = req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin('sentinel'); // Using sentinel as the main collector
    if (!supabase) return NextResponse.json({ error: "Supabase Error" }, { status: 500 });

    const { data, error } = await supabase
      .from('incident_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ incidents: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const supabase = getSupabaseAdmin('sentinel');
    if (!supabase) return NextResponse.json({ error: "Supabase Error" }, { status: 500 });

    const { data, error } = await supabase
      .from('incident_history')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json({ incident: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
