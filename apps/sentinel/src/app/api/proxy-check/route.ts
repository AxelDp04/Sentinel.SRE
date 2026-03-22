import { NextResponse } from "next/server";
import { checkServiceHealth } from "@/lib/monitor";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const id = searchParams.get("id");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await checkServiceHealth(url);
    
    // Log to Supabase asynchronously (Fire and forget, but wrapped in try/catch)
    if (id) {
      try {
        await supabase.from("service_logs").insert({
          service_id: id,
          status: result.status,
          latency: result.latency,
          error: result.error || null,
          metadata: { checked_via: "proxy-api" }
        });
      } catch (logError) {
        console.warn("Telemetry Logging Failed:", logError);
        // We don't return an error here, the proxy check itself succeeded
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Proxy Check General Error:", err.message);
    return NextResponse.json({ 
      status: "offline", 
      error: "Service unreachable via proxy",
      latency: 0 
    }, { status: 200 }); // Return 200 even on 'failure' to avoid Vercel 500 alerts
  }
}
