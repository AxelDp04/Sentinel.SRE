import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { isValidAdminKey } from "@/lib/auth";
import { analyzeIncidentPatterns } from "@/lib/gemini";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { PROJECTS } from "@/constants/projects";

export async function POST(req: Request) {
  try {
    const rawBody = await req.clone().text();
    console.log("[DEBUG API] Incoming WhatsApp Report Request:", rawBody);
    
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

    const body = await req.json().catch(() => ({}));
    const { targetPhone, isNexusReport, incidentData } = body;

    let finalReport = "";

    if (isNexusReport && incidentData) {
      // PROCESAMIENTO PROACTIVO NEXUS (FORMATO COMPACTO - AXEL PEREZ)
      const { project_name, error_description, solution } = incidentData;
      const timestamp = new Date().toLocaleString("es-DO", { timeZone: "America/Santo_Domingo" });
      
      // Truncar para evitar el límite de 1600 de Twilio (objetivo < 1000)
      const maxLen = 400; // 400 para error + 400 para solución + fijos ≈ 1000
      const cleanError = error_description.length > maxLen ? error_description.substring(0, maxLen) + "..." : error_description;
      const cleanSolution = solution.length > maxLen ? solution.substring(0, maxLen) + "..." : solution;

      finalReport = `🛡️ SENTINEL OPS - INFORME TÉCNICO\n` +
                    `Hola Ing. Axel Perez, un placer.\n\n` +
                    `Alert: Anomalía en ${project_name}.\n` +
                    `📝 Error: ${cleanError}\n` +
                    `💡 Solución: ${cleanSolution}\n` +
                    `⏰ Cierre: ${timestamp}\n\n` +
                    `Status: ESTABLE bajo supervisión de Nexus.`;
    } else {
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
      incidents = JSON.parse(JSON.stringify(incidents));
      
      const totalServices = PROJECTS.length;
      const estimatedDowntimeMinutes = incidents.length * 3;
      const uptimePercentage = Math.max(0, ((1440 - estimatedDowntimeMinutes) / 1440) * 100).toFixed(2);

      finalReport = await analyzeIncidentPatterns(incidents || [], parseFloat(uptimePercentage), totalServices);
    }

    // 4. Send via Twilio
    // Prioridad: 1. Body targetPhone, 2. Env TWILIO_OWNER_NUMBER, 3. Env TWILIO_WHATSAPP_NUMBER
    const destination = targetPhone || process.env.TWILIO_OWNER_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;
    
    console.log(`[TRIGGER API] Enviando reporte de ${finalReport.length} caracteres a ${destination}`);

    if (!destination) {
       return NextResponse.json({ error: "No target phone number configured for Reporting." }, { status: 400 });
    }

    const sent = await sendWhatsAppMessage(destination, finalReport);

    if (!sent) {
       return NextResponse.json({ error: "Message generated but Twilio failed to dispatch. Check credentials." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: isNexusReport ? "Nexus Incident Report dispatched." : "Daily Tactical Briefing dispatched.",
      report_preview: finalReport
    });

  } catch (error: any) {
    console.error("Root Guardian Reporting Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
