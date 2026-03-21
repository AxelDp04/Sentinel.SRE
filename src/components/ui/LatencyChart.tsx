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

interface LatencyPoint {
  time: string;
  latency: number;
  service: string;
}

interface LatencyChartProps {
  data: LatencyPoint[];
}

export const LatencyChart = ({ data }: LatencyChartProps) => {
  return (
    <div className="glass p-6 h-[300px] w-full relative overflow-hidden group">
      <div className="absolute top-4 left-6 flex items-center gap-2 opacity-50 z-10 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-sentinel animate-pulse"></div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-sentinel">Trend_Analysis: RealTime</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 40, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: "#64748b" }}
            minTickGap={30}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
            unit="ms"
            tick={{ fill: "#64748b" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(2, 6, 23, 0.9)", 
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(16, 185, 129, 0.3)", 
              borderRadius: "8px",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#fff"
            }}
            cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
            itemStyle={{ color: "#10b981", padding: 0 }}
            labelStyle={{ color: "#64748b", marginBottom: "4px" }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLatency)"
            animationDuration={2000}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] [background-size:100%_2px,3px_100%]"></div>
    </div>
  );
};
