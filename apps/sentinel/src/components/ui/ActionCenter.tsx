"use client";

import React, { useState } from "react";
import { 
  Zap, 
  RefreshCw, 
  Trash2, 
  ShieldAlert, 
  Clock, 
  User, 
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare
} from "lucide-react";
import { getStoredAdminKey } from "@/lib/auth";

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "info" | "warning" | "success" | "danger";
}

interface ActionCenterProps {
  onForceRefresh: () => void;
  safeMode: boolean;
  setSafeMode: (val: boolean) => void;
}

export const ActionCenter = ({ onForceRefresh, safeMode, setSafeMode }: ActionCenterProps) => {
  const [activities, setActivities] = useState<Activity[]>([
    { id: "1", user: "Axel", action: "System Initialization", time: "10:00 AM", type: "success" },
  ]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const addActivity = (action: string, type: "info" | "warning" | "success" | "danger" = "info") => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      user: "Axel",
      action,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 5));
  };

  const handleAction = async (name: string, callback?: () => void) => {
    if (safeMode && name !== "Force Health Check") return;
    
    setLoadingAction(name);
    addActivity(`Initiated ${name}...`, name === "Emergency Rollback" ? "danger" : "info");
    
    window.dispatchEvent(new CustomEvent("sentinel-log", { 
      detail: { message: `COMMAND_EXEC: ${name.toUpperCase()}...`, type: "system" } 
    }));
    
    // Simulate process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (callback) {
      await callback();
    }
    
    setLoadingAction(null);
    addActivity(`${name} completed successfully`, "success");
    
    window.dispatchEvent(new CustomEvent("sentinel-log", { 
      detail: { message: `RESULT: ${name.toUpperCase()} [COMPLETED_OK]`, type: "success" } 
    }));
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Control Panel */}
      <div className="glass p-8 flex flex-col rounded-3xl border border-white/5 shadow-2xl bg-slate-900/60 backdrop-blur-md">
        <div className="flex flex-col gap-6 mb-8 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-sentinel/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-sentinel" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-white">Maintenance Command</h3>
          </div>
          
          <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
            <span className={`text-[11px] font-mono px-2 uppercase tracking-widest ${safeMode ? "text-slate-500" : "text-red-400 font-bold animate-pulse"}`}>
              {safeMode ? "Safe Mode: Locked" : "ARMED / UNLOCKED"}
            </span>
            <button 
              onClick={() => setSafeMode(!safeMode)}
              className={`w-14 h-7 rounded-full transition-all duration-300 relative ${safeMode ? "bg-slate-700" : "bg-red-500 shadow-[0_0_20px_#ef4444]"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${safeMode ? "left-1" : "left-8"}`}></div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 h-full text-center">
          {/* Action: Force Refresh */}
          <button 
            disabled={loadingAction !== null}
            onClick={() => handleAction("Force Health Check", onForceRefresh)}
            className="flex flex-col items-center justify-center gap-4 p-8 min-h-[140px] glass rounded-2xl hover:bg-white/10 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 hover:border-sentinel/50 shadow-xl"
          >
            <RefreshCw className={`w-8 h-8 ${loadingAction === "Force Health Check" ? "animate-spin text-sentinel" : "text-slate-400 group-hover:text-sentinel transition-colors"}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 group-hover:text-white leading-tight">Force<br/>Refresh</span>
          </button>

          {/* Action: Purge Cache */}
          <button 
            disabled={safeMode || loadingAction !== null}
            onClick={() => handleAction("Purge Vercel Cache")}
            className="flex flex-col items-center justify-center gap-4 p-8 min-h-[140px] glass rounded-2xl hover:bg-white/10 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 hover:border-yellow-500/50 shadow-xl"
          >
            <Trash2 className={`w-8 h-8 ${loadingAction === "Purge Vercel Cache" ? "animate-bounce text-yellow-400" : "text-slate-400 group-hover:text-yellow-400 transition-colors"}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 group-hover:text-white leading-tight">Purge<br/>Cache</span>
          </button>

          {/* Action: DB Vacuum */}
          <button 
            disabled={safeMode || loadingAction !== null}
            onClick={() => handleAction("Database Vacuum")}
            className="flex flex-col items-center justify-center gap-4 p-8 min-h-[140px] glass rounded-2xl hover:bg-white/10 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 hover:border-blue-500/50 shadow-xl"
          >
            <ShieldAlert className={`w-8 h-8 ${loadingAction === "Database Vacuum" ? "animate-pulse text-blue-400" : "text-slate-400 group-hover:text-blue-400 transition-colors"}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 group-hover:text-white leading-tight">DB<br/>Vacuum</span>
          </button>

          {/* Action: EMERGENCY ROLLBACK */}
          <button 
            disabled={safeMode || loadingAction !== null}
            onClick={() => handleAction("Emergency Rollback")}
            className="flex flex-col items-center justify-center gap-4 p-8 min-h-[140px] glass rounded-2xl bg-red-500/5 hover:bg-red-500/20 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border border-red-500/30 hover:border-red-500/60 shadow-xl shadow-red-500/10"
          >
            <RotateCcw className={`w-8 h-8 ${loadingAction === "Emergency Rollback" ? "animate-spin text-red-500" : "text-red-400/80 group-hover:text-red-500 transition-colors"}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/80 group-hover:text-red-500 font-bold leading-tight">Emergency<br/>Rollback</span>
          </button>
        </div>

        <button 
          disabled={loadingAction !== null}
          onClick={() => handleAction("Generate WhatsApp Report", async () => {
             const key = getStoredAdminKey();
             const res = await fetch('/api/admin/whatsapp/report', { 
               method: 'POST', 
               headers: { 'X-Admin-Key': key || '' } 
             });
             const data = await res.json();
             if(data.success) alert(data.message);
             else alert("Error: " + data.error);
          })}
          className="mt-6 w-full flex items-center justify-center gap-3 p-4 glass rounded-2xl bg-green-500/10 hover:bg-green-500/20 transition-all border border-green-500/30 hover:border-green-500/60 shadow-xl shadow-green-500/5 group"
        >
           <MessageSquare className="w-5 h-5 text-green-400 group-hover:animate-pulse" />
           <span className="text-[10px] font-mono uppercase tracking-widest text-green-400 font-bold">Transmit Root Guardian Briefing</span>
        </button>
      </div>

      {/* Audit Logs */}
      <div className="glass p-8 flex flex-col rounded-3xl border border-white/5 bg-slate-900/60 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
          <Clock className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Tactical Audit</h3>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[300px] pr-4 custom-scrollbar">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 text-[10px] items-start border-l border-white/5 pl-3 py-1">
              <div className="mt-1">
                {activity.type === "success" && <CheckCircle2 className="w-3 h-3 text-sentinel" />}
                {activity.type === "info" && <Clock className="w-3 h-3 text-blue-400" />}
                {activity.type === "warning" && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                {activity.type === "danger" && <AlertTriangle className="w-3 h-3 text-red-500" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-bold flex items-center gap-1">
                    <User className="w-2.5 h-2.5 opacity-50" /> {activity.user}
                  </span>
                  <span className="text-slate-500 font-mono tracking-tighter">{activity.time}</span>
                </div>
                <p className={`font-mono italic leading-tight ${activity.type === 'danger' ? 'text-red-400' : 'text-slate-400'}`}>{activity.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
