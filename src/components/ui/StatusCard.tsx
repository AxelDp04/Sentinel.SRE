"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpRight, 
  Zap, 
  Clock, 
  RefreshCcw,
  Terminal as TerminalIcon,
  HardDrive
} from "lucide-react";
import { PROJECTS } from "@/constants/projects";

interface StatusCardProps {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
  onRedeploy?: (id: string) => void;
}

export const StatusCard = ({ id, name, url, status, latency, onRedeploy }: StatusCardProps) => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const isOnline = status === 'online';

  useEffect(() => {
    // Fetch recent incidents for this service
    const fetchIncidents = async () => {
      try {
        const res = await fetch("/api/admin/incidents", {
          headers: { "X-Admin-Key": sessionStorage.getItem("adminKey") || "" }
        });
        const data = await res.json();
        if (data.incidents) {
          setIncidents(data.incidents.filter((i: any) => i.service_name.toLowerCase() === id.toLowerCase()));
        }
      } catch (e) {
        console.error("Incidents fetch failed");
      }
    };
    if (status !== 'checking') fetchIncidents();
  }, [id, status]);

  const latestIncident = incidents[0];

  return (
    <div className={`glass relative overflow-hidden transition-all duration-500 group ${
      !isOnline && status !== 'checking' 
        ? 'bg-red-500/10 border-red-500/20' 
        : 'bg-slate-900/40 border-white/5'
    }`}>
      {/* Healing Spark Indicator */}
      {latestIncident?.status === 'resolved' && (
        <div className="absolute top-2 right-2 z-10 animate-pulse">
           <div className="bg-sentinel/20 p-1 rounded-full border border-sentinel/30">
              <Zap className="w-3 h-3 text-sentinel shadow-[0_0_10px_#10b981]" />
           </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-sentinel/10 text-sentinel' : 'bg-red-500/10 text-red-500'}`}>
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{name}</h3>
              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{url.replace('https://', '')}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isOnline ? 'border-sentinel/20 text-sentinel' : 'border-red-500/20 text-red-500'
            }`}>
              {status}
            </div>
            {latency && <span className="text-[9px] font-mono text-slate-500 mt-1">{latency}ms</span>}
          </div>
        </div>

        {/* Incident Micro-Log */}
        <div className="mb-4 p-3 rounded bg-black/40 border border-white/5 min-h-[60px] flex flex-col justify-center">
            {latestIncident ? (
               <div className="space-y-1">
                 <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-500 uppercase">
                    <Clock className="w-2.5 h-2.5" /> {new Date(latestIncident.created_at).toLocaleDateString()}
                    <span className={`ml-auto px-1 rounded flex items-center gap-1 ${
                      latestIncident.status === 'resolved' ? 'bg-sentinel/10 text-sentinel' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {latestIncident.status === 'resolved' && <Zap className="w-2 h-2" />} {latestIncident.status.toUpperCase()}
                    </span>
                 </div>
                 <p className="text-[10px] text-white leading-tight italic line-clamp-2">
                    "{latestIncident.ai_diagnosis}"
                 </p>
                 <div className="text-[8px] font-bold text-sentinel/80 flex items-center gap-1 uppercase tracking-tighter">
                    <RefreshCcw className="w-2.5 h-2.5" /> ACTION: {latestIncident.action_taken}
                 </div>
               </div>
            ) : (
               <div className="text-center">
                  <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">No Recent Incidents</span>
               </div>
            )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2">
           <a 
            href={url} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded bg-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-colors uppercase"
           >
             Open <ArrowUpRight className="w-3 h-3" />
           </a>
           <button 
             onClick={() => onRedeploy && onRedeploy(id)}
             className="px-2 py-1.5 rounded bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors border border-orange-500/20"
             title="Force Redeploy"
           >
             <RefreshCcw className="w-3 h-3" />
           </button>
           <button 
             className="px-2 py-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
             title="Clear Cache"
           >
             <HardDrive className="w-3 h-3" />
           </button>
        </div>
      </div>
      
      {/* Background Subtle Accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isOnline ? 'bg-sentinel/20' : 'bg-red-500/20'}`}></div>
    </div>
  );
};
