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
        // Ping táctico: Dependiendo del tipo de DB
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(target.url, { 
          method: "HEAD", // O GET / si es Supabase Rest
          signal: controller.signal,
          cache: "no-store"
        });
        
        clearTimeout(timeoutId);
        status = res.ok || res.status === 405 ? "online" : "offline";
        latency = Date.now() - start;
      } catch (err) {
        status = "offline";
        latency = 999;
      }

      health[target.id] = { status, latency };
    }));

    return NextResponse.json({ health });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
