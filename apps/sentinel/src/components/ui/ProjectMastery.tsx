"use client";

import React from "react";
import { LayoutGrid, Maximize2, GitBranch } from "lucide-react";

export const ProjectMastery = () => {
  return (
    <div className="glass p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Project Mastery Map</h3>
        </div>
        <Maximize2 className="w-4 h-4 text-slate-500" />
      </div>

      <div className="flex-1 flex flex-col gap-4">
         <MasteryItem name="ARQOVEX_PROD" level={85} />
         <MasteryItem name="AUDITACAR_STAGE" level={45} />
         <MasteryItem name="SCOUT_EDGE" level={92} />
      </div>
    </div>
  );
};

const MasteryItem = ({ name, level }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
      <span className="flex items-center gap-2"><GitBranch className="w-2 h-2" /> {name}</span>
      <span>{level}% Sync</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
       <div 
         className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000"
         style={{ width: `${level}%` }}
       ></div>
    </div>
  </div>
);
