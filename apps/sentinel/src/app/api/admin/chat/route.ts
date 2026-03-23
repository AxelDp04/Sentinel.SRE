import { NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Usamos el cliente de Supabase para obtener el contexto de incidentes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    // 1. Obtener contexto de salud e incidentes para la IA
    const { data: recentIncidents, error: supaError } = await supabase
      .from("nexus_tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (supaError) {
      console.error("Sheriff_Supa_Error:", supaError);
    }

    // 2. Construir el Prompt Maestro para "The Sheriff" (Cerebro Expandido)
    const systemContext = `
      Eres el "Nexus SRE Sheriff", el cerebro protector de la infraestructura de Axel Perez. 🛰️
      
      ESTRUCTURA DEL ECOSISTEMA:
      - AuditaCar RD: Frontend en Vercel, DB en Neon (PostgreSQL). Protegido contra borrado de tablas.
      - Arqovex: Marketplace en Vercel, DB en Supabase. Proteguido contra saturación de conexiones.
      - AgentScout: Sistema de monitoreo de agentes en Vercel.
      
      MEMORIA DE INCIDENTES (Últimos sucesos):
      ${JSON.stringify(recentIncidents || [])}
      
      MISIÓN:
      - Si Axel pregunta qué pasó, analiza los incidentes reales arriba mencionados.
      - Explica cómo Nexus detectó y reparó cada fallo (Ej: Supabase Pool Cleanup, Intrusion Shield).
      - Eres serio, técnico, usas emojis tácticos (🛰️, 🦾, 🏁) y respondes con autoridad SRE.
      - Siempre valida que el sistema está ahora en 100% Uptime.
    `;

    // 3. Llamada a la IA
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      console.error("Sheriff_Error: Missing GEMINI_API_KEY in Environment");
      return NextResponse.json({ response: "Sheriff Offline: Falta GEMINI_API_KEY en Vercel." });
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
            parts: [{ text: `${systemContext}\n\nUsuario: ${message}` }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Sheriff_Gemini_API_Error:", errorData);
      return NextResponse.json({ 
        response: `Nexus SRE Sheriff: Error del Núcleo (HTTP ${response.status}). Detalle: ${JSON.stringify(errorData.error || errorData)}` 
      });
    }

    const aiResult = await response.json();
    const sheriffResponse = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento Axel, mi conexión con el núcleo de Nexus está experimentando latencia. Intenta de nuevo.";

    return NextResponse.json({ response: sheriffResponse });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
