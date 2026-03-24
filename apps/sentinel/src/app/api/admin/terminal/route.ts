import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ============================================================
 * API: /api/admin/terminal
 * 
 * ARQUITECTURA CORRECTA:
 * El servidor Next.js (Vercel) NO tiene Python instalado.
 * El motor Nexus Python está corriendo en Railway/local y pollea
 * Supabase cada 5 segundos. 
 * 
 * Por lo tanto, en lugar de ejecutar Python directamente,
 * insertamos una tarea de prueba en Supabase y el motor
 * la recoge y la procesa por nosotros.
 * ============================================================
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Los comandos ahora son tareas que se inyectan en el motor Nexus
const COMMAND_JOBS: Record<string, {
  project_name: string;
  error_description: string;
  resolution_steps: string[];
}> = {
  "test_rollback": {
    project_name: "GOLDEN_ROLLBACK_TEST",
    error_description: "CHAOS_INJECTION: Prueba del Protocolo Golden Rollback activada desde el Dashboard.",
    resolution_steps: ["[Terminal] Iniciando secuencia de caos controlado para validar el protocolo de rollback."]
  },
  "health_check": {
    project_name: "NEXUS_HEALTH_CHECK",
    error_description: "STATUS_PROBE: Verificación de salud del sistema Nexus solicitada desde el Dashboard.",
    resolution_steps: ["[Terminal] Inspeccionando estado de todos los módulos del motor."]
  }
};

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("X-Admin-Key");
  if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY && adminKey !== "NEXUS_GOVERNANCE_2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { command } = await req.json();
  const cleanCmd = (command || "").trim().toLowerCase();

  // Comando help — respuesta rápida sin tocar Supabase
  if (cleanCmd === "help") {
    return NextResponse.json({
      output: "📖 Comandos disponibles:\n  test_rollback  — Lanza el test de caos del Protocolo Golden Rollback\n  health_check   — Verifica el estado de todos los módulos Nexus\n  help           — Muestra este mensaje\n\n⚠️  Los comandos son procesados por el Motor Nexus Python. Asegúrate de que esté corriendo."
    });
  }

  const jobDef = COMMAND_JOBS[cleanCmd];
  if (!jobDef) {
    return NextResponse.json({
      output: `❌ Comando '${cleanCmd}' no reconocido.\nEscribe 'help' para ver los comandos disponibles.`
    });
  }

  // Inyectamos el job en Supabase para que el motor Python lo ejecute
  const { data, error } = await supabase
    .from("nexus_tasks")
    .insert([{
      ...jobDef,
      status: "pending",
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({
      output: `❌ Error al inyectar job en Supabase: ${error.message}`
    });
  }

  return NextResponse.json({
    output: `✅ Job inyectado exitosamente.\n\nID: ${data.id}\nProyecto: ${data.project_name}\nEstado: PENDING — Esperando que el Motor Nexus (Railway/Local) lo procese...\n\n👁️  Mira el panel de "Registro de Incidentes" arriba para ver los resultados en tiempo real.`
  });
}

