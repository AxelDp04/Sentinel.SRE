"use client";

import React from "react";
import { Home, Car, Search, Activity } from "lucide-react";

export const VitalityFlowMonitor = () => {
  return (
    <div className="card-premium p-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-3xl border-white/5 relative overflow-hidden group">
      {/* Label Izquierda */}
      <div className="flex flex-col gap-1 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/80 italic">Ecosystem_Pulse</span>
        </div>
        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Vitality_Flow_v4.0</p>
      </div>

      {/* Monitor de Pulso Central (ECG) */}
      <div className="flex-1 flex justify-center relative h-16 max-w-2xl">
        <svg viewBox="0 0 400 100" className="w-full h-full opacity-40">
          {/* Static ECG Wave Background */}
          <path
            d="M0 50 L140 50 L145 40 L150 60 L155 20 L160 80 L165 50 L170 50 L300 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-emerald-500/20"
          />
          
          {/* Animated Glow Wave */}
          <path
            id="heartbeat-path"
            d="M0 50 L140 50 L145 40 L150 60 L155 20 L160 80 L165 50 L170 50 L300 50"
            fill="none"
            stroke="url(#pulse-gradient)"
            strokeWidth="2"
            strokeDasharray="100, 1000"
            className="text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="100"
              to="-1000"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>

          <defs>
            <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Life Ball (Single bright point) */}
          <circle r="3" fill="#10b981" className="shadow-[0_0_20px_#10b981]">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M0 50 L140 50 L145 40 L150 60 L155 20 L160 80 L165 50 L170 50 L300 50"
            />
          </circle>

          {/* Splitting Points Flowing to Icons */}
          {/* Project 1 Trail */}
          <circle r="1.5" fill="#10b981" opacity="0">
             <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="2.2s" />
             <animateMotion dur="3s" repeatCount="indefinite" begin="2.2s" path="M300 50 Q350 20 380 15" />
          </circle>
          {/* Project 2 Trail */}
          <circle r="1.5" fill="#10b981" opacity="0">
             <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="2.2s" />
             <animateMotion dur="3s" repeatCount="indefinite" begin="2.2s" path="M300 50 Q350 50 380 50" />
          </circle>
          {/* Project 3 Trail */}
          <circle r="1.5" fill="#10b981" opacity="0">
             <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="2.2s" />
             <animateMotion dur="3s" repeatCount="indefinite" begin="2.2s" path="M300 50 Q350 80 380 85" />
          </circle>
        </svg>
      </div>

      {/* Proyectos Icons (Destino) */}
      <div className="flex flex-col gap-3 py-1 pr-4 z-10">
        <div className="flex items-center gap-3 group/item">
          <div className="p-1.5 rounded bg-white/5 border border-white/5 text-slate-500 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all">
            <Home className="w-3 h-3" />
          </div>
          <span className="text-[8px] font-black tracking-widest text-slate-700 uppercase">Arqovex</span>
        </div>
        <div className="flex items-center gap-3 group/item">
          <div className="p-1.5 rounded bg-white/5 border border-white/5 text-slate-500 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all">
            <Car className="w-3 h-3" />
          </div>
          <span className="text-[8px] font-black tracking-widest text-slate-700 uppercase">AuditaCar</span>
        </div>
        <div className="flex items-center gap-3 group/item">
          <div className="p-1.5 rounded bg-white/5 border border-white/5 text-slate-500 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all">
            <Search className="w-3 h-3" />
          </div>
          <span className="text-[8px] font-black tracking-widest text-slate-700 uppercase">AgentScout</span>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
