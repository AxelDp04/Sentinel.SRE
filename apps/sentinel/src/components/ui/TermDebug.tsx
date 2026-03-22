"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, ChevronRight, Minimize2, Trash2 } from "lucide-react";

export const TermDebug = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLog = (e: any) => {
      const { message } = e.detail;
      const timestamp = new Date().toLocaleTimeString([], { hour12: false });
      setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-50));
    };

    window.addEventListener("sentinel-log", handleLog);
    
    // Initial logs
    setLogs([
      "[SYSTEM] Sentinel-SRE Core v1.4.2 Initialized",
      "[SYSCALL] Establish secure bridge to ARQOVEX node...",
      "[SOCKET] Connection established. Protocol: SOVEREIGN_ADMIN",
      "[GATEKEEPER] Master Identity Verified. Status: AUTHORIZED"
    ]);

    return () => window.removeEventListener("sentinel-log", handleLog);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass bg-[#050505] p-6 flex flex-col border-white/10 ring-1 ring-white/5 h-[300px]">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-sentinel" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Tactical System Terminal</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLogs([])} className="p-1 hover:bg-white/5 rounded transition-colors text-slate-500"><Trash2 className="w-3 h-3" /></button>
          <Minimize2 className="w-3 h-3 text-slate-600" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar font-mono text-[10px]"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-left-1">
             <span className="text-slate-800"><ChevronRight className="w-3 h-3" /></span>
             <span className={`leading-relaxed ${
               log.includes('ERROR') || log.includes('DANGER') ? 'text-red-500' :
               log.includes('SUCCESS') || log.includes('DB') ? 'text-sentinel' :
               'text-slate-400'
             }`}>
               {log}
             </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-slate-700 uppercase">
         <span>Kernel: SENTINEL_OS_v1.4</span>
         <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-sentinel/30"></div> Stream_Operational</span>
      </div>
    </div>
  );
};
