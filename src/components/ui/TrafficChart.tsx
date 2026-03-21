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
  Legend,
} from "recharts";

interface TrafficChartProps {
  data: any[];
}

export const TrafficChart = ({ data }: TrafficChartProps) => {
  // Aggregate user traffic data (sum of users per time slot)
  const chartData = data.reduce((acc: any[], current) => {
    const existing = acc.find(item => item.time === current.time);
    if (existing) {
      existing.users += 1;
    } else {
      acc.push({ time: current.time, users: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="glass p-6 bg-slate-900/40 h-[300px] w-full relative group">
      <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
        <div className="w-2 h-2 rounded-full bg-sentinel animate-pulse"></div>
        <span className="text-[10px] font-mono text-sentinel uppercase font-bold tracking-widest">Live Traffic Flow</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
            fontFamily="monospace"
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
            fontFamily="monospace"
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #ffffff10',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorUsers)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
