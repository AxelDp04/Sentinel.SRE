"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  name: string;
  description: string;
  status: "online" | "offline" | "checking";
  latency?: number;
  uptime?: number;
  iconName: keyof typeof LucideIcons;
}

export const StatusCard = ({
  name,
  description,
  status,
  latency,
  uptime,
  iconName,
}: StatusCardProps) => {
  const Icon = LucideIcons[iconName] as LucideIcon;

  return (
    <div className={`glass p-6 min-w-[300px] relative overflow-hidden transition-all duration-500 group ${
      status === 'offline' ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900/40'
    } hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 ${
          status === 'offline' ? 'bg-red-500/20' : 'bg-sentinel/10'
        }`}>
          <Icon className={`w-6 h-6 ${status === 'offline' ? 'text-red-400' : 'text-sentinel'}`} />
        </div>
        <div className="flex items-center gap-2">
          {status === "online" && (
            <div className="relative flex h-3 w-3">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-sentinel opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sentinel"></span>
            </div>
          )}
          {status === "offline" && (
             <div className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_#ef4444]"></span>
             </div>
          )}
          {status === "checking" && (
             <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 animate-pulse"></span>
          )}
          <span className={`text-[10px] font-mono uppercase tracking-widest ${status === 'offline' ? 'text-red-400' : 'text-slate-400'}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="relative z-10">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] block mb-1">Estado de salud de mis negocios</span>
        <h3 className="text-xl font-bold mb-1 text-white tracking-tighter group-hover:text-sentinel transition-colors">{name}</h3>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{description}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 border-dashed relative z-10">
        {latency !== undefined && (
          <div className="flex flex-col">
             <span className="text-[8px] text-slate-600 uppercase font-mono tracking-tighter">Latencia / Respuesta</span>
             <div className="flex items-center gap-1.5 mt-0.5">
               <LucideIcons.Zap className="w-3 h-3 text-amber-500" />
               <span className="text-xs font-mono text-sentinel font-bold">{latency}ms</span>
             </div>
          </div>
        )}
        
        {uptime !== undefined && (
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-600 uppercase font-mono tracking-tighter">Disponibilidad 24h</span>
            <span className={`text-xs font-mono font-bold ${uptime > 99 ? "text-sentinel" : "text-yellow-400"}`}>
              {uptime.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Decorative background grid if offline */}
      {status === 'offline' && (
        <div className="absolute inset-0 bg-red-500/5 opacity-40 pointer-events-none mix-blend-overlay"></div>
      )}

      {/* Border gradient effect */}
      <div className={`absolute inset-0 border rounded-xl pointer-events-none transition-colors duration-500 ${
        status === 'offline' ? 'border-red-500/20 group-hover:border-red-500/40' : 'border-white/5 group-hover:border-sentinel/20'
      }`}></div>
    </div>
  );
};
