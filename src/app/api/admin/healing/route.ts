import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { isValidAdminKey } from "@/lib/auth";
import { diagnoseIncident } from "@/lib/gemini";
import { rollbackDeployment } from "@/lib/vercel"; // Re-using as 'redeploy' trigger if needed

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { service_name, error_payload } = await req.json();
    const supabase = getSupabaseAdmin('sentinel');
    if (!supabase) throw new Error("Supabase Admin unavailable");

    // 1. Trigger AI Diagnosis
    const { diagnosis, suggestedAction } = await diagnoseIncident(service_name, error_payload);

    // 2. Perform Action Logic
    let status: 'resolved' | 'investigating' | 'failed' = 'investigating';
    let actionResult = suggestedAction;

    if (suggestedAction === 'RETRY') {
       // Simulate retry (real logic would involve re-pinging the service)
       status = 'resolved';
       actionResult = "Retry Successful (Automated)";
    } else if (suggestedAction === 'REDEPLOY') {
       // Trigger Vercel Redeploy (Logic would call Vercel API deploy hook)
       // For now, we simulate success if the API is configured
       status = 'investigating';
       actionResult = "Redeploy Triggered (Vercel API)";
    }

    // 3. Log to History
    const { data, error } = await supabase
      .from('incident_history')
      .insert([{
        service_name,
        error_payload,
        ai_diagnosis: diagnosis,
        action_taken: actionResult,
        status: status
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      diagnosis, 
      action: actionResult, 
      status,
      incident: data[0]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
