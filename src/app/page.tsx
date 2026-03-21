"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardStats } from "@/components/ui/DashboardStats";
import { HealthRadar } from "@/components/ui/HealthRadar";
import { LatencyTrends } from "@/components/ui/LatencyTrends";
import { ServiceStatus } from "@/components/ui/ServiceStatus";
import { ActionCenter } from "@/components/ui/ActionCenter";
import { ProjectMastery } from "@/components/ui/ProjectMastery";
import { SafeModeLock } from "@/components/ui/SafeModeLock";
import { SheriffPanel } from "@/components/ui/SheriffPanel";
import { EcosystemTable } from "@/components/ui/EcosystemTable";
import { TrafficChart } from "@/components/ui/TrafficChart";
import { TermDebug } from "@/components/ui/TermDebug";
import { Gatekeeper } from "@/components/ui/Gatekeeper";
import { getStoredAdminKey, isValidAdminKey } from "@/lib/auth";
import { PROJECTS } from "@/constants/projects";

export default function Home() {
  const [isSafeMode, setIsSafeMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  
  // Central Data State
  const [users, setUsers] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchEcosystemData = useCallback(async (key: string) => {
    try {
      // 1. Fetch Users
      const userRes = await fetch("/api/admin/users", {
        headers: { "X-Admin-Key": key }
      });
      if (userRes.status === 401) return;
      const userData = await userRes.json();
      if (userData.users) setUsers(userData.users);

      // 2. Fetch/Simulate Health (Simulated for this view, but could be fetch)
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
    const key = getStoredAdminKey();
    if (isValidAdminKey(key)) {
      setIsAuthenticated(true);
      setAdminKey(key);
      fetchEcosystemData(key);
      const interval = setInterval(() => fetchEcosystemData(key), 30000);
      return () => clearInterval(interval);
    }
    setBooting(false);
  }, [fetchEcosystemData]);

  if (booting) return <div className="min-h-screen bg-black" />;

  if (!isAuthenticated) {
    return <Gatekeeper onAccessGranted={(key) => {
      setAdminKey(key);
      setIsAuthenticated(true);
      fetchEcosystemData(key);
    }} />;
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-sentinel selection:text-black font-sans">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar onToggleSafeMode={setIsSafeMode} isSafeMode={isSafeMode} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in fade-in duration-700">
            {/* Upper Tactical Section: Real-Time Monitoring */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <DashboardStats users={users} />
              </div>
              <div className="xl:col-span-1">
                <SafeModeLock isLocked={isSafeMode} />
              </div>
            </div>

            {/* Middle Section: Health & Traffic Intelligence */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 space-y-6">
                <HealthRadar />
                <ActionCenter 
                  safeMode={isSafeMode} 
                  setSafeMode={setIsSafeMode} 
                  onForceRefresh={() => adminKey && fetchEcosystemData(adminKey)} 
                />
              </div>
              <div className="xl:col-span-2 space-y-6">
                <ServiceStatus />
                <TrafficChart data={users} />
              </div>
            </div>

            {/* Bottom Section: Ecosystem Mastery */}
            <div className="grid grid-cols-1 gap-8 pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                 <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-500 italic">Ecosystem_Sovereignty_Layer</h2>
                 <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-transparent to-transparent"></div>
              </div>
              
              <EcosystemTable healthData={healthData} users={users} />
              
              {!isSafeMode && (
                <div className="animate-in slide-in-from-bottom-5 duration-500">
                  <SheriffPanel adminKey={adminKey} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 pb-12">
               <TermDebug />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
