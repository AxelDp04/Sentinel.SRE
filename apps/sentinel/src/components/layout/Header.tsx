"use client";

import React from "react";
import { Search, Bell, User, Clock, Radio } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-sentinel animate-pulse"></div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Master_Node_Active</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest italic">
          <Clock className="w-3 h-3" /> System Time: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-white/10 pr-6">
           <Radio className="w-4 h-4 text-slate-500 hover:text-sentinel transition-colors cursor-pointer" />
           <Bell className="w-4 h-4 text-slate-500 hover:text-sentinel transition-colors cursor-pointer" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right flex flex-col">
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Axel_Dominance</span>
            <span className="text-[8px] text-sentinel uppercase font-mono italic">Root_Executor</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-500/20 glass flex items-center justify-center ring-1 ring-white/10">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
