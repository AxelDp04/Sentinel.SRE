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
      label: "Incidentes Totales", 
      value: activeUsers, 
      sub: "Bajo Supervisión", 
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    { 
      label: "Latencia Ecosistema", 
      value: avgLatency, 
      sub: "Ping Promedio", 
      icon: Activity,
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    { 
      label: "SLA Disponibilidad", 
      value: uptime, 
      sub: "Rendimiento 24h", 
      icon: Globe,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    { 
      label: "Blindaje Nexus", 
      value: "ACTIVO", 
      sub: "Escudo IA Activo", 
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-1 sm:px-0">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="card-premium p-4 sm:p-6 group cursor-pointer hover:translate-y-[-2px] transition-all"
        >
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
          </div>
          
          <div>
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-lg sm:text-2xl font-black text-white tracking-tight">{stat.value}</h4>
            </div>
            <p className="text-[8px] sm:text-[10px] text-slate-600 font-mono mt-0.5 sm:mt-1 uppercase tracking-wider">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
