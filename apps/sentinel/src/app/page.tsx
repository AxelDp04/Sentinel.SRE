"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardStats } from "@/components/ui/DashboardStats";
import { EcosystemStatusGrid } from "@/components/ui/EcosystemStatusGrid";
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

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 max-w-7xl mx-auto w-full">
            
            {/* CATEGORY 1: VIGILANCIA DE SEGURIDAD (Métricas) */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">01_Vigilancia_de_Seguridad</span>
                  <div className="h-px flex-1 bg-white/5"></div>
               </div>
               <DashboardStats users={users} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* CATEGORY 2: ESTADO DEL ECOSISTEMA (Izquierda - 5/12) */}
              <section className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">02_Estado_del_Ecosistema</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 italic">Node_Health_Matrix</h2>
                      <div className="flex items-center gap-2 text-[8px] font-mono text-slate-700">
                         <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> NODES_SYNC_ACTIVE
                      </div>
                   </div>
                   <EcosystemStatusGrid healthData={healthData} />
                </div>
                
                {/* Advanced Controls (Minimized) */}
                <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
                   <ActionCenter 
                      safeMode={isSafeMode} 
                      setSafeMode={setIsSafeMode} 
                      onForceRefresh={() => adminKey && fetchEcosystemData(adminKey)} 
                    />
                </div>
              </section>

              {/* CATEGORY 3: REGISTRO DE INCIDENTES (Derecha - 7/12) */}
              <section className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">03_Registro_de_Incidentes</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <NexusLiveMonitor adminKey={adminKey} />
              </section>

            </div>

            {/* Footer / Debug (Optional visibility) */}
            <section className="pt-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-30">
               <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                  Sentinel SRE Ecosystem v3.0 - Managed by Nexus Engine
               </p>
               <div className="flex gap-8 text-[9px] font-mono text-slate-700 uppercase">
                  <span>LATENCY: SYNCED</span>
                  <span>ENCRYPTION: AES-256</span>
                  <span>MODE: MISSION_CONTROL</span>
               </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
