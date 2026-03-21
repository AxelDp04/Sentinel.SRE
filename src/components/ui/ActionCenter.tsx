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
  RotateCcw
} from "lucide-react";

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "info" | "warning" | "success" | "danger";
}

interface ActionCenterProps {
  onForceRefresh: () => void;
}

export const ActionCenter = ({ onForceRefresh }: ActionCenterProps) => {
  const [safeMode, setSafeMode] = useState(true);
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
    
    if (callback) callback();
    
    setLoadingAction(null);
    addActivity(`${name} completed successfully`, "success");
    
    window.dispatchEvent(new CustomEvent("sentinel-log", { 
      detail: { message: `RESULT: ${name.toUpperCase()} [COMPLETED_OK]`, type: "success" } 
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Control Panel */}
      <div className="lg:col-span-2 glass p-6 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-sentinel" />
            <h3 className="text-lg font-bold uppercase tracking-widest text-white">Maintenance Command</h3>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
            <span className={`text-[10px] font-mono px-3 uppercase tracking-tighter ${safeMode ? "text-slate-500" : "text-red-400 font-bold animate-pulse"}`}>
              {safeMode ? "Safe Mode: Active" : "ARMED / UNLOCKED"}
            </span>
            <button 
              onClick={() => setSafeMode(!safeMode)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${safeMode ? "bg-slate-700" : "bg-red-500 shadow-[0_0_15px_#ef4444]"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${safeMode ? "left-1" : "left-7"}`}></div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
          {/* Action: Force Refresh */}
          <button 
            disabled={loadingAction !== null}
            onClick={() => handleAction("Force Health Check", onForceRefresh)}
            className="flex flex-col items-center justify-center gap-3 p-4 glass hover:bg-white/5 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border-none ring-1 ring-white/10 hover:ring-sentinel/50"
          >
            <RefreshCw className={`w-6 h-6 ${loadingAction === "Force Health Check" ? "animate-spin text-sentinel" : "text-slate-400 group-hover:text-sentinel transition-colors"}`} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 group-hover:text-white">Force Refresh</span>
          </button>

          {/* Action: Purge Cache */}
          <button 
            disabled={safeMode || loadingAction !== null}
            onClick={() => handleAction("Purge Vercel Cache")}
            className="flex flex-col items-center justify-center gap-3 p-4 glass hover:bg-white/5 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border-none ring-1 ring-white/10 hover:ring-yellow-500/50"
          >
            <Trash2 className={`w-6 h-6 ${loadingAction === "Purge Vercel Cache" ? "animate-bounce text-yellow-400" : "text-slate-400 group-hover:text-yellow-400 transition-colors"}`} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 group-hover:text-white">Purge Cache</span>
          </button>

          {/* Action: DB Vacuum */}
          <button 
            disabled={safeMode || loadingAction !== null}
            onClick={() => handleAction("Database Vacuum")}
            className="flex flex-col items-center justify-center gap-3 p-4 glass hover:bg-white/5 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border-none ring-1 ring-white/10 hover:ring-blue-500/50"
          >
            <ShieldAlert className={`w-6 h-6 ${loadingAction === "Database Vacuum" ? "animate-pulse text-blue-400" : "text-slate-400 group-hover:text-blue-400 transition-colors"}`} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 group-hover:text-white">DB Vacuum</span>
          </button>

          {/* Action: EMERGENCY ROLLBACK */}
          <button 
            disabled={safeMode || loadingAction !== null}
            onClick={() => handleAction("Emergency Rollback")}
            className="flex flex-col items-center justify-center gap-3 p-4 glass bg-red-500/5 hover:bg-red-500/10 transition-all group disabled:opacity-30 disabled:cursor-not-allowed border-none ring-1 ring-red-500/20 hover:ring-red-500/50"
          >
            <RotateCcw className={`w-6 h-6 ${loadingAction === "Emergency Rollback" ? "animate-spin text-red-500" : "text-red-400/70 group-hover:text-red-500 transition-colors"}`} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-red-400/70 group-hover:text-red-500 font-bold whitespace-nowrap">Emergency Rollback</span>
          </button>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="glass p-6 flex flex-col h-full bg-slate-900/40">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Tactical Audit</h3>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
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
