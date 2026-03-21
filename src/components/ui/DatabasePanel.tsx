"use client";

import React from "react";
import { Database, Zap, Lock, HardDrive, Activity } from "lucide-react";

interface DatabasePanelProps {
  healthData: Record<string, { status: string }>;
}

export const DatabasePanel = ({ healthData }: DatabasePanelProps) => {
  const isOnline = (id: string) => healthData[id]?.status === "online";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Neon.tech Panel */}
      <div className="glass p-6 group">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">Neon.tech</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Provider: Serverless Postgres</p>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${isOnline("auditacar") ? "bg-sentinel/10 text-sentinel border border-sentinel/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {isOnline("auditacar") ? "STABLE" : "DEGRADED"}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
             <span className="text-slate-400 flex items-center gap-2"><HardDrive className="w-4 h-4" /> Engine</span>
             <span className="text-white font-mono">PostgreSQL 17</span>
          </div>
          <div className="flex items-center justify-between text-sm">
             <span className="text-slate-400 flex items-center gap-2"><Activity className="w-4 h-4" /> Migration</span>
             <span className="text-blue-400 font-mono italic">Phase 1 Complete</span>
          </div>
        </div>

        <div className="mt-6 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${isOnline("auditacar") ? "w-[98%] bg-sentinel shadow-[0_0_10px_#10b981]" : "w-[40%] bg-red-500 shadow-[0_0_10px_#ef4444]"}`}></div>
        </div>
      </div>

      {/* Supabase Panel */}
      <div className="glass p-6 group">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">Supabase</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Provider: Edge Infrastructure</p>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${isOnline("arqovex") ? "bg-sentinel/10 text-sentinel border border-sentinel/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {isOnline("arqovex") ? "ACTIVE" : "OFFLINE"}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
             <span className="text-slate-400 flex items-center gap-2"><Lock className="w-4 h-4" /> Auth Service</span>
             <span className="text-emerald-400 font-mono">Operational</span>
          </div>
          <div className="flex items-center justify-between text-sm">
             <span className="text-slate-400 flex items-center gap-2"><HardDrive className="w-4 h-4" /> Storage Bucket</span>
             <span className="text-white font-mono">92% Capacity</span>
          </div>
        </div>

        <div className="mt-6 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${isOnline("arqovex") ? "w-[99.9%] bg-sentinel shadow-[0_0_10px_#10b981]" : "w-[0%] bg-red-500"}`}></div>
        </div>
      </div>
    </div>
  );
};
