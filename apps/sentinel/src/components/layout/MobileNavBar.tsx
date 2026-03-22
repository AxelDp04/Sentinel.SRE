"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Shield, 
  Lock, 
  Unlock,
  Bot
} from "lucide-react";

interface MobileNavBarProps {
  onToggleSafeMode: (val: boolean) => void;
  isSafeMode: boolean;
}

export const MobileNavBar = ({ onToggleSafeMode, isSafeMode }: MobileNavBarProps) => {
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
      <div className="glass bg-[#0a0f1d]/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Dash Icon */}
        <button className="p-3 rounded-full bg-white/5 text-sentinel shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
          <LayoutDashboard className="w-5 h-5" />
        </button>

        {/* Brand / Status */}
        <div className="flex flex-col items-center">
           <div className="flex items-center gap-1.5 mb-0.5">
             <div className={`w-1 h-1 rounded-full ${isSafeMode ? 'bg-slate-500' : 'bg-red-500 animate-pulse'}`} />
             <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Sentinel_Mobile</span>
           </div>
           <p className="text-[7px] font-mono text-slate-500 uppercase">Mission_Control_v4.5</p>
        </div>

        {/* Lock/Unlock Toggle */}
        <button 
          onClick={() => onToggleSafeMode(!isSafeMode)}
          className={`group flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-500 ${
            isSafeMode 
              ? "bg-slate-800/50 text-slate-400 border border-white/5" 
              : "bg-red-600 text-white border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          }`}
        >
          {isSafeMode ? (
            <>
              <Lock className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest group-active:scale-95 transition-transform">Unlock</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest animate-pulse group-active:scale-95 transition-transform">ARMED</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
