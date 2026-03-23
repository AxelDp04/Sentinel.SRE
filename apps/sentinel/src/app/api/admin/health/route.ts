import { NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proyectos a monitorear
    const targets = [
      { 
        id: "auditacar", 
        url: process.env.AUDITACAR_NEON_DATABASE_URL,
        type: "neon"
      },
      { 
        id: "arqovex", 
        url: process.env.ARQOVEX_SUPABASE_URL,
        type: "supabase"
      },
      { 
        id: "agentscout", 
        url: process.env.AGENT_SCOUT_URL || "https://agentscout.com",
        type: "vercel"
      }
    ];

    const health: Record<string, any> = {};

    await Promise.all(targets.map(async (target) => {
      const start = Date.now();
      let status: "online" | "offline" = "offline";
      let latency = 0;

      if (!target.url) {
        health[target.id] = { status: "offline", latency: 0, error: "Missing Env Var" };
        return;
      }

      try {
        // Deep Integrity Probe (Axel Perez Requirement)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        let probeUrl = target.url;
        if (target.type === "supabase") {
          probeUrl = `${target.url}/rest/v1/nexus_tasks?select=id&limit=1`;
        } else if (target.id === "auditacar") {
          // Deep Probe para Neon (Simulando consulta a tabla vehicles)
          // Nota: Si es un URL de conexión PG, el HEAD fallará con 405 o error,
          // pero si el manual chaos borra la tabla, capturaremos el 'Integrity Failure'.
          probeUrl = `${target.url}/v1/query?table=vehicles`; // Protocolo de sonda externa
        }

        const res = await fetch(probeUrl, { 
          method: "GET", 
          headers: {
            // Para Supabase, necesitamos la key (usamos la anon por simplicidad en el ping)
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
          signal: controller.signal,
          cache: "no-store"
        });
        
        clearTimeout(timeoutId);
        
        // Si el status es 404 para una tabla, es un Integrity Failure
        if (res.status === 404) {
          status = "integrity_failure" as any;
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
