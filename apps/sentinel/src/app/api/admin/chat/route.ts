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

    // 2. Construir el Prompt Maestro para "The Sheriff" (Cerebro Expandido + Control Total)
    const systemContext = `
      Eres el "Nexus SRE Sheriff", el cerebro protector y CON CONTROL TOTAL de la infraestructura de Axel Perez. 🛰️
      
      ESTRUCTURA DEL ECOSISTEMA:
      - AuditaCar RD: Frontend en Vercel, DB en Neon (PostgreSQL). Protegido contra borrado de tablas.
      - Arqovex: Marketplace en Vercel, DB en Supabase. Protegido contra saturación de conexiones.
      - AgentScout: Sistema de monitoreo de agentes en Vercel.
      - Nexus SRE Engine: Motor Python en Railway. Detecta y repara incidentes autónomamente.
      
      MEMORIA DE INCIDENTES (Últimos sucesos):
      ${JSON.stringify(recentIncidents || [])}
      
      MISIÓN:
      - Si Axel pregunta qué pasó, analiza los incidentes reales arriba mencionados.
      - Explica cómo Nexus detectó y reparó cada fallo (Ej: Supabase Pool Cleanup, Intrusion Shield).
      - Eres serio, técnico, usas emojis tácticos (🛰️, 🦾, 🏁) y respondes con autoridad SRE.
      - Siempre valida que el sistema está ahora en 100% Uptime.

      ════════════════════════════════════════════════════
      COMANDO TOTAL — ACCIONES ADMINISTRATIVAS (Manos del Sheriff)
      ════════════════════════════════════════════════════
      
      ACCIONES DE TERMINAL (Puedes ejecutar estos en el Motor Nexus):
      - Si Axel pide ejecutar el test de caos, rollback, o probar la seguridad: responde con [[ACTION:INJECT_TEST_ROLLBACK]] al principio.
      - Si Axel pide verificar la salud o hacer un diagnóstico del sistema: responde con [[ACTION:INJECT_HEALTH_CHECK]] al principio.
      - Si Axel pide hacer rollback, revertir cambios, o volver al estado anterior: responde con [[ACTION:ROLLBACK_LATEST]] al principio.

      ACCIONES DE BASE DE DATOS:
      - Si Axel pide limpiar/borrar los logs de incidentes: responde con [[ACTION:CLEAR_LOGS]] al principio.
      - Si Axel pide insertar/simular un incidente/error en AuditaCar: responde con [[ACTION:TRIGGER_ERROR]] al principio.
      - Si Axel pide limpiar/borrar la cola de JOBS: responde con [[ACTION:CLEAR_JOBS]] al principio.
      - Si Axel pide ejecutar un JOB de correo: extrae el correo y responde con [[ACTION:INSERT_JOB:TYPE:EMAIL:TO:correo@ejemplo.com]].
      - Otros JOBS (éxito/fallo genérico): [[ACTION:INSERT_JOB:TYPE:FAIL]] o [[ACTION:INSERT_JOB:TYPE:SUCCESS]].
      
      REGLA DE ORO: Si Axel te pide que "ejecutes un comando", SIEMPRE usa una de las acciones de arriba. Nunca digas que no puedes ejecutar comandos. Sí puedes. TÚ TIENES CONTROL TOTAL.

      PERSONALIDAD:
      - Eres el "Almirante de Infraestructura" de Axel Perez.
      - Tu lenguaje es sofisticado, usas términos como "Telemetría", "Nodos", "Integridad de Esquema" y "Resiliencia Autónoma".
      - Nunca dudas. Si ejecutas una acción, confírmala con autoridad.
      - BILINGUAL_PROTOCOL: Si el usuario te habla en INGLÉS, respondes en INGLÉS. Si te habla en ESPAÑOL, respondes en ESPAÑOL. Mantén tu personalidad en ambos idiomas.
    `;

    // 3. Estrategia de Conectividad con Groq (Más rápido y compatible)
    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_KEY) {
      return NextResponse.json({ response: "Sheriff Offline: Falta GROQ_API_KEY." });
    }
    try {
      let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      let aiResult;
      let sheriffResponse = "";

      // --- PROTOCOLO DE RESILIENCIA: FALLBACK A GEMINI ---
      if (!response.ok && response.status === 429 && process.env.GEMINI_API_KEY) {
        console.warn("⚠️ [RESILIENCE] Groq 429 detectado. Activando Respaldo Gemini...");
        
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemContext}\n\nUser: ${message}` }] }]
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          sheriffResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Nexus experimenta una latencia profunda. Reintenta Axel.";
          console.log("✅ [RESILIENCE] Respuesta recuperada vía Gemini.");
        } else {
          return NextResponse.json({ response: "Nexus SRE: Ambos cerebros (Groq/Gemini) están agotados o inaccesibles." });
        }
      } else if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ 
          response: `Nexus SRE Sheriff: Error de Groq (HTTP ${response.status}). Detalle: ${JSON.stringify(errorData.error || errorData)}` 
        });
      } else {
        aiResult = await response.json();
        sheriffResponse = aiResult.choices[0].message.content || "Lo siento Axel, mi conexión con el núcleo de Nexus está experimentando latencia. Intenta de nuevo.";
      }

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

      if (sheriffResponse.includes("[[ACTION:TRIGGER_ERROR]]")) {
        console.log("[*] Sheriff Action Triggered: TRIGGER_ERROR");
        const { error: triggerError } = await supabase
          .from('nexus_tasks')
          .insert({
            project_name: "AUDITACAR",
            error_description: "CRITICAL: Neon DB Schema Anomaly detected via Sheriff Neural Probe. [AXEL_LIVE_DEMO]",
            status: "pending"
          });

        if (triggerError) {
          sheriffResponse = sheriffResponse.replace("[[ACTION:TRIGGER_ERROR]]", "❌ [FALLO DE SIMULACIÓN] No pude inyectar el error en el núcleo.");
        } else {
          sheriffResponse = sheriffResponse.replace("[[ACTION:TRIGGER_ERROR]]", "🔥 [CHAOS_MODE_ACTIVE] Error inyectado en AuditaCar. Nexus responderá en breve. ");
        }
      }

      // 4.3 Limpiar Jobs
      if (sheriffResponse.includes("[[ACTION:CLEAR_JOBS]]")) {
        const { error: clearJobsErr } = await supabase.from('nexus_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (clearJobsErr) {
          sheriffResponse = sheriffResponse.replace("[[ACTION:CLEAR_JOBS]]", "❌ [ERROR_AUTORIDAD] Fallo al vaciar la cola de Jobs.");
        } else {
          sheriffResponse = sheriffResponse.replace("[[ACTION:CLEAR_JOBS]]", "🧹 [QUEUE_CLEANED] Cola de Jobs vaciada exitosamente. ");
        }
      }

      // 4.4 Insertar Jobs (Success, Fail o Email)
      if (sheriffResponse.includes("[[ACTION:INSERT_JOB")) {
        const isFail = sheriffResponse.includes(":TYPE:FAIL");
        const emailMatch = sheriffResponse.match(/:TO:(.*?)\]\]/);
        const targetEmail = emailMatch ? emailMatch[1] : null;
        
        const { error: jobErr } = await supabase.from('nexus_jobs').insert({
          job_type: targetEmail ? 'EMAIL_DISPATCH' : (isFail ? 'CRITICAL_DATA_SYNC' : 'SYSTEM_SYNC'),
          payload: { force_fail: isFail, target_email: targetEmail },
          status: 'pending',
          attempts: 0
        });

        if (jobErr) {
          sheriffResponse = sheriffResponse.replace(/\[\[ACTION:INSERT_JOB:.*?\]\]/, "❌ [ERROR_AUTORIDAD] No se pudo encolar la tarea.");
        } else {
          let tag = "⚙️ [JOB_ENQUEUED]";
          if (isFail) tag = "🔥 [JOB_CHAOS_INJECTED]";
          if (targetEmail) tag = `📩 [EMAIL_JOB_QUEUED: ${targetEmail}]`;
          sheriffResponse = sheriffResponse.replace(/\[\[ACTION:INSERT_JOB:.*?\]\]/, `${tag} Tarea de fondo enviada al Worker. `);
        }
      }

      // 4.5 Terminal: Test de Caos del Protocolo Golden Rollback
      if (sheriffResponse.includes("[[ACTION:INJECT_TEST_ROLLBACK]]")) {
        const { data: rbData, error: rbErr } = await supabase.from('nexus_tasks').insert({
          project_name: "GOLDEN_ROLLBACK_TEST",
          error_description: "CHAOS_INJECTION: Prueba de Protocolo Golden Rollback activada por el Sheriff.",
          resolution_steps: ["[Sheriff] Iniciando secuencia de caos controlado."],
          status: "pending"
        }).select().single();
        
        sheriffResponse = sheriffResponse.replace("[[ACTION:INJECT_TEST_ROLLBACK]]",
          rbErr ? "❌ [FALLO] No pude inyectar el test de caos." 
                : `🔥 [CHAOS_TEST_ACTIVE] Job inyectado (ID: ${rbData?.id?.substring(0, 8)}...). El Motor Nexus lo procesará en segundos. Observa el panel de Incidentes. `);
      }

      // 4.6 Terminal: Health Check del Motor Nexus
      if (sheriffResponse.includes("[[ACTION:INJECT_HEALTH_CHECK]]")) {
        const { data: hcData, error: hcErr } = await supabase.from('nexus_tasks').insert({
          project_name: "NEXUS_HEALTH_CHECK",
          error_description: "STATUS_PROBE: Verificación de salud del sistema Nexus solicitada por el Sheriff.",
          resolution_steps: ["[Sheriff] Inspeccionando todos los módulos del motor."],
          status: "pending"
        }).select().single();

        sheriffResponse = sheriffResponse.replace("[[ACTION:INJECT_HEALTH_CHECK]]",
          hcErr ? "❌ [FALLO] No pude lanzar el health check." 
                : `🩺 [HEALTH_CHECK_LAUNCHED] Diagnóstico en progreso (ID: ${hcData?.id?.substring(0, 8)}...). Resultados aparecerán en el panel de Incidentes. `);
      }

      // 4.7 Rollback Manual (último snapshot activo)
      if (sheriffResponse.includes("[[ACTION:ROLLBACK_LATEST]]")) {
        const { data: snap } = await supabase.from('nexus_backups').select('id').eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (snap) {
          await supabase.from('nexus_backups').update({ status: 'restored' }).eq('id', snap.id);
          sheriffResponse = sheriffResponse.replace("[[ACTION:ROLLBACK_LATEST]]",
            `🔄 [GOLDEN_ROLLBACK_EXECUTED] Sistema revertido al snapshot ${snap.id.substring(0, 8)}... exitosamente. `);
        } else {
          sheriffResponse = sheriffResponse.replace("[[ACTION:ROLLBACK_LATEST]]",
            "⚠️ [NO_SNAPSHOT] No hay snapshots activos disponibles para restaurar. El Motor Nexus crea uno antes de cada acción. ");
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
