"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface LogEntry {
  id: string;
  message: string;
  type: "system" | "success" | "error" | "warn";
  timestamp: string;
}

export const TerminalSimulator = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "0", message: "Sentinel OS v1.0.4 initialized...", type: "system", timestamp: "16:20:01" },
    { id: "1", message: "Restricted Access - SRE Level 7 only", type: "warn", timestamp: "16:20:02" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Expose a way to add logs (for simplicity in this component, we'll use a listener or just a global-like state if needed, 
  // but for Phase 7 integration we'll just handle it via window events or similar for convenience)
  useEffect(() => {
    const handleAddLog = (e: any) => {
      const { message, type } = e.detail;
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type: type || "system",
        timestamp: new Date().toLocaleTimeString([], { hour12: false })
      };
      setLogs(prev => [...prev, newLog].slice(-20)); // Keep last 20
    };

    window.addEventListener("sentinel-log", handleAddLog);
    return () => window.removeEventListener("sentinel-log", handleAddLog);
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "success": return "text-sentinel";
      case "error": return "text-red-500";
      case "warn": return "text-yellow-500";
      default: return "text-blue-400";
    }
  };

  return (
    <div className="glass bg-black/80 border-sentinel/30 p-4 font-mono text-[11px] h-[200px] overflow-hidden flex flex-col relative group">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3 h-3 text-sentinel" />
          <span className="uppercase tracking-[0.3em] text-slate-500">Sentinel_Terminal_v1.0</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600">[{log.timestamp}]</span>
            <span className={`${getTypeStyle(log.type)} tracking-tighter`}>
              <span className="opacity-50 mr-2"> {log.type === 'system' ? '>' : '$'} </span>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] [background-size:100%_2px,3px_100%]"></div>
      
      {/* Subtle glow */}
      <div className="absolute -inset-px border border-sentinel/10 rounded-lg pointer-events-none group-hover:border-sentinel/30 transition-colors"></div>
    </div>
  );
};
