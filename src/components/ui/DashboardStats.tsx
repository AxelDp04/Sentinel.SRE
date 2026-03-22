"use client";

import React from "react";
import { 
  Users, 
  Activity, 
  Cpu, 
  Globe,
  ArrowUpRight
} from "lucide-react";

interface DashboardStatsProps {
  users: any[];
}

export const DashboardStats = ({ users }: DashboardStatsProps) => {
  const activeUsers = users.length;
  const avgLatency = "24ms";
  const uptime = "99.98%";
  
  const stats = [
    { 
      label: "Node Sovereignty", 
      value: activeUsers, 
      sub: "Active Users", 
      icon: Users,
      color: "text-sentinel",
      bg: "bg-sentinel/10"
    },
    { 
      label: "System Latency", 
      value: avgLatency, 
      sub: "Avg Ecosystem Ping", 
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    { 
      label: "Service Uptime", 
      value: uptime, 
      sub: "SLA Matrix (24h)", 
      icon: Globe,
      color: "text-orange-400",
      bg: "bg-orange-400/10"
    },
    { 
      label: "AI Neural State", 
      value: "SYNCHRONIZED", 
      sub: "Gemini 1.5-Flash", 
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="card-premium p-6 group cursor-pointer hover:translate-y-[-2px] transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
          </div>
          
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-white tracking-tight">{stat.value}</h4>
            </div>
            <p className="text-[10px] text-slate-600 font-mono mt-1 uppercase tracking-wider">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
