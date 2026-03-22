"use client";

import React from "react";
import { BarChart3, LineChart, TrendingUp } from "lucide-react";

export const LatencyTrends = () => {
  return (
    <div className="glass p-6 flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Dynamic Latency Matrix</h3>
        </div>
        <TrendingUp className="w-4 h-4 text-sentinel" />
      </div>

      <div className="flex-1 flex items-end gap-1 px-4">
        {[40, 35, 60, 45, 80, 55, 70, 40, 30, 50, 65, 45, 60, 35].map((val, i) => (
          <div 
            key={i} 
            className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-400 rounded-sm transition-all duration-700 hover:to-sentinel"
            style={{ height: `${val}%`, animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center bg-white/5 p-3 rounded rounded-bl-none rounded-br-none border-t border-white/5">
         <div>
            <span className="text-[8px] text-slate-600 uppercase block font-mono">Mean_Time:</span>
            <span className="text-xs font-black text-white italic">42.4ms</span>
         </div>
         <div>
            <span className="text-[8px] text-slate-600 uppercase block font-mono">P99_Delay:</span>
            <span className="text-xs font-black text-red-400 italic">102ms</span>
         </div>
      </div>
    </div>
  );
};
