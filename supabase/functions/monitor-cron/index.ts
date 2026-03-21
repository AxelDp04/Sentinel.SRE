import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Shared projects list (Note: In production, this would be fetched from a 'projects' table)
const PROJECTS = [
  { id: "arqovex", url: "https://arqovex.com" },
  { id: "auditacar", url: "https://auditacar.rd" },
  { id: "agentscout", url: "https://agentscout.com" },
];

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Sentinel Watchman: Starting automated health check...");

  const results = await Promise.all(
    PROJECTS.map(async (project) => {
      const start = performance.now();
      try {
        const resp = await fetch(project.url, {
          method: "GET",
          headers: { "User-Agent": "Sentinel-SRE-Watchman/1.0" },
        });
        const latency = Math.round(performance.now() - start);

        return {
          service_id: project.id,
          status: resp.ok ? "online" : "offline",
          latency,
          status_code: resp.status,
          level: resp.ok ? "INFO" : "CRITICAL",
          error_message: resp.ok ? null : `Status ${resp.status}`,
        };
      } catch (e) {
        return {
          service_id: project.id,
          status: "offline",
          latency: Math.round(performance.now() - start),
          level: "CRITICAL",
          error_message: e instanceof Error ? e.message : String(e),
        };
      }
    })
  );

  const { error } = await supabase.from("service_logs").insert(results);

  if (error) {
    console.error("Sentinel Watchman Error:", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Sentinel Watchman: Health check completed successfully.");
  return new Response(JSON.stringify({ success: true, count: results.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
