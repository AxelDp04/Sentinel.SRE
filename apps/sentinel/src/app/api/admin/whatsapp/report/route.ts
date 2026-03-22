import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { isValidAdminKey } from "@/lib/auth";
import { analyzeIncidentPatterns } from "@/lib/gemini";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { PROJECTS } from "@/constants/projects";

export async function POST(req: Request) {
  try {
    // Authenticate the request. 
    // It can be triggered by the Sentinel Dashboard (Admin Key) 
    // or by a Vercel Cron Job (using a CRON_SECRET).
    const authHeader = req.headers.get("authorization") || req.headers.get("X-Admin-Key");
    
    // For manual triggers from the dashboard
    const isDashboardAdmin = isValidAdminKey(authHeader);
    // For automated triggers via Vercel Cron
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isDashboardAdmin && !isCronJob) {
      return NextResponse.json({ error: "Unauthorized access to Tactical Reporting" }, { status: 401 });
    }

    const { targetPhone } = await req.json().catch(() => ({ targetPhone: null }));

    // Use the Sentinel project's DB to fetch incident history
    const supabaseAdmin = getSupabaseAdmin('arqovex'); // Using Arqovex as the main node for incident_history
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Main telemetry database unavailable" }, { status: 500 });
    }

    // 1. Fetch incidents from the last 24 Hours (Direct REST call to bypass PGRST205 schema cache bug)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const dbUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/incident_history?created_at=gte.${twentyFourHoursAgo}&order=created_at.desc`;
    const dbRes = await fetch(dbUrl, {
      method: "GET",
      headers: {
        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY || "",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
        "Content-Type": "application/json"
      }
    });

    if (!dbRes.ok) {
      const errTxt = await dbRes.text();
      throw new Error(`DB Telemetry Fetch Failed (REST Bypass): ${dbRes.status} ${errTxt}`);
    }

    const rawData = await dbRes.json();
    let incidents = Array.isArray(rawData) ? rawData : (rawData?.error ? [] : [rawData]);

    // Force strict JSON scrubbing to eliminate hidden Proxy objects that crash the AI
    incidents = JSON.parse(JSON.stringify(incidents));
    
    // Telemetry log for Vercel debugging
    console.log('DATOS ENVIADOS A GEMINI (Scrubbed):', incidents);

    // 2. Calculate Uptime Metric
    // 24 hours = 1440 minutes. Assume each incident = 3 mins of downtime for estimation
    const estimatedDowntimeMinutes = incidents.length * 3;
    const uptimePercentage = Math.max(0, ((1440 - estimatedDowntimeMinutes) / 1440) * 100).toFixed(2);

    // 3. Gemini "Root Guardian" Analysis
    const totalServices = PROJECTS.length;
    const guardianReport = await analyzeIncidentPatterns(incidents || [], parseFloat(uptimePercentage), totalServices);

    // 4. Send via Twilio
    const destination = targetPhone || process.env.TWILIO_OWNER_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;
    if (!destination) {
       return NextResponse.json({ error: "No target phone number configured for Root Guardian." }, { status: 400 });
    }

    const sent = await sendWhatsAppMessage(destination, guardianReport);

    if (!sent) {
       return NextResponse.json({ error: "Message generated but Twilio failed to dispatch. Check credentials." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Daily Tactical Briefing dispatched to Commander Axel via WhatsApp.",
      report_preview: guardianReport
    });

  } catch (error: any) {
    console.error("Root Guardian Reporting Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
