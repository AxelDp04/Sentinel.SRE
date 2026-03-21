"use client";

import React from "react";
import { Radar, Crosshair, Target } from "lucide-react";

export const HealthRadar = () => {
  return (
    <div className="glass p-6 h-[280px] flex flex-col relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <Radar className="w-5 h-5 text-sentinel animate-spin-slow" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Ecosystem Health Radar</h3>
        </div>
        <Target className="w-4 h-4 text-slate-500" />
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {/* Radar concentric circles */}
        <div className="absolute w-40 h-40 border border-sentinel/10 rounded-full"></div>
        <div className="absolute w-28 h-28 border border-sentinel/20 rounded-full animate-pulse"></div>
        <div className="absolute w-14 h-14 border border-sentinel/30 rounded-full"></div>
        
        {/* Radar scanner line */}
        <div className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent to-sentinel origin-left animate-radar-scan top-1/2 left-1/2"></div>
        
        {/* Active Nodes */}
        <NodePoint x={-30} y={-40} active delay="0s" />
        <NodePoint x={45} y={20} active delay="1s" />
        <NodePoint x={-10} y={60} active delay="2.5s" />
        
        <div className="relative z-10 text-center">
          <span className="text-2xl font-black text-white italic tracking-tighter block leading-none">98%</span>
          <span className="text-[8px] font-mono text-sentinel uppercase tracking-[0.3em]">Operational</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest relative z-10">
         <span>Sector_alpha: Nom</span>
         <span>Sector_beta: Nom</span>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sentinel/20 to-transparent"></div>
    </div>
  );
};

const NodePoint = ({ x, y, active, delay }: any) => (
  <div 
    className="absolute w-2 h-2" 
    style={{ transform: `translate(${x}px, ${y}px)` }}
  >
     <div className={`w-full h-full rounded-full bg-sentinel shadow-[0_0_8px_#10b981] animate-ping opacity-75`} style={{ animationDelay: delay }}></div>
     <div className="absolute inset-0 w-2 h-2 rounded-full bg-sentinel"></div>
  </div>
);
