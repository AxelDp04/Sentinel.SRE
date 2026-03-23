"use client";

import React from "react";
import { Bell, User, Clock, Radio, Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-14 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-40"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Left: Brand + Status */}
      <div className="flex items-center gap-3">
        {/* Brand on mobile only */}
        <div className="flex md:hidden items-center gap-2">
          <div className="p-1 bg-emerald-500/10 rounded-md ring-1 ring-emerald-500/20">
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-sm font-black text-white tracking-tight italic">SENTINEL</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-sentinel animate-pulse" />
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">Master_Node_Active</span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest sm:hidden">LIVE</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest italic">
          <Clock className="w-3 h-3" /> System Time: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4 border-r border-white/10 pr-3 md:pr-6">
           <Radio className="w-4 h-4 text-slate-500 hover:text-sentinel transition-colors cursor-pointer" />
           <Bell className="w-4 h-4 text-slate-500 hover:text-sentinel transition-colors cursor-pointer" />
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right flex-col hidden sm:flex">
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
