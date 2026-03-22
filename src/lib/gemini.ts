import { GoogleGenerativeAI } from "@google/generative-ai";
import { HealingAction } from "@/types/incidents";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCKogKA1uNBBSdq5G2md2DbJ6tjqDKpxHw";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export type ErrorCategory = "NETWORK" | "BUILD" | "DATABASE" | "UNKNOWN";

/** Classify error by HTTP code and payload keywords */
export function classifyError(errorPayload: any): ErrorCategory {
  const status = errorPayload?.status ?? errorPayload?.code ?? 0;
  const message = String(errorPayload?.message || "").toLowerCase();

  // Database errors
  if (
    message.includes("database") || message.includes("supabase") ||
    message.includes("postgres") || message.includes("connection") ||
    message.includes("db") || status === 500
  ) {
    // Distinguish DB from generic server errors by keyword
    if (message.includes("database") || message.includes("postgres") || message.includes("supabase")) {
      return "DATABASE";
    }
  }

  // Build / Deploy errors
  if (
    message.includes("build") || message.includes("deploy") ||
    message.includes("compile") || message.includes("bundle") ||
    status === 502 || status === 503
  ) {
    return "BUILD";
  }

  // Network / Timeout errors
  if (
    message.includes("timeout") || message.includes("network") ||
    message.includes("gateway") || message.includes("econnreset") ||
    status === 408 || status === 504 || status === 522 || status === 524
  ) {
    return "NETWORK";
  }

  // Generic 5xx fallback to NETWORK (retryable)
  if (status >= 500 && status < 600) return "NETWORK";

  return "UNKNOWN";
}

export async function diagnoseIncident(
  serviceName: string,
  errorPayload: any
): Promise<{
  diagnosis: string;
  suggestedAction: HealingAction;
  errorCategory: ErrorCategory;
  httpCode: number;
}> {
  const errorCategory = classifyError(errorPayload);
  const httpCode = errorPayload?.status ?? errorPayload?.code ?? 0;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const actionMap: Record<ErrorCategory, string> = {
      NETWORK: "RETRY (max 3 automatic retries with exponential backoff)",
      BUILD: "REDEPLOY (rollback to last stable Vercel deployment)",
      DATABASE: "MANUAL_INTERVENTION (restart Supabase connection pool)",
      UNKNOWN: "MANUAL_INTERVENTION",
    };

    const prompt = `
You are Sentinel SRE AI — an elite infrastructure reliability engine.
A critical failure has been detected. Your job is to diagnose and classify the recovery action.

Service: ${serviceName}
HTTP Status Code: ${httpCode || "Unknown"}
Error Category: ${errorCategory}
Error Payload: ${JSON.stringify(errorPayload, null, 2)}

Instructions:
1. Write a concise, technical diagnosis in ONE sentence (max 20 words).
   — ALWAYS include the HTTP code (e.g. "502 Bad Gateway") if available.
   — Explain the most likely root cause.
2. Classify the action: must be one of: RETRY | REDEPLOY | MANUAL_INTERVENTION
   Based on category:
   - NETWORK errors → RETRY
   - BUILD/DEPLOY errors → REDEPLOY
   - DATABASE errors → MANUAL_INTERVENTION
   - UNKNOWN → MANUAL_INTERVENTION

Respond ONLY with valid JSON:
{
  "diagnosis": "Your technical diagnosis including HTTP code if available...",
  "action": "RETRY | REDEPLOY | MANUAL_INTERVENTION"
}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    const parsed = JSON.parse(jsonStr);

    return {
      diagnosis: parsed.diagnosis || `${httpCode ? `[HTTP ${httpCode}] ` : ""}Failure on ${serviceName}. Manual review required.`,
      suggestedAction: (parsed.action as HealingAction) || "MANUAL_INTERVENTION",
      errorCategory,
      httpCode,
    };
  } catch (error) {
    console.error("Gemini AI Diagnosis Error:", error);
    return {
      diagnosis: `[HTTP ${httpCode || "???"}] AI diagnosis unavailable. ${errorCategory} error on ${serviceName}.`,
      suggestedAction: errorCategory === "NETWORK" ? "RETRY" : errorCategory === "BUILD" ? "REDEPLOY" : "MANUAL_INTERVENTION",
      errorCategory,
      httpCode,
    };
  }
}
