import { NextRequest, NextResponse } from "next/server";
import { checkServiceHealth } from "@/lib/monitor";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const serviceId = searchParams.get("id"); // Added serviceId for logging

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    const result = await checkServiceHealth(url);
    
    // ASYNC LOGGING TO SUPABASE (Don't await fully to keep proxy fast)
    if (serviceId) {
       supabase.from("service_logs").insert([{
        service_id: serviceId,
        status: result.status,
        latency: result.latency,
        status_code: result.statusCode,
        error_message: result.error,
        level: result.status === "online" ? "INFO" : "CRITICAL"
      }]).then(({ error }) => {
        if (error) console.error("Telemetry Logging Error:", error.message);
      });
    }
    
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ 
      status: "offline", 
      error: "Invalid URL format",
      latency: 0 
    }, { status: 422 });
  }
}
