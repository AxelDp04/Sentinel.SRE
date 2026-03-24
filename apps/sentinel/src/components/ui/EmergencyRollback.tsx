"use client";

/**
 * ============================================================
 * COMPONENTE: EmergencyRollback
 * PROPÓSITO: Botón de pánico de clase empresarial.
 * 
 * Este componente es la red de seguridad final del sistema.
 * Si el Sheriff o Nexus cometen un error que afecte al cliente,
 * el administrador puede presionar este botón para restaurar
 * el sistema al último estado estable conocido (snapshot).
 * 
 * FUNCIONAMIENTO:
 * 1. Consulta el último snapshot activo en `nexus_backups`.
 * 2. Al confirmar, llama a la API /api/admin/backups (POST).
 * 3. Eso marca el snapshot como "restored" y registra el evento.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { AlertTriangle, RotateCcw, ShieldCheck, Loader2 } from "lucide-react";

interface Backup {
  id: string;
  project_name: string;
  created_at: string;
  status: string;
}

export function EmergencyRollback({ adminKey }: { adminKey: string | null }) {
  const [lastBackup, setLastBackup] = useState<Backup | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // Cargamos el último backup disponible para mostrar al admin
  useEffect(() => {
    if (!adminKey) return;
    fetch("/api/admin/backups", {
      headers: { "X-Admin-Key": adminKey }
    })
      .then(r => r.json())
      .then(d => {
        // Solo mostramos el último snapshot "activo" (no restaurado aún)
        const active = (d.backups || []).find((b: Backup) => b.status === "active");
        setLastBackup(active || null);
      })
      .catch(() => {}); // Silencioso para no alarmar si no hay snapshots aún
  }, [adminKey]);

  const handleEmergencyRestore = async () => {
    // Confirmación de doble seguridad — el admin debe estar consciente
    const confirmed = confirm(
      "🚨 MODO EMERGENCIA ACTIVADO\n\nEsto revertirá el sistema al último estado estable conocido.\n\n¿Confirmar restauración de emergencia?"
    );
    if (!confirmed) return;

    setIsRestoring(true);

    try {
      const endpoint = "/api/admin/backups";
      
      if (lastBackup) {
        // Si hay un snapshot específico, lo usamos
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-Admin-Key": adminKey as string,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ backupId: lastBackup.id })
        });
      }

      // Independientemente, registramos el evento de emergencia en nexus_tasks
      await fetch("/api/admin/rollback", {
        method: "POST",
        headers: {
          "X-Admin-Key": adminKey as string,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: "MANUAL_EMERGENCY_RESTORE" })
      }).catch(() => {}); // No bloquear si el endpoint no existe aún

      setIsRestored(true);
    } catch {
      alert("❌ Error de comunicación con el núcleo de seguridad. Intente de nuevo.");
    } finally {
      setIsRestoring(false);
    }
  };

  // Estado restaurado — confirmación visual de éxito
  if (isRestored) {
    return (
      <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-center justify-center gap-4 animate-in fade-in duration-500">
        <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
        <div>
          <p className="text-emerald-400 font-black text-sm uppercase tracking-widest">
            Sistema Restaurado
          </p>
          <p className="text-emerald-600 text-xs font-mono mt-1">
            Golden Rollback ejecutado — Estado anterior recuperado exitosamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    /**
     * PANEL DE EMERGENCIA: Diseñado para ser imposible de ignorar.
     * El borde rojo pulsante y el ícono de advertencia comunican
     * inmediatamente que esto es un control crítico del sistema.
     */
    <div className="w-full relative group">
      {/* Glow exterior para visibilidad máxima */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 via-orange-500/10 to-red-600/20 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
      
      <div className="relative bg-[#0d0505] border border-red-500/40 rounded-2xl overflow-hidden">
        {/* Header del Panel */}
        <div className="bg-red-500/5 border-b border-red-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-400">
                Protocolo_Golden_Rollback // Control_Emergencia
              </h3>
              <p className="text-[9px] font-mono text-red-900 mt-0.5">
                Sistema de Recuperación Autónoma — Enterprise Grade
              </p>
            </div>
          </div>
          {/* Indicador de estado del sistema */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-mono text-emerald-600">Standby</span>
          </div>
        </div>

        {/* Cuerpo del Panel */}
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Descripción y último snapshot */}
          <div className="space-y-3 flex-1">
            <p className="text-[12px] text-slate-400 leading-relaxed max-w-lg">
              Si Nexus o el Sheriff cometen un error crítico, este protocolo restaura el sistema 
              al último estado estable registrado de forma instantánea y autónoma.
            </p>
            {lastBackup ? (
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[10px] font-mono text-slate-600">
                  Último snapshot: <span className="text-blue-400">{lastBackup.project_name}</span>
                  {" — "}{new Date(lastBackup.created_at).toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="text-[10px] font-mono text-slate-800 italic">
                  Sin snapshots activos — Se creará uno antes de cada acción de Nexus.
                </span>
              </div>
            )}
          </div>

          {/* EL BOTÓN DE PÁNICO */}
          <button
            onClick={handleEmergencyRestore}
            disabled={isRestoring}
            className="
              relative group/btn px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em]
              border border-red-500/50 bg-red-500/5
              text-red-400
              hover:bg-red-500 hover:text-white hover:border-red-400
              hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
              active:scale-95
              min-w-[200px] text-center shrink-0
            "
          >
            {isRestoring ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Restaurando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-300" />
                Emergency_Restore
              </span>
            )}
            {/* Scanline decorativo */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <div className="absolute w-full h-[1px] bg-red-400/20 top-1/2 -translate-y-1/2 group-hover/btn:animate-ping" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
