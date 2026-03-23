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

      ACCIONES ADMINISTRATIVAS:
      - Si Axel te pide limpiar, borrar o poner en blanco los logs/registros de incidentes, debes responder estrictamente con el comando [[ACTION:CLEAR_LOGS]] al principio de tu respuesta.
      - Ejemplo: "[[ACTION:CLEAR_LOGS]] Entendido Axel, procedo a limpiar el historial de incidentes para mantener la eficiencia del sistema."
    `;

    // 3. Estrategia de Conectividad con Groq (Más rápido y compatible)
    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_KEY) {
      return NextResponse.json({ response: "Sheriff Offline: Falta GROQ_API_KEY." });
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ 
          response: `Nexus SRE Sheriff: Error de Groq (HTTP ${response.status}). Detalle: ${JSON.stringify(errorData.error || errorData)}` 
        });
      }

      const aiResult = await response.json();
      let sheriffResponse = aiResult.choices[0].message.content || "Lo siento Axel, mi conexión con el núcleo de Nexus está experimentando latencia. Intenta de nuevo.";

      // 4. Procesamiento de Acciones (The Sheriff's Hands)
      if (sheriffResponse.includes("[[ACTION:CLEAR_LOGS]]")) {
        console.log("[*] Sheriff Action Triggered: CLEAR_LOGS");
        // Ejecutar limpieza real en Supabase
        const { error: clearError } = await supabase
          .from('nexus_tasks')
          .delete()
          .neq('id', "00000000-0000-0000-0000-000000000000"); // Borrar todo lo que no sea un UUID inexistente

        if (clearError) {
          console.error("Sheriff_Action_Error:", clearError);
          sheriffResponse = sheriffResponse.replace("[[ACTION:CLEAR_LOGS]]", "❌ [ERROR DE AUTORIDAD] No pude limpiar los logs debido a un fallo en la base de datos.");
        } else {
          sheriffResponse = sheriffResponse.replace("[[ACTION:CLEAR_LOGS]]", "✅ [SISTEMA PURGADO] ");
        }
      }

      return NextResponse.json({ response: sheriffResponse });

    } catch (err) {
      console.error("[!] Error de red con Groq:", err);
      return NextResponse.json({ response: "Nexus SRE Sheriff: Fallo crítico de red con el núcleo de Groq." });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
