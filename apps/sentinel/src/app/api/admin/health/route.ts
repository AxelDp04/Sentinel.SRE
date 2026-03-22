import { NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/auth";
import { PROJECTS } from "@/constants/projects";

const TIMEOUT_MS = 6000;

/**
 * Real HTTP Health Check for all ecosystem services.
 * Pings each service URL (HEAD request) and measures latency.
 * No Supabase credentials needed — this is network-level probing.
 */
export async function GET(req: Request) {
  const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.allSettled(
    PROJECTS.map(async (project) => {
      const start = Date.now();
      try {
        const res = await fetch(project.url, {
          method: "HEAD",
          signal: AbortSignal.timeout(TIMEOUT_MS),
          // Follow redirects to handle Vercel's canonical URLs
          redirect: "follow",
        });

        const latency = Date.now() - start;
        const isOnline = res.status < 500;

        return {
          id: project.id,
          name: project.name,
          url: project.url,
          status: isOnline ? "online" : "offline",
          latency,
          httpCode: res.status,
        };
      } catch (err: any) {
        const latency = Date.now() - start;
        const isTimeout = err?.name === "TimeoutError" || latency >= TIMEOUT_MS;

        return {
          id: project.id,
          name: project.name,
          url: project.url,
          status: "offline" as const,
          latency,
          httpCode: isTimeout ? 504 : 0,
          error: isTimeout ? "Request timed out" : err?.message || "Network error",
        };
      }
    })
  );

  const health: Record<string, any> = {};
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      const { id, ...data } = result.value;
      health[id] = data;
    }
  });

  return NextResponse.json({ health, checkedAt: new Date().toISOString() });
}
