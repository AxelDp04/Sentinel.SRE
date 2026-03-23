"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Activity, Globe } from "lucide-react";
import { PROJECTS } from "@/constants/projects";

interface EcosystemStatusGridProps {
  healthData?: Record<string, { status: string; latency?: number; integrityFailure?: boolean }>;
}

export const EcosystemStatusGrid = ({ healthData = {} }: EcosystemStatusGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {PROJECTS.map((project) => {
        const data = healthData[project.id] || { status: 'checking', latency: 0 };
        const isOnline = data.status === 'online';

        return (
          <div 
            key={project.id} 
            className={`card-premium p-8 border-l-4 transition-all hover:bg-white/5 relative overflow-hidden group ${isOnline ? 'animate-node-breathe' : ''}`}
            style={{ borderLeftColor: isOnline ? '#10b981' : '#ef4444' }}
          >
            {/* Ping Animation Trail */}
            {isOnline && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-500/40 blur-[40px] animate-pulse-trail" />
              </div>
            )}

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  {project.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono italic">
                  {project.url.replace('https://', '')}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${data.integrityFailure ? 'bg-orange-500/10 border-orange-500/20' : isOnline ? 'bg-emerald-500/10' : 'bg-red-500/10'} border border-white/5`}>
                {data.integrityFailure ? (
                  <ShieldAlert className="w-6 h-6 text-orange-500 animate-[pulse_1s_infinite]" />
                ) : isOnline ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5 relative z-10">
              <div className="space-y-1">
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em]">Node_State</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500'}`} />
                  <span className={`text-[11px] font-black uppercase tracking-tighter ${data.integrityFailure ? 'text-orange-400' : isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.integrityFailure ? 'Integrity Failure' : isOnline ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em]">SRE_Latency</p>
                <div className="flex items-center justify-end gap-1.5 text-slate-400 font-mono">
                  <Activity className="w-3 h-3 text-blue-400" />
                  <span className="text-[11px] font-bold">{data.latency || (isOnline ? '22' : '--')}ms</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
