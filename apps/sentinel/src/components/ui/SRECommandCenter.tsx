"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, Shield, BarChart3, Clock, CheckCircle2 } from "lucide-react";

interface SREMetrics {
  sla: number;
  mttr: number;
  efficiency: number;
  totalIncidents: number;
}

export function SRECommandCenter({ adminKey }: { adminKey: string | null }) {
  const [metrics, setMetrics] = useState<SREMetrics>({
    sla: 99.9,
    mttr: 8.5,
    efficiency: 92,
    totalIncidents: 0
  });
  const [prevMetrics, setPrevMetrics] = useState<SREMetrics | null>(null);
  const [backups, setBackups] = useState<any[]>([]);

  useEffect(() => {
    if (!adminKey) return;

    async function fetchData() {
      try {
        // Fetch Metrics
        const res = await fetch("/api/admin/incidents", {
          headers: { "X-Admin-Key": adminKey as string }
        });
        const data = await res.json();
        const incidents = data.incidents || [];

        if (incidents.length > 0) {
          const successful = incidents.filter((i: any) => i.was_successful !== false).length;
          const slaValue = incidents.length > 0 ? (successful / incidents.length) * 100 : 99.9;
          const recoveryTimes = incidents.filter((i: any) => i.recovery_time > 0).map((i: any) => i.recovery_time);
          const avgMTTR = recoveryTimes.length > 0 ? recoveryTimes.reduce((a: number, b: number) => a + b, 0) / recoveryTimes.length : 8.13;
          const retries = incidents.reduce((a: number, b: any) => a + (b.retry_count || 0), 0);
          const efficiencyScore = Math.max(70, 100 - (retries * 2));

          const newMetrics = {
            sla: Number(slaValue.toFixed(2)),
            mttr: Number(avgMTTR.toFixed(2)),
            efficiency: efficiencyScore,
            totalIncidents: incidents.length
          };

          // Guardar métricas anteriores para detectar cambios
          setPrevMetrics(prev => prev || newMetrics);
          setMetrics(newMetrics);
        }

        // Fetch Backups
        const bRes = await fetch("/api/admin/backups", {
          headers: { "X-Admin-Key": adminKey as string }
        });
        const bData = await bRes.json();
        setBackups(bData.backups || []);

      } catch (err) {
        console.error("Error syncing SRE Data:", err);
      }
    }

    fetchData();
    // ✅ Intervalo de 5 segundos para métricas en tiempo real
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [adminKey]);

  const handleRollback = async (id: string) => {
    if (!confirm("🚨 ¿CONFIRMAR REVERSA? Esta acción anulará el último cambio del Sheriff.")) return;
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { 
            "X-Admin-Key": adminKey as string,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ backupId: id })
      });
      if (res.ok) alert("✅ Protocolo Golden Rollback Ejecutado: Sistema restaurado.");
    } catch (e) {
      alert("❌ Fallo en la comunicación con el núcleo de seguridad.");
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SLA RELIABILITY */}
        <div className="group relative bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:border-emerald-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Shield className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50">SLA_Reliability</span>
              </div>
              {/* Indicador live — pulsa en tiempo real */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-[8px] font-mono text-emerald-800">LIVE</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tracking-tighter transition-all duration-500 ${
                metrics.sla >= 95 ? "text-emerald-400" : metrics.sla >= 80 ? "text-yellow-400" : "text-red-400"
              }`}>{metrics.sla}%</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Synced</span>
            </div>
          </div>
        </div>

        {/* MTTR (RESILIENCE) */}
        <div className="group relative bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:border-blue-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Zap className="w-16 h-16 text-blue-500" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/50">Resilience_MTTR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                <span className="text-[8px] font-mono text-blue-900">LIVE</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tracking-tighter transition-all duration-500 ${
                metrics.mttr <= 5 ? "text-emerald-400" : metrics.mttr <= 15 ? "text-yellow-400" : "text-red-400"
              }`}>{metrics.mttr}s</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-glow">Nexus_Arms</span>
            </div>
          </div>
        </div>

        {/* EFFICIENCY SCORE */}
        <div className="group relative bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:border-purple-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <BarChart3 className="w-16 h-16 text-purple-500" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Activity className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/50">Core_Efficiency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_6px_rgba(192,132,252,0.8)]" />
                <span className="text-[8px] font-mono text-purple-900">LIVE</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tracking-tighter transition-all duration-500 ${
                metrics.efficiency >= 90 ? "text-emerald-400" : metrics.efficiency >= 75 ? "text-yellow-400" : "text-red-400"
              }`}>{metrics.efficiency}%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* GOLDEN ROLLBACK: SNAPSHOT VIEWER */}
      <div className="bg-[#0a0a0c] border border-blue-500/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
        <div className="bg-blue-500/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400/80">Golden_Rollback_Protocol // Snapshots</span>
            </div>
            <span className="text-[9px] font-mono text-slate-600">Active_Redundancy: ON</span>
        </div>
        <div className="p-4 space-y-2">
            {backups.length === 0 ? (
                <div className="py-10 text-center text-slate-800 font-mono text-[10px] uppercase tracking-widest italic">
                    Esperando primer despliegue autónomo...
                </div>
            ) : (
                backups.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] transition-colors group">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                                {new Date(b.created_at).toLocaleTimeString()} // {b.project_name}
                            </span>
                            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[200px] md:max-w-md">
                                {b.backup_payload?.description || "Snapshot de sistema íntegro."}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleRollback(b.id)}
                            disabled={b.status === 'restored'}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300
                                ${b.status === 'restored' 
                                    ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                                    : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white shadow-[0_4px_15px_rgba(239,68,68,0.1)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)]"}
                            `}
                        >
                            {b.status === 'restored' ? "Restored" : "Emergency_Undo"}
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* TIER 4 STATUS BAR */}
      <div className="flex justify-between items-center px-2 opacity-60">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">Tier 4 Ops Ready</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] font-mono text-slate-800 uppercase">SRE_TELEMETRY: SYNCED</span>
         </div>
         <div className="text-[10px] font-mono text-slate-900 uppercase tracking-[0.2em]">
            Incidents_Neutralized: {metrics.totalIncidents}
         </div>
      </div>
    </div>
  );
}
