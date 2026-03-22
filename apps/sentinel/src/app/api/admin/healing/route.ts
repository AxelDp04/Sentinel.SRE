import { NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/auth";
import { diagnoseIncident, ErrorCategory } from "@/lib/gemini";
import { rollbackToLastStable } from "@/lib/vercel";

const SENTINEL_URL = "https://badqkfvbymxyqtwpnejd.supabase.co";
const SENTINEL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo";

const dbHeaders = {
  "apikey": SENTINEL_KEY,
  "Authorization": `Bearer ${SENTINEL_KEY}`,
  "Content-Type": "application/json",
};

/**
 * Automatic Retry Logic — up to 3 attempts with exponential backoff.
 * Used for NETWORK errors (timeouts, 5xx flaps).
 */
async function performRetry(serviceUrl: string, maxRetries = 3): Promise<{
  success: boolean;
  attemptsUsed: number;
  finalStatus?: number;
}> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Exponential backoff: 500ms, 1000ms, 2000ms
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 500));

      const res = await fetch(serviceUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok || res.status < 500) {
        return { success: true, attemptsUsed: attempt, finalStatus: res.status };
      }
    } catch (err) {
      console.warn(`Retry attempt ${attempt} failed:`, err);
    }
  }
  return { success: false, attemptsUsed: maxRetries };
}

/**
 * Supabase DB connection reset suggestion.
 * In production, this would fire a webhook/edge function to reset the connection pool.
 */
async function triggerSupabaseReset(serviceName: string): Promise<string> {
  // Log the restart event — in production could call a Supabase Edge Function
  console.log(`[SENTINEL] DB restart recommended for ${serviceName}`);
  return "Supabase connection pool reset recommended. Gemini analysis stored. Manual execution required via Supabase Dashboard.";
}

/** Log incident to Supabase via direct REST (no schema cache issues) */
async function logIncident(payload: Record<string, any>) {
  return fetch(`${SENTINEL_URL}/rest/v1/incident_history`, {
    method: "POST",
    headers: { ...dbHeaders, "Prefer": "return=representation" },
    body: JSON.stringify(payload),
  });
}

// Map service name to its public URL for retry probes
const SERVICE_URLS: Record<string, string> = {
  arqovex: "https://arqovex.vercel.app",
  auditacar: "https://auditacar-rd.vercel.app",
  agentscout: "https://agentscout.vercel.app",
};

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { service_name, error_payload } = await req.json();

    // ─── Step 1: AI Diagnosis with Error Classification ───────────────────────
    const { diagnosis, suggestedAction, errorCategory, httpCode } =
      await diagnoseIncident(service_name, error_payload);

    // ─── Step 2: Execute the Right Autonomous Action ──────────────────────────
    let status: "resolved" | "investigating" | "failed" = "investigating";
    let actionTaken = suggestedAction;
    let actionDetail = "";

    if (errorCategory === "NETWORK" || suggestedAction === "RETRY") {
      // ── Action 1: Automatic Retry (up to 3x with backoff) ──
      const serviceUrl = SERVICE_URLS[service_name.toLowerCase()] ||
        `https://${service_name.toLowerCase()}.vercel.app`;

      const retryResult = await performRetry(serviceUrl, 3);

      if (retryResult.success) {
        status = "resolved";
        actionTaken = `RETRY x${retryResult.attemptsUsed} → RECOVERED (HTTP ${retryResult.finalStatus ?? "2xx"})`;
        actionDetail = `Service recovered after ${retryResult.attemptsUsed} automatic retry attempt(s).`;
      } else {
        status = "failed";
        actionTaken = `RETRY x3 → FAILED — Escalating to REDEPLOY`;
        actionDetail = "All 3 retry attempts exhausted. Escalating to build rollback.";

        // Auto-escalate to redeploy if retries fail
        const rollback = await rollbackToLastStable();
        if (rollback.success) {
          status = "resolved";
          actionTaken = `RETRY FAILED → AUTO-ROLLBACK → STABLE (${rollback.deploymentUrl || "deployed"})`;
        }
      }
    } else if (errorCategory === "BUILD" || suggestedAction === "REDEPLOY") {
      // ── Action 2: Vercel Automatic Rollback ──
      const rollback = await rollbackToLastStable();

      if (rollback.success) {
        status = "resolved";
        actionTaken = `AUTO-ROLLBACK → STABLE (${rollback.deploymentUrl || "last good deployment"})`;
        actionDetail = `Build failure detected [HTTP ${httpCode}]. Automatically rolled back to last stable Vercel deployment.`;
      } else {
        status = "failed";
        actionTaken = `ROLLBACK ATTEMPTED → FAILED: ${rollback.error || "Vercel API error"}`;
        actionDetail = `Rollback failed. Vercel credentials may need updating. Error: ${rollback.error}`;
      }
    } else if (errorCategory === "DATABASE" || suggestedAction === "MANUAL_INTERVENTION") {
      // ── Action 3: DB Restart Suggestion ──
      actionDetail = await triggerSupabaseReset(service_name);
      status = "investigating";
      actionTaken = `DB ANALYSIS → ${diagnosis.includes("MANUAL") ? "MANUAL_INTERVENTION" : "RESTART_RECOMMENDED"}`;
    }

    // ─── Step 3: Log Everything to incident_history ───────────────────────────
    const incidentData = {
      service_name,
      error_payload: {
        ...error_payload,
        _category: errorCategory,
        _http_code: httpCode,
        _action_detail: actionDetail,
      },
      ai_diagnosis: diagnosis,
      action_taken: actionTaken,
      status,
    };

    const logRes = await logIncident(incidentData);
    const logData = await logRes.json();

    return NextResponse.json({
      success: true,
      diagnosis,
      action: actionTaken,
      category: errorCategory,
      httpCode,
      status,
      detail: actionDetail,
      incident: Array.isArray(logData) ? logData[0] : logData,
    });
  } catch (err: any) {
    console.error("[HEALING ENGINE] Fatal error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
