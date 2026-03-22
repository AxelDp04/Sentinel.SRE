"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Shield, Cpu, Bot } from "lucide-react";

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const entries = [
    "INITIALIZING SENTINEL PROTOCOLS...",
    "AUTHENTICATING ADMIN: [ING_AXEL_PEREZ]",
    "CONNECTING TO SUPABASE_PNET... SUCCESS",
    "WAKING NEXUS ENGINE... ONLINE",
    "SYNCING ECOSYSTEM TELEMETRY... 100%",
    "ENCRYPTING TRAFFIC (AES-256)... DONE",
    "VITALITY FLOW: STABLE",
    "ACCESS GRANTED: WELCOME TO MISSION CONTROL"
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < entries.length) {
        setLogs(prev => [...prev, entries[current]]);
        current++;
        setProgress((current / entries.length) * 100);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 sm:p-12 font-mono">
      {/* Background Decor */}
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 relative">
        {/* Header Icon */}
        <div className="flex justify-center mb-12">
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] animate-pulse" />
             <Shield className="w-16 h-16 text-emerald-500 relative z-10" />
          </div>
        </div>

        {/* Progress Log */}
        <div className="space-y-2 max-h-[200px] overflow-hidden">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-4 text-[10px] sm:text-[12px] animate-in slide-in-from-left-2 duration-300">
              <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
              <span className={i === logs.length - 1 ? "text-emerald-400 font-black" : "text-slate-400"}>
                {log}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar Container */}
        <div className="pt-8 space-y-4">
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div 
               className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
               style={{ width: `${progress}%` }}
             />
           </div>
           <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">
             <span>System_Init</span>
             <span className="text-emerald-500/60">Stage_{Math.floor(progress/10)}</span>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-12 flex flex-col items-center gap-2 opacity-30">
        <div className="flex items-center gap-3">
           <Bot className="w-4 h-4" />
           <span className="text-[10px] tracking-[0.5em] font-black uppercase">Neutral_Shield_v3.2</span>
        </div>
        <p className="text-[8px] tracking-[0.2em] font-mono">AUTHORIZED PERSONNEL ONLY</p>
      </div>
    </div>
  );
};
