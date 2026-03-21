"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  name: string;
  description: string;
  status: "online" | "offline" | "checking";
  latency?: number;
  iconName: keyof typeof LucideIcons;
}

export const StatusCard = ({
  name,
  description,
  status,
  latency,
  iconName,
}: StatusCardProps) => {
  const Icon = LucideIcons[iconName] as LucideIcon;

  return (
    <div className="glass p-6 min-w-[300px] relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-sentinel/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-sentinel" />
        </div>
        <div className="flex items-center gap-2">
          {status === "online" && (
            <div className="relative flex h-3 w-3">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-sentinel opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sentinel"></span>
            </div>
          )}
          {status === "offline" && (
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          )}
          {status === "checking" && (
             <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 animate-pulse"></span>
          )}
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {status}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1 text-white">{name}</h3>
      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{description}</p>

      {latency !== undefined && (
        <div className="flex items-center gap-2 mt-auto">
          <LucideIcons.Activity className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-mono text-sentinel">{latency}ms</span>
        </div>
      )}

      {/* Border gradient effect */}
      <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none group-hover:border-sentinel/20 transition-colors duration-500"></div>
    </div>
  );
};
