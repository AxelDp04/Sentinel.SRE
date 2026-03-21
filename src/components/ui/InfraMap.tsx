"use client";

import React from "react";
import { Shield, Server, Database, Activity } from "lucide-react";

interface InfraMapProps {
  healthData: Record<string, { status: string; latency?: number }>;
}

export const InfraMap = ({ healthData }: InfraMapProps) => {
  const isOnline = (id: string) => healthData[id]?.status === "online";

  return (
    <div className="glass p-8 relative overflow-hidden h-[400px] flex items-center justify-center">
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-50">
        <Activity className="w-4 h-4 text-sentinel animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Topology: Active_Relay</span>
      </div>

      <svg width="600" height="300" viewBox="0 0 600 300" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        {/* Connection Paths */}
        <g className="stroke-slate-800 stroke-[2] fill-none">
          {/* Sentinel to ARQOVEX */}
          <path id="path-arqovex" d="M300 50 L150 150" className={isOnline("arqovex") ? "stroke-sentinel/30" : ""} />
          {/* Sentinel to AuditaCar */}
          <path id="path-auditacar" d="M300 50 L450 150" className={isOnline("auditacar") ? "stroke-sentinel/30" : ""} />
          {/* Sentinel to AgentScout */}
          <path id="path-agentscout" d="M300 50 L300 250" className={isOnline("agentscout") ? "stroke-sentinel/30" : ""} />
        </g>

        {/* Data Flow Particles */}
        {isOnline("arqovex") && (
          <circle r="3" fill="#10b981" className="filter blur-[1px]">
            <animateMotion dur="2s" repeatCount="indefinite" path="M300 50 L150 150" />
          </circle>
        )}
        {isOnline("auditacar") && (
          <circle r="3" fill="#10b981" className="filter blur-[1px]">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M300 50 L450 150" />
          </circle>
        )}
        {isOnline("agentscout") && (
          <circle r="3" fill="#10b981" className="filter blur-[1px]">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M300 50 L300 250" />
          </circle>
        )}

        {/* Nodes */}
        {/* SENTINEL NODE */}
        <g transform="translate(275, 25)">
          <rect width="50" height="50" rx="4" fill="#020617" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
          <foreignObject width="50" height="50">
            <div className="w-full h-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-sentinel" />
            </div>
          </foreignObject>
        </g>

        {/* ARQOVEX NODE */}
        <g transform="translate(125, 125)">
          <rect width="50" height="50" rx="4" fill="#020617" stroke={isOnline("arqovex") ? "#10b981" : "#1e293b"} strokeWidth="1" />
          <foreignObject width="50" height="50">
            <div className="w-full h-full flex items-center justify-center">
              <Server className={`w-5 h-5 ${isOnline("arqovex") ? "text-sentinel" : "text-slate-600"}`} />
            </div>
          </foreignObject>
        </g>

        {/* AUDITACAR NODE */}
        <g transform="translate(425, 125)">
          <rect width="50" height="50" rx="4" fill="#020617" stroke={isOnline("auditacar") ? "#10b981" : "#1e293b"} strokeWidth="1" />
          <foreignObject width="50" height="50">
            <div className="w-full h-full flex items-center justify-center">
              <Database className={`w-5 h-5 ${isOnline("auditacar") ? "text-sentinel" : "text-slate-600"}`} />
            </div>
          </foreignObject>
        </g>

        {/* AGENTSCOUT NODE */}
        <g transform="translate(275, 225)">
          <rect width="50" height="50" rx="4" fill="#020617" stroke={isOnline("agentscout") ? "#10b981" : "#1e293b"} strokeWidth="1" />
          <foreignObject width="50" height="50">
            <div className="w-full h-full flex items-center justify-center">
              <Activity className={`w-5 h-5 ${isOnline("agentscout") ? "text-sentinel" : "text-slate-600"}`} />
            </div>
          </foreignObject>
        </g>
      </svg>

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
    </div>
  );
};
