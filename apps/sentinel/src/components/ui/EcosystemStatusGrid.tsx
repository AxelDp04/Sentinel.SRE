"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Activity, Globe } from "lucide-react";
import { PROJECTS } from "@/constants/projects";

interface EcosystemStatusGridProps {
  healthData?: Record<string, { status: string; latency?: number }>;
}

export const EcosystemStatusGrid = ({ healthData = {} }: EcosystemStatusGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {PROJECTS.map((project) => {
        const data = healthData[project.id] || { status: 'checking', latency: 0 };
        const isOnline = data.status === 'online';

        return (
          <div 
            key={project.id} 
            className="card-premium p-6 border-l-4 transition-all hover:bg-white/5"
            style={{ borderLeftColor: isOnline ? '#10b981' : '#ef4444' }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-[0.1em] text-white">
                  {project.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                  {project.url.replace('https://', '')}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {isOnline ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={`text-[10px] font-bold uppercase ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOnline ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Latency</p>
                <div className="flex items-center justify-end gap-1.5 text-slate-400">
                  <Activity className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-mono">{data.latency || (isOnline ? '22' : '--')}ms</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
