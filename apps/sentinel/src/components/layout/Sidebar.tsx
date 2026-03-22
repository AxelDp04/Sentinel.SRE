"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Shield, 
  Settings, 
  Database, 
  Terminal, 
  Activity, 
  ShieldAlert, 
  Lock, 
  Unlock 
} from "lucide-react";

interface SidebarProps {
  onToggleSafeMode: (val: boolean) => void;
  isSafeMode: boolean;
}

export const Sidebar = ({ onToggleSafeMode, isSafeMode }: SidebarProps) => {
  return (
    <aside className="hidden md:flex w-64 bg-[#050505] border-r border-white/5 flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3 mb-8">
        <div className="p-2 bg-red-500/10 rounded-lg ring-1 ring-red-500/30">
          <Shield className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white italic tracking-tighter">SENTINEL-SRE</h1>
          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Ecosystem_Guardian_v2.0</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <SidebarItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard Hub" active />
        <SidebarItem icon={<Activity className="w-4 h-4" />} label="Live Streams" />
        <SidebarItem icon={<Database className="w-4 h-4" />} label="Infrastructure" />
        <SidebarItem icon={<Terminal className="w-4 h-4" />} label="Audit Terminal" />
      </nav>

      <div className="p-4 mt-auto">
        <div className={`p-4 rounded-lg flex flex-col gap-4 border transition-all duration-500 ${isSafeMode ? "bg-slate-900/40 border-white/5" : "bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]"}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isSafeMode ? "text-slate-500" : "text-red-500 animate-pulse"}`}>
              {isSafeMode ? "Safe_Mode_On" : "SYSTEM_UNLOCKED"}
            </span>
            {isSafeMode ? <Lock className="w-3 h-3 text-slate-400" /> : <Unlock className="w-3 h-3 text-red-500" />}
          </div>
          
          <button 
            onClick={() => onToggleSafeMode(!isSafeMode)}
            className={`w-full py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
              isSafeMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            }`}
          >
            {isSafeMode ? "Unlock_System" : "Lock_Master_Access"}
          </button>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${active ? "bg-white/5 text-white" : "text-slate-500 hover:text-white"}`}>
    <div className={`${active ? "text-sentinel" : "group-hover:text-sentinel"} transition-colors`}>{icon}</div>
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    {active && <div className="ml-auto w-1 h-1 rounded-full bg-sentinel shadow-[0_0_8px_#10b981]"></div>}
  </button>
);
