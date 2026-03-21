"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrafficChartProps {
  data?: any[];
}

export const TrafficChart = ({ data = [] }: TrafficChartProps) => {
  // Defensive check and aggregation
  // We use user registration times or last sign in to mock a traffic flow if live data is sparse
  const chartData = (data || []).reduce((acc: any[], user) => {
    const time = user.created_at 
      ? new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '00' }) 
      : "00:00";
      
    const existing = acc.find(item => item.time === time);
    if (existing) {
      existing.users += 1;
    } else {
      acc.push({ time, users: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.time.localeCompare(b.time));

  // If no data, provide a baseline
  const displayData = chartData.length > 0 ? chartData : [
    { time: "08:00", users: 2 },
    { time: "12:00", users: 5 },
    { time: "16:00", users: 3 },
    { time: "20:00", users: 8 }
  ];

  return (
    <div className="glass p-6 bg-slate-900/40 h-[300px] w-full relative group transition-all duration-500 hover:bg-slate-900/60">
      <div className="absolute top-4 right-6 flex items-center gap-2 z-10 font-mono">
        <div className="w-2 h-2 rounded-full bg-sentinel animate-pulse"></div>
        <span className="text-[10px] text-sentinel uppercase font-bold tracking-widest">Live Traffic Flow</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
            fontFamily="monospace"
          />
          <YAxis 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
            fontFamily="monospace"
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#050505', 
              border: '1px solid #ffffff10',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'monospace'
            }}
            itemStyle={{ color: '#10b981', padding: 0 }}
            cursor={{ stroke: '#10b98130', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUsers)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
