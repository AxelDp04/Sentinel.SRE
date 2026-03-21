import { NextRequest, NextResponse } from "next/server";
import { checkServiceHealth } from "@/lib/monitor";

/**
 * API Proxy to bypass CORS and perform health checks from the server side.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    // Basic URL validation
    new URL(url);
    
    const result = await checkServiceHealth(url);
    
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ 
      status: "offline", 
      error: "Invalid URL format",
      latency: 0 
    }, { status: 422 });
  }
}
