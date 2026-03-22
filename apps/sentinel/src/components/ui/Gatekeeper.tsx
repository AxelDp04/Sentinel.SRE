"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Lock, ChevronRight, ShieldAlert } from "lucide-react";
import { isValidAdminKey, setStoredAdminKey } from "@/lib/auth";

interface GatekeeperProps {
  onAccessGranted: (key: string) => void;
}

export const Gatekeeper = ({ onAccessGranted }: GatekeeperProps) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isValidAdminKey(input)) {
      setStoredAdminKey(input);
      onAccessGranted(input);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setInput("");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full bg-[#050505] border border-white/10 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] ring-1 ring-white/5">
        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-red-500" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sentinel_Security_Check</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500/20"></div>
            <div className="w-2 h-2 rounded-full bg-sentinel/20"></div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
             <div className="p-4 bg-red-500/10 rounded-full mb-6 ring-1 ring-red-500/30 animate-pulse">
                <Lock className="w-8 h-8 text-red-500" />
             </div>
             <h1 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">Dashboard_Locked</h1>
             <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
               Acceso restringido al personal SRE oficial.<br/>
               Introduce la clave maestra para decodificar el dashboard.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="relative group">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-red-500">
                 <ChevronRight className="w-4 h-4" />
               </div>
               <input
                 autoFocus
                 type="password"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="ENTER_ACCESS_KEY_"
                 className={`w-full bg-black border ${error ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-white/10'} focus:border-red-500 rounded px-10 py-3 text-sm text-white placeholder:text-slate-800 focus:outline-none transition-all font-mono tracking-[0.3em]`}
                 disabled={loading}
               />
             </div>

             {error && (
               <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-bold uppercase animate-bounce mt-2">
                 <ShieldAlert className="w-3 h-3" /> Clave Incorrecta - Acceso Denegado
               </div>
             ) || (
                <p className="text-[8px] text-slate-700 text-center uppercase mt-4">Protocolo Sentinel V1.4 Active</p>
             )}

             <button type="submit" className="hidden">Enter</button>
          </form>
        </div>

        <div className="bg-red-500/5 p-3 flex justify-center border-t border-white/5">
           <span className="text-[8px] text-red-400/50 uppercase tracking-[0.4em] font-black italic">Axel_Dominance_Confirmed</span>
        </div>
      </div>
    </div>
  );
};
