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

    // 2. Construir el Prompt Maestro para "The Sheriff"
    const systemContext = `
      Eres el "Nexus SRE Sheriff", un experto en operaciones de clase mundial.
      
      CONTEXTO ACTUAL DEL SISTEMA:
      - Proyectos: AuditaCar (Neon), Arqovex (Supabase), AgentScout (Vercel).
      - Incidentes Recientes: ${JSON.stringify(recentIncidents || [])}
      
      INSTRUCCIONES:
      - Responde en español de forma concisa y técnica.
      - Si te preguntan por fallos, usa los datos de 'Incidentes Recientes'.
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
      const errorData = await response.text();
      console.error("Sheriff_Gemini_API_Error:", errorData);
      return NextResponse.json({ response: "Nexus SRE Sheriff: Error de comunicación con el núcleo de lenguaje." });
    }

    const aiResult = await response.json();
    const sheriffResponse = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento Axel, mi conexión con el núcleo de Nexus está experimentando latencia. Intenta de nuevo.";

    return NextResponse.json({ response: sheriffResponse });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
