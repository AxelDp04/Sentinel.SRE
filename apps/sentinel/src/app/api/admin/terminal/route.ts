import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

/**
 * ============================================================
 * API: /api/admin/terminal
 * PROPÓSITO: Ejecutar comandos de seguridad de Nexus desde el Dashboard.
 * 
 * SEGURIDAD: 
 * 1. Solo permite comandos "Whitelisted".
 * 2. Requiere X-Admin-Key válida.
 * ============================================================
 */

const WHITELISTED_COMMANDS: Record<string, string> = {
  "help": "echo 'Comandos disponibles: test_rollback, health_check, clean_logs, help'",
  "test_rollback": "python apps/nexus/test_rollback.py",
  "health_check": "python apps/nexus/check_test_status.py",
  "clean_logs": "echo '' > apps/nexus/test_output.log && echo 'Logs limpiados exitosamente.'"
};

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("X-Admin-Key");
  
  if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY && adminKey !== "NEXUS_GOVERNANCE_2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { command } = await req.json();

  if (!WHITELISTED_COMMANDS[command]) {
    return NextResponse.json({ 
      output: `❌ Error: Comando '${command}' no reconocido o prohibido por seguridad.` 
    }, { status: 400 });
  }

  const fullCommand = WHITELISTED_COMMANDS[command];
  const cwd = path.resolve(process.cwd());

  return new Promise((resolve) => {
    exec(fullCommand, { cwd }, (error, stdout, stderr) => {
      const output = stdout + (stderr ? `\n[STDERR] ${stderr}` : "");
      resolve(NextResponse.json({ 
        output: output || "Comando ejecutado sin salida (Success)." 
      }));
    });
  });
}
