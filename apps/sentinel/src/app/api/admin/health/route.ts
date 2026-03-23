import { NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proyectos a monitorear con URLs de Producción (HTTP Safe)
    const targets = [
      { 
        id: "auditacar", 
        url: "https://auditacar-rd.vercel.app",
        type: "vercel"
      },
      { 
        id: "arqovex", 
        url: "https://arqovex.vercel.app",
        type: "vercel"
      },
      { 
        id: "agentscout", 
        url: "https://agentscout.com",
        type: "vercel"
      }
    ];

    const health: Record<string, any> = {};

    await Promise.all(targets.map(async (target) => {
      const start = Date.now();
      let status: "online" | "offline" | "integrity_failure" = "offline";
      let latency = 0;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(target.url, { 
          method: "GET", 
          headers: { "User-Agent": "Nexus-Sentinel-Probe/4.0" },
          signal: controller.signal,
          cache: "no-store"
        });
        
        clearTimeout(timeoutId);
        
        if (res.status === 404) {
          status = "integrity_failure";
        } else {
          status = res.ok ? "online" : "offline";
        }
        latency = Date.now() - start;
      } catch (err) {
        status = "offline";
        latency = 999;
      }

      health[target.id] = { status, latency };
    }));

    return new NextResponse(
      JSON.stringify({ 
        health,
        timestamp: new Date().toISOString(),
        probes: "Deep_Integrity_v2",
        cache_bypass: "aggressive-shield"
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
          'x-sentinel-probe': 'aggressive-bypass'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
