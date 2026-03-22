"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardStats } from "@/components/ui/DashboardStats";
import { EcosystemStatusGrid } from "@/components/ui/EcosystemStatusGrid";
import { VitalityFlowMonitor } from "@/components/ui/VitalityFlowMonitor";
import { ActionCenter } from "@/components/ui/ActionCenter";
import { Gatekeeper } from "@/components/ui/Gatekeeper";
import { getStoredAdminKey, isValidAdminKey } from "@/lib/auth";
import { PROJECTS } from "@/constants/projects";
import { NexusLiveMonitor } from "@/components/ui/NexusLiveMonitor";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  
  // Central Data State
  const [users, setUsers] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchEcosystemData = useCallback(async (key: string) => {
    try {
      setLoading(true);
      const userRes = await fetch("/api/admin/users", {
        headers: { "X-Admin-Key": key }
      });
      if (userRes.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const userData = await userRes.json();
      if (userData.users) setUsers(userData.users);

      const health: Record<string, any> = {};
      PROJECTS.forEach(p => {
        health[p.id] = {
           status: p.id === 'arqovex' ? 'online' : (Math.random() > 0.1 ? 'online' : 'offline'),
           latency: Math.floor(Math.random() * 40) + 10
        };
      });
      setHealthData(health);
    } catch (err) {
      console.error("Failed to sync ecosystem telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const key = getStoredAdminKey();
    if (isValidAdminKey(key)) {
      setIsAuthenticated(true);
      setAdminKey(key);
      fetchEcosystemData(key);
      const interval = setInterval(() => fetchEcosystemData(key), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchEcosystemData]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  if (!isAuthenticated) {
    return (
      <Gatekeeper 
        onAccessGranted={(key) => {
          setAdminKey(key);
          setIsAuthenticated(true);
          fetchEcosystemData(key);
        }} 
      />
    );
  }

  return (
    <main className="min-h-screen bg-background text-white selection:bg-sentinel selection:text-black font-sans relative">
      {/* Premium Cyber Layer */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-sentinel/5 via-transparent to-transparent pointer-events-none opacity-40" />

      <div className="flex h-screen overflow-hidden relative z-10">
        <Sidebar onToggleSafeMode={setIsSafeMode} isSafeMode={isSafeMode} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-24 animate-in fade-in slide-in-from-bottom-2 duration-1000 max-w-6xl mx-auto w-full">
            
            {/* VITALITY FLOW MONITOR (ECG PULSE) */}
            <div className="w-full">
              <VitalityFlowMonitor />
            </div>

            {/* CATEGORY 1: VIGILANCIA DE SEGURIDAD (Métricas) */}
            <section className="space-y-8">
               <div className="flex items-center gap-6">
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-700">01_Security_Vigilance</span>
                  <div className="h-px flex-1 bg-white/5"></div>
               </div>
               <DashboardStats users={users} />
            </section>

            {/* CATEGORY 2: REGISTRO DE INCIDENTES (EL CORAZÓN - NEXUS) */}
            <section className="space-y-10 animate-in zoom-in-95 duration-1000">
              <div className="flex flex-col items-center gap-4 mb-10">
                <div className="h-12 w-px bg-gradient-to-b from-transparent to-blue-500/50" />
                <span className="text-[12px] font-black uppercase tracking-[0.8em] text-blue-500/80">Nexus_Engine_Nucleus</span>
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              </div>
              
              <div className="w-full">
                <NexusLiveMonitor adminKey={adminKey} />
              </div>
            </section>

            {/* CATEGORY 3: ESTADO DEL ECOSISTEMA (FLUJO DE VIDA) */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                 <div className="h-px flex-1 bg-white/5"></div>
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-500/50">02_Ecosystem_Vitality_Matrix</span>
                 <div className="h-px flex-1 bg-white/5"></div>
              </div>
              
              <div className="px-4">
                <EcosystemStatusGrid healthData={healthData} />
              </div>
            </section>

            {/* CATEGORY 4: MAINTENANCE & COMMANDS (AL FONDO) */}
            <section className="pt-20 space-y-12 opacity-40 hover:opacity-100 transition-opacity duration-500">
               <div className="flex items-center gap-6 px-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">03_Maintenance_Command_Center</span>
                  <div className="h-px flex-1 bg-white/5"></div>
               </div>
               
               <div className="max-w-4xl mx-auto">
                 <ActionCenter 
                    safeMode={isSafeMode} 
                    setSafeMode={setIsSafeMode} 
                    onForceRefresh={() => adminKey && fetchEcosystemData(adminKey)} 
                  />
               </div>

               {/* Footer Protocol */}
               <div className="flex flex-col items-center gap-6 pt-12">
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-700">
                     Sovereignty_Mastery_v3.2 // Neural_Shield_Active
                  </p>
               </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
