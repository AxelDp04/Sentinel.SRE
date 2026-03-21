"use client";

import { useState, useEffect } from "react";
import { StatusCard } from "@/components/ui/StatusCard";
import { PROJECTS } from "@/constants/projects";
import { Shield, LayoutDashboard, Activity, Database } from "lucide-react";

interface ServiceHealth {
  status: "online" | "offline" | "checking";
  latency?: number;
}

export default function Home() {
  const [healthData, setHealthData] = useState<Record<string, ServiceHealth>>(
    PROJECTS.reduce((acc, project) => ({
      ...acc,
      [project.id]: { status: "checking" }
    }), {})
  );

  const checkHealth = async (id: string, url: string) => {
    try {
      const res = await fetch(`/api/proxy-check?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      
      setHealthData(prev => ({
        ...prev,
        [id]: { 
          status: data.status, 
          latency: data.latency 
        }
      }));
    } catch (e) {
      setHealthData(prev => ({
        ...prev,
        [id]: { status: "offline" }
      }));
    }
  };

  const updateAll = () => {
    PROJECTS.forEach(p => checkHealth(p.id, p.url));
  };

  useEffect(() => {
    updateAll();
    const interval = setInterval(updateAll, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-8 md:p-24 bg-[#020617] text-white selection:bg-sentinel/30">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sentinel/20 rounded-md ring-1 ring-sentinel/50">
              <Shield className="w-8 h-8 text-sentinel" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Sentinel <span className="text-sentinel">SRE</span>
            </h1>
          </div>
          <p className="text-slate-400 max-w-xl">
            Centro de mando avanzado para el monitoreo de infraestructura, 
            rendimiento y disponibilidad de aplicaciones críticas.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="glass px-4 py-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sentinel" />
            <span className="text-xs font-mono text-sentinel tracking-tighter">SYSTEM: OPTIMAL</span>
          </div>
          <div className="glass px-4 py-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-sentinel" />
            <span className="text-xs font-mono text-sentinel tracking-tighter">Uptime: 99.9%</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-6">
          <LayoutDashboard className="w-5 h-5 text-sentinel" />
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300">Health Radar</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <StatusCard
              key={project.id}
              name={project.name}
              description={project.description}
              status={healthData[project.id]?.status || "checking"}
              latency={healthData[project.id]?.latency}
              iconName={project.icon as any}
            />
          ))}
        </div>
      </section>

      {/* Future Modules Placeholder */}
      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
        <p>© 2026 Sentinel SRE - Dashboard de Ingeniería</p>
        <div className="flex gap-6 italic font-mono uppercase tracking-tighter">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sentinel/50 animate-pulse"></span>
            Telemetry: ACTIVE
          </span>
          <span>Latency Tracker: Pending</span>
          <span>Infra Map: Pending</span>
        </div>
      </footer>
    </main>
  );
}
