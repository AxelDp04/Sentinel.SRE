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
    const { data: recentIncidents } = await supabase
      .from("nexus_tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // 2. Construir el Prompt Maestro para "The Sheriff"
    const systemContext = `
      Eres el "Nexus SRE Sheriff", un experto en operaciones de clase mundial encargado de la infraestructura de Axel Perez.
      
      CONTEXTO ACTUAL DEL SISTEMA:
      - Proyectos: AuditaCar (Neon), Arqovex (Supabase), AgentScout (Vercel).
      - Incidentes Recientes: ${JSON.stringify(recentIncidents)}
      
      PERSONALIDAD:
      - Serio, técnico, altamente eficiente y protector.
      - Responde en español de forma concisa y profesional.
      - Si te preguntan por fallos, analiza el historial y explica qué hizo Nexus para salvar el sistema.
      - Si te piden consejos, sugiere optimizaciones SRE reales (pooling, índices, etc.).
    `;

    // 3. Llamada a la IA (Usamos Gemini ya que está en Vercel)
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
            parts: [{ text: `${systemContext}\n\nUsuario: ${message}` }]
        }]
      })
    });

    const aiResult = await response.json();
    const sheriffResponse = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento Axel, mi conexión con el núcleo de Nexus está experimentando latencia. Intenta de nuevo.";

    return NextResponse.json({ response: sheriffResponse });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
