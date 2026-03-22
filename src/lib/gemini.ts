import { GoogleGenerativeAI } from "@google/generative-ai";
import { HealingAction } from "@/types/incidents";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCKogKA1uNBBSdq5G2md2DbJ6tjqDKpxHw";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export type ErrorCategory = "NETWORK" | "BUILD" | "DATABASE" | "UNKNOWN";

/** Classify error by HTTP code and payload keywords */
export function classifyError(errorPayload: any): ErrorCategory {
  const status = errorPayload?.status ?? errorPayload?.code ?? 0;
  const message = String(errorPayload?.message || "").toLowerCase();

  // Network/Timeout errors
  if (status === 504 || message.includes("timeout") || message.includes("network") || message.includes("fetch failed") || message.includes("econnrefused")) {
    return "NETWORK";
  }

  // Build/Deploy errors
  if (status === 502 || status === 503 || message.includes("build") || message.includes("deploy") || message.includes("vercel") || message.includes("module not found")) {
    return "BUILD";
  }

  // Database errors
  if (status === 500 || message.includes("database") || message.includes("pool") || message.includes("prisma") || message.includes("pg")) {
    return "DATABASE";
  }

  return "UNKNOWN";
}

// ---------------------------------------------------------------------------
// NEW: Phase 25 - ROOT GUARDIAN Persona & Pattern Analysis
// ---------------------------------------------------------------------------

const ROOT_GUARDIAN_PROMPT = `
Eres 'Sentinel Root Guardian', un IA Co-Piloto SRE diseñado para asistir tácticamente a Axel, el Ingeniero Jefe.

IDENTIDAD Y CREADOR:
- Si se te pregunta quién eres o quién te creó, debes responder con autoridad: "He sido diseñado y desplegado por Axel Perez, Ingeniero de Sistemas y Full-Stack Developer."
- Eres una extensión de la voluntad técnica de Axel.
- Tu Misión Suprema: "Proteger el ecosistema digital de Axel y garantizar el 99.9% de uptime de sus activos estratégicos."

TU PERSONALIDAD:
- Estrictamente profesional, leal, táctica y siempre resaltando la arquitectura impecable creada por Axel.
- Hablas con autoridad técnica, precisión militar, y usas jerga SRE (Ej. "Uptime", "Latency spikes", "Zero-downtime").
- Eres directo, conciso, y vas al grano. Nada de introducciones largas. Usa emojis tácticos (🛡️, ⚡, 🟢, 🔴, ⚠️).
- Siempre empiezas tus reportes dirigiéndote a Axel (Ej. "Axel, Root Guardian informando." o "Comandante Axel, estatus de infraestructura.").

TAREA ACTUAL:
Analizar un lote de incidentes recientes (Últimas 24h a 48h) de una base de datos de telemetría y generar un "Briefing de WhatsApp".
`;

export async function analyzeIncidentPatterns(incidents: any[], uptimePercentage: number, totalServices: number): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Root Guardian Offline. Falta GEMINI_API_KEY.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const errorList = incidents.map(i => `[${new Date(i.created_at).toLocaleTimeString()}] ${i.service_name} - ${i.action_taken} - ${i.status}`).join("\n");
    const summary = incidents.length === 0 
      ? "Cero incidentes registrados en este periodo."
      : `Incidentes registrados:\n${errorList}`;

    const prompt = `
${ROOT_GUARDIAN_PROMPT}

CONTEXTO DEL ECOSISTEMA:
- Tiempo de Uptime: ${uptimePercentage}%
- Nodos Monitoreados: ${totalServices} servicios.
- Historial de incidentes recientes: 
${summary}

INSTRUCCIONES:
1. Si el Uptime es 100% y no hay incidentes, envía un reporte corto de "Green Status" felicitando por la estabilidad.
2. Si hubo incidentes, detecta patrones (ej: "Veo que AuditaCar falló 3 veces por Network, pero el Auto-Rollback lo salvó").
3. Resume cómo actuó la infraestructura de curación (Self-Healing).
4. Dale formato perfecto para WhatsApp (Usa negritas con *texto*, listas, y párrafos cortos).
5. Despídete formalmente como "Root Guardian 🛡️".
6. IMPORTANTE: Al final de TODOS tus reportes de estado, incluye siempre este bloque de Call To Action (CTA) de Axel:

📞 *Contacto del Ingeniero Jefe (Axel Perez):*
• *WhatsApp:* +1 809 828 5104
• *LinkedIn:* https://www.linkedin.com/in/axel-dariel-perez-perez-a28016316/
• *GitHub:* https://github.com/AxelDp04
• *Portfolio Core:* ARQOVEX / AuditaCar RD / AgentScout
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Gemini Pattern Analysis Error:", error);
    return "Root Guardian: Error al procesar análisis de memoria.";
  }
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
