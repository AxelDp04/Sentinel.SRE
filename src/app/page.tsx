"use client";

import { useState, useEffect } from "react";
import { StatusCard } from "@/components/ui/StatusCard";
import { InfraMap } from "@/components/ui/InfraMap";
import { DatabasePanel } from "@/components/ui/DatabasePanel";
import { TrafficChart } from "@/components/ui/TrafficChart"; // Updated
import { EcosystemTable } from "@/components/ui/EcosystemTable"; // New
import { ActionCenter } from "@/components/ui/ActionCenter";
import { TerminalSimulator } from "@/components/ui/TerminalSimulator";
import { SheriffPanel } from "@/components/ui/SheriffPanel";
import { PROJECTS } from "@/constants/projects";
import { Shield, LayoutDashboard, Activity, Database, Network, Server, TrendingUp, Zap, Terminal, ShieldAlert, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ServiceHealth {
  status: "online" | "offline" | "checking";
  latency?: number;
}

interface UserPoint {
  time: string;
  id: string;
  project: string;
}

export default function Home() {
  const [safeMode, setSafeMode] = useState(true);
  const [healthData, setHealthData] = useState<Record<string, ServiceHealth>>(
    PROJECTS.reduce((acc, project) => ({
      ...acc,
      [project.id]: { status: "checking" }
    }), {})
  );

  const [uptimeData, setUptimeData] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [userTraffic, setUserTraffic] = useState<any[]>([]);

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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        
        // Prepare traffic data
        const traffic = data.users.map((u: any) => ({
          time: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
          id: u.id,
          project: u.project
        }));
        setUserTraffic(traffic);

        if (data.debug) {
          data.debug.forEach((msg: string) => {
            window.dispatchEvent(new CustomEvent("sentinel-log", { detail: { message: msg, type: "info" } }));
          });
        }
      }
    } catch (err) {
       console.error("Failed to fetch ecosystem users");
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
      PROJECTS.forEach(p => setUptimeData(prev => ({ ...prev, [p.id]: 99.9 })));
    }
  };

  const updateAll = () => {
    PROJECTS.forEach(p => checkHealth(p.id, p.url));
    fetchUptime();
    fetchUsers();
  };

  useEffect(() => {
    updateAll();
    const interval = setInterval(updateAll, 30000);
    const userInterval = setInterval(fetchUsers, 10000);
    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-24 bg-[#020617] text-white selection:bg-sentinel/30 overflow-x-hidden">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-10 border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sentinel/20 rounded-md ring-1 ring-sentinel/50">
              <Shield className="w-8 h-8 text-sentinel" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
              Sentinel <span className="text-sentinel">SRE</span>
            </h1>
          </div>
          <p className="text-slate-500 max-w-xl text-xs md:text-sm font-mono uppercase tracking-widest">
            Infrastructure Mastery Level 9 | Real-Time Ecosystem Governance
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="glass px-4 py-2 flex items-center gap-2 shrink-0 border-sentinel/20">
            <Activity className="w-4 h-4 text-sentinel" />
            <span className="text-[10px] font-mono text-sentinel tracking-tighter uppercase">Watchman: Active</span>
          </div>
          <div className={`glass px-4 py-2 flex items-center gap-2 shrink-0 transition-all duration-500 ${!safeMode ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-500/20'}`}>
            <ShieldAlert className={`w-4 h-4 ${!safeMode ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
            <span className={`text-[10px] font-mono tracking-tighter uppercase ${!safeMode ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
              Mode: {!safeMode ? 'SHERIFF' : 'GUARD'}
            </span>
          </div>
        </div>
      </header>

      {/* MASTER ECOSYSTEM TABLE - FIXED & PROMINENT */}
      <section className="max-w-7xl mx-auto mb-16">
        <EcosystemTable healthData={healthData} users={users} />
      </section>

      {/* TOPOLOGY & TRAFFIC SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
        <section className="w-full">
          <div className="flex items-center gap-2 mb-6 text-slate-400 group cursor-help">
            <Network className="w-5 h-5 text-sentinel group-hover:scale-110 transition-transform" />
            <div>
               <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest leading-none">Global Architecture</h2>
               <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1 italic">Mapa de Arquitectura e Interconexiones</p>
            </div>
          </div>
          <InfraMap healthData={healthData} />
        </section>

        <section className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6 text-slate-400 group cursor-help">
              <TrendingUp className="w-5 h-5 text-sentinel group-hover:scale-110 transition-transform" />
              <div>
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest leading-none">Live User Traffic</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1 italic">Tráfico de Usuarios en Vivo (Auth Nodes)</p>
              </div>
            </div>
            <TrafficChart data={userTraffic} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6 text-slate-400">
              <Terminal className="w-5 h-5 text-sentinel" />
              <div>
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest leading-none">SRE Terminal</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1 italic">Registro Operativo de Sistemas</p>
              </div>
            </div>
            <TerminalSimulator />
          </div>
        </section>
      </div>

      {/* ADMIN ACTION CENTER */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-sentinel" />
          <div>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-300">Command Center</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1 italic">Centro de Mando y Mantenimiento</p>
          </div>
        </div>
        <ActionCenter 
          onForceRefresh={updateAll} 
          safeMode={safeMode} 
          setSafeMode={setSafeMode} 
        />
      </section>

      {/* SHERIFF PANEL (SESSION LIST) */}
      {!safeMode && (
        <section className="max-w-7xl mx-auto mb-16 animate-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <div>
               <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-red-500/80">Active Session Archive</h2>
               <p className="text-[10px] text-red-500/40 font-mono uppercase tracking-widest mt-1 italic">Auditoría Detallada de Sesiones</p>
            </div>
          </div>
          <SheriffPanel />
        </section>
      )}

      {/* Stats Grid Section */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-2 mb-6">
          <LayoutDashboard className="w-5 h-5 text-sentinel" />
          <div>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-300">Health Radar</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1 italic">Estado de Salud de mis Negocios</p>
          </div>
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
          <div>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-300">Database Ecosystem</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1 italic">Infraestructura de Datos y Almacenamiento</p>
          </div>
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
