"use client";

import React from "react";
import { Activity, Server, Users, Zap } from "lucide-react";

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatItem 
        label="Total Population" 
        value="-- / --" 
        subText="Real_Time_Census_Active"
        icon={<Users className="w-5 h-5 text-sentinel" />}
      />
      <StatItem 
        label="Global Health" 
        value="98.4%" 
        subText="All_Nodes_Nominal"
        icon={<Activity className="w-5 h-5 text-sentinel" />}
        trend="+0.2%"
      />
      <StatItem 
        label="Compute Load" 
        value="24.1 ms" 
        subText="Avg_Response_Time"
        icon={<Zap className="w-5 h-5 text-amber-500" />}
        trend="-12ms"
      />
    </div>
  );
};

const StatItem = ({ label, value, subText, icon, trend }: any) => (
  <div className="glass p-6 group hover:bg-white/5 transition-all duration-500 border-none ring-1 ring-white/5 hover:ring-sentinel/30">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend.startsWith('+') ? "bg-sentinel/10 text-sentinel" : "bg-blue-500/10 text-blue-400"}`}>
          {trend}
        </span>
      )}
    </div>
    
    <div>
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] block mb-1">
        Telemetry: {label.replace(' ', '_')}
      </span>
      <div className="flex flex-col">
        <h2 className="text-3xl font-black text-white italic tracking-tighter">{value}</h2>
        <span className="text-[8px] font-mono text-slate-600 uppercase italic mt-1">{subText}</span>
      </div>
    </div>
  </div>
);
