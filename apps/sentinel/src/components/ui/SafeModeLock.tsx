"use client";

import React from "react";
import { Lock, Unlock, ShieldAlert } from "lucide-react";

export const SafeModeLock = ({ isLocked }: { isLocked: boolean }) => {
  return (
    <div className={`glass p-8 flex flex-col items-center justify-center transition-all duration-500 h-full border-none ring-1 ${isLocked ? "ring-white/5" : "ring-red-500/50 bg-red-500/5 animate-pulse"}`}>
      <div className={`p-6 rounded-full glass mb-4 transition-all duration-500 ${isLocked ? "bg-white/5" : "bg-red-500/20 rotate-12 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.3)]"}`}>
        {isLocked ? <Lock className="w-10 h-10 text-slate-600" /> : <Unlock className="w-10 h-10 text-red-500" />}
      </div>
      
      <div className="text-center">
        <h3 className={`text-xl font-black uppercase tracking-tighter italic ${isLocked ? "text-slate-500" : "text-white"}`}>
          {isLocked ? "Safe Mode" : "WAR_MODE_ACTIVE"}
        </h3>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-2 leading-relaxed">
          {isLocked 
            ? "Administrative actions restricted.\nVerify identity to proceed." 
            : "MASTER EXECUTOR PERMISSIONS\nUNLOCKED & DANGEROUS."}
        </p>
      </div>

      {!isLocked && (
        <div className="mt-6 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          <ShieldAlert className="w-4 h-4" /> Final Directive: EXTERMINATE_BUGS
        </div>
      )}
    </div>
  );
};
