"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Zap, 
  Clock, 
  RefreshCcw,
  ExternalLink,
  HardDrive,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

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
    <div className={`card-premium relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
      !isOnline && status !== 'checking' 
        ? 'border-red-500/30' 
        : 'border-white/5'
    }`}>
      {/* Self-Healing Aura */}
      {latestIncident?.status === 'resolved' && (
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-sentinel/10 blur-[40px] rounded-full animate-pulse pointer-events-none" />
      )}

      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className={`mt-1 p-2.5 rounded-xl transition-colors duration-500 ${
              isOnline ? 'bg-sentinel/10 text-sentinel grow-animation' : 'bg-red-500/10 text-red-500'
            }`}>
              {isOnline ? <CheckCircle2 className="w-5 h-5 shadow-emerald-500/50" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight group-hover:text-sentinel transition-colors">{name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5 opacity-60 truncate max-w-[150px]">{url.replace('https://', '')}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              isOnline 
                ? 'bg-sentinel/10 border-sentinel/20 text-sentinel shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-red-400/10 border-red-500/20 text-red-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-sentinel animate-pulse' : 'bg-red-500'}`} />
              {status}
            </div>
            {latency && (
              <div className="flex items-center justify-end gap-1 mt-2 text-[10px] font-mono text-slate-500 uppercase">
                <Activity className="w-3 h-3" /> {latency}ms
              </div>
            )}
          </div>
        </div>

        {/* AI Monitoring Layer (Premium Box) */}
        <div className="relative p-4 rounded-xl bg-black/60 border border-white/5 group-hover:border-white/10 transition-colors shadow-inner">
           {latestIncident ? (
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 tracking-wider">
                    <Clock className="w-3 h-3" /> {new Date(latestIncident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
                 {latestIncident.status === 'resolved' && (
                   <span className="flex items-center gap-1 text-[9px] font-black text-sentinel uppercase bg-sentinel/10 px-2 py-0.5 rounded-full">
                     <Zap className="w-2.5 h-2.5" /> Healing Active
                   </span>
                 )}
               </div>
               
               <p className="text-[11px] text-slate-300 leading-relaxed font-medium line-clamp-2 italic">
                 "{latestIncident.ai_diagnosis}"
               </p>
               
               <div className="flex items-center gap-2 pt-1">
                  <div className="px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-[9px] font-mono text-sentinel/80 flex items-center gap-1.5 uppercase">
                    <RefreshCcw className="w-3 h-3" /> {latestIncident.action_taken}
                  </div>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-2 opacity-30 grayscale group-hover:grayscale-0 transition-all">
                <ShieldCheck className="w-5 h-5 mb-1 text-slate-700" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-700">No Incidents Detected</span>
             </div>
           )}
        </div>

        {/* Operational Controls */}
        <div className="grid grid-cols-3 gap-2 pt-2">
           <a 
            href={url} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] text-[10px] font-bold text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all border border-transparent hover:border-white/5"
           >
             <ExternalLink className="w-3.5 h-3.5" />
           </a>
           <button 
             onClick={() => onRedeploy && onRedeploy(id)}
             className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500/[0.03] text-orange-400 hover:bg-orange-500/10 transition-all border border-orange-500/10"
             title="Force Emergency Redeploy"
           >
             <RefreshCcw className="w-3.5 h-3.5" />
           </button>
           <button 
             className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/[0.03] text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/10"
             title="Flush System Cache"
           >
             <HardDrive className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>
      
      {/* Decorative Bottom Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] transition-colors duration-1000 ${
        isOnline ? 'bg-gradient-to-r from-sentinel/0 via-sentinel/40 to-sentinel/0' : 'bg-red-500/40'
      }`}></div>
    </div>
  );
};

// Internal icons helper to avoid import errors if not exported
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
