import { StatusCard } from "@/components/ui/StatusCard";
import { PROJECTS } from "@/constants/projects";
import { Shield, LayoutDashboard, Activity, Database } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-24 bg-[#020617] text-white">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sentinel/20 rounded-md">
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
            <span className="text-xs font-mono text-sentinel">SYSTEM: OPTIMAL</span>
          </div>
          <div className="glass px-4 py-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-sentinel" />
            <span className="text-xs font-mono text-sentinel">Uptime: 99.9%</span>
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
              status={project.id === "arqovex" ? "online" : "checking"}
              latency={project.id === "arqovex" ? 42 : undefined}
              iconName={project.icon}
            />
          ))}
        </div>
      </section>

      {/* Future Modules Placeholder */}
      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
        <p>© 2026 Sentinel SRE - Dashboard de Ingeniería</p>
        <div className="flex gap-6 italic font-mono uppercase tracking-tighter">
          <span>Latency Tracker: Pending</span>
          <span>Infra Map: Pending</span>
        </div>
      </footer>
    </main>
  );
}
