"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardStats } from "@/components/ui/DashboardStats";
import { HealthRadar } from "@/components/ui/HealthRadar";
import { ServiceStatus } from "@/components/ui/ServiceStatus";
import { ActionCenter } from "@/components/ui/ActionCenter";
import { SafeModeLock } from "@/components/ui/SafeModeLock";
import { SheriffPanel } from "@/components/ui/SheriffPanel";
import { EcosystemTable } from "@/components/ui/EcosystemTable";
import { TrafficChart } from "@/components/ui/TrafficChart";
import { TermDebug } from "@/components/ui/TermDebug";
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

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            
            {/* 1. Tactical Intelligence Layer (Top Stats) */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Infrastructure_Vitality</span>
                  <div className="h-px flex-1 bg-white/5"></div>
               </div>
               <DashboardStats users={users} />
            </section>

            {/* 2. Command Architecture (Main Bento Grid) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Intelligence & Controls (4/12) */}
              <div className="xl:col-span-4 space-y-8">
                 <div className="flex flex-col gap-8">
                    <HealthRadar />
                    <ActionCenter 
                      safeMode={isSafeMode} 
                      setSafeMode={setIsSafeMode} 
                      onForceRefresh={() => adminKey && fetchEcosystemData(adminKey)} 
                    />
                    <SafeModeLock isLocked={isSafeMode} />
                 </div>
              </div>

              {/* Right Column: Node Monitoring & Traffic (8/12) */}
              <div className="xl:col-span-8 space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-sentinel/60 italic">Node_Security_Cluster</h2>
                       <div className="flex items-center gap-2 text-[8px] font-mono text-slate-700">
                          <div className="w-1 h-1 bg-sentinel rounded-full animate-pulse" /> SRE_REALTIME_STREAM_ACTIVE
                       </div>
                    </div>
                    <ServiceStatus adminKey={adminKey} />
                 </div>
                 
                 <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Ecosystem_Traffic_Analysis</h2>
                    <TrafficChart data={users} />
                 </div>
              </div>
            </div>

            {/* 3. Sovereignty Layer (Ecosystem Data) */}
            <section className="space-y-8 border-t border-white/5 pt-12">
              <div className="flex items-center justify-center gap-8 text-center pb-4">
                 <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/10"></div>
                 <h2 className="text-[11px] font-black uppercase tracking-[1em] text-slate-500 italic">Ecosystem_Mastery_Matrix</h2>
                 <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/10"></div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-8">
                   <EcosystemTable healthData={healthData} users={users} />
                </div>
                
                <div className="xl:col-span-4">
                   <NexusLiveMonitor adminKey={adminKey} />
                </div>
              </div>
              
              {!isSafeMode && (
                  <div className="animate-in slide-in-from-bottom-10 duration-700">
                    <SheriffPanel adminKey={adminKey} />
                  </div>
                )}
            </section>

            {/* 4. Debug Console */}
            <section className="pb-12 opacity-40 hover:opacity-100 transition-opacity">
               <TermDebug />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
