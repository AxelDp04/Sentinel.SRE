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
  // Rounding to the nearest hour for a cleaner "flow" visual
  const chartData = (data || []).reduce((acc: any[], user) => {
    if (!user.created_at) return acc;
    
    const date = new Date(user.created_at);
    // Format to "HH:00" for grouping
    const hour = date.getHours().toString().padStart(2, '0');
    const time = `${hour}:00`;
      
    const existing = acc.find(item => item.time === time);
    if (existing) {
      existing.users += 1;
    } else {
      acc.push({ time, users: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.time.localeCompare(b.time));

  // If no data, provide a baseline for the first render
  const displayData = chartData.length > 0 ? chartData : [
    { time: "00:00", users: 1 },
    { time: "06:00", users: 2 },
    { time: "12:00", users: 5 },
    { time: "18:00", users: 3 },
    { time: "23:00", users: 1 }
  ];

  return (
    <div className="glass p-6 bg-slate-900/40 min-h-[300px] w-full relative group transition-all duration-500 hover:bg-slate-900/60 flex flex-col">
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2 font-mono">
            <div className="w-2 h-2 rounded-full bg-sentinel animate-pulse"></div>
            <span className="text-[10px] text-sentinel uppercase font-bold tracking-widest">Live Traffic Flow</span>
         </div>
         <span className="text-[8px] text-slate-600 uppercase font-mono">Scale: Node_Identities / Hour</span>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              itemStyle={{ color: '#10b981' }}
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
    </div>
  );
};
