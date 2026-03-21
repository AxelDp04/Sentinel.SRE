"use client";

import { useState, useEffect } from "react";
import { StatusCard } from "@/components/ui/StatusCard";
import { InfraMap } from "@/components/ui/InfraMap";
import { DatabasePanel } from "@/components/ui/DatabasePanel";
import { LatencyChart } from "@/components/ui/LatencyChart";
import { ActionCenter } from "@/components/ui/ActionCenter";
import { TerminalSimulator } from "@/components/ui/TerminalSimulator";
import { PROJECTS } from "@/constants/projects";
import { Shield, LayoutDashboard, Activity, Database, Network, Server, TrendingUp, Zap, Terminal } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ServiceHealth {
  status: "online" | "offline" | "checking";
  latency?: number;
}

interface LatencyPoint {
  time: string;
  latency: number;
  service: string;
}

export default function Home() {
  const [healthData, setHealthData] = useState<Record<string, ServiceHealth>>(
    PROJECTS.reduce((acc, project) => ({
      ...acc,
      [project.id]: { status: "checking" }
    }), {})
  );

  const [uptimeData, setUptimeData] = useState<Record<string, number>>({});
  const [latencyHistory, setLatencyHistory] = useState<LatencyPoint[]>([]);

  const checkHealth = async (id: string, url: string) => {
    try {
      const res = await fetch(`/api/proxy-check?url=${encodeURIComponent(url)}&id=${id}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      
      setHealthData(prev => ({
        ...prev,
        [id]: { 
          status: data.status, 
          latency: data.latency 
        }
      }));

      window.dispatchEvent(new CustomEvent("sentinel-log", { 
        detail: { message: `PING [${id.toUpperCase()}]: ${data.latency}ms - ${data.status.toUpperCase()}`, type: data.status === "online" ? "success" : "error" } 
      }));

    } catch {
      setHealthData(prev => ({
        ...prev,
        [id]: { status: "offline" }
      }));
      window.dispatchEvent(new CustomEvent("sentinel-log", { 
        detail: { message: `PING [${id.toUpperCase()}]: FAILED (OFFLINE)`, type: "error" } 
      }));
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("service_logs")
        .select("service_id, latency, created_at")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error || !data) throw new Error(error?.message || "No data");

      const formattedData: LatencyPoint[] = data.map(log => ({
        time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: log.latency,
        service: log.service_id
      }));

      setLatencyHistory(formattedData);
    } catch {
      // Mock Data Fallback for Build/Failure
      const mockPoints = [
        { time: "12:00", latency: 45, service: "arqovex" },
        { time: "13:00", latency: 62, service: "auditacar" },
        { time: "14:00", latency: 55, service: "agentscout" },
      ];
      setLatencyHistory(mockPoints);
    }
  };

  const fetchUptime = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("service_logs")
        .select("service_id, status")
        .gte("created_at", twentyFourHoursAgo);

      if (error || !data) throw new Error(error?.message || "No data");

      const stats: Record<string, { total: number; online: number }> = {};
      data.forEach(log => {
        if (!stats[log.service_id]) stats[log.service_id] = { total: 0, online: 0 };
        stats[log.service_id].total++;
        if (log.status === "online") stats[log.service_id].online++;
      });

      const calculatedUptime: Record<string, number> = {};
      PROJECTS.forEach(project => {
        const s = stats[project.id];
        calculatedUptime[project.id] = s ? (s.online / s.total) * 100 : 99.9;
      });

      setUptimeData(calculatedUptime);
    } catch {
      // Mock Uptime Fallback
      PROJECTS.forEach(p => {
        setUptimeData(prev => ({ ...prev, [p.id]: 99.9 }));
      });
    }
  };

  const updateAll = () => {
    PROJECTS.forEach(p => checkHealth(p.id, p.url));
    fetchUptime();
    fetchHistory();
  };

  useEffect(() => {
    updateAll();
    const interval = setInterval(updateAll, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-24 bg-[#020617] text-white selection:bg-sentinel/30 overflow-x-hidden">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sentinel/20 rounded-md ring-1 ring-sentinel/50">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-sentinel" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">
              Sentinel <span className="text-sentinel">SRE</span>
            </h1>
          </div>
          <p className="text-slate-400 max-w-xl text-sm md:text-base">
            Centro de mando avanzado para el monitoreo de infraestructura, 
            rendimiento y disponibilidad de aplicaciones críticas.
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="glass px-4 py-2 flex items-center gap-2 shrink-0">
            <Activity className="w-4 h-4 text-sentinel" />
            <span className="text-[10px] font-mono text-sentinel tracking-tighter uppercase">Watchman: Active</span>
          </div>
          <div className="glass px-4 py-2 flex items-center gap-2 shrink-0">
            <Database className="w-4 h-4 text-sentinel" />
            <span className="text-[10px] font-mono text-sentinel tracking-tighter uppercase">Sync: Optimal</span>
          </div>
        </div>
      </header>

      {/* TOPOLOGY & TRENDS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
        <section className="w-full h-full min-h-[400px]">
          <div className="flex items-center gap-2 mb-6 text-slate-400 group cursor-help">
            <Network className="w-5 h-5 text-sentinel group-hover:scale-110 transition-transform" />
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest leading-none">Global Architecture</h2>
          </div>
          <InfraMap healthData={healthData} />
        </section>

        <section className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6 text-slate-400 group cursor-help">
              <TrendingUp className="w-5 h-5 text-sentinel group-hover:scale-110 transition-transform" />
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest leading-none">Latency Trends</h2>
            </div>
            <LatencyChart data={latencyHistory} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6 text-slate-400">
              <Terminal className="w-5 h-5 text-sentinel" />
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest leading-none">SRE Terminal</h2>
            </div>
            <TerminalSimulator />
          </div>
        </section>
      </div>

      {/* ADMIN ACTION CENTER */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-sentinel" />
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-300">Command Center</h2>
        </div>
        <ActionCenter onForceRefresh={updateAll} />
      </section>

      {/* Stats Grid Section */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-2 mb-6">
          <LayoutDashboard className="w-5 h-5 text-sentinel" />
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-300">Health Radar</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <StatusCard
              key={project.id}
              name={project.name}
              description={project.description}
              status={healthData[project.id]?.status || "checking"}
              latency={healthData[project.id]?.latency}
              uptime={uptimeData[project.id]}
              iconName={project.icon}
            />
          ))}
        </div>
      </section>

      {/* INFRASTRUCTURE DEEP DIVE */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Server className="w-5 h-5 text-sentinel" />
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-300">Database Ecosystem</h2>
        </div>
        <DatabasePanel healthData={healthData} />
      </section>

      {/* Footer Section */}
      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs md:text-sm text-center md:text-left">
        <p>© 2026 Sentinel SRE - Ecosystem Engineering</p>
        <div className="flex flex-wrap justify-center md:justify-end gap-6 italic font-mono uppercase tracking-tighter">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sentinel/50 animate-pulse"></span>
            Telemetry: ACTIVE
          </span>
          <span>Watchman: Autonomous</span>
          <span>Security: Level_7</span>
        </div>
      </footer>
    </main>
  );
}
