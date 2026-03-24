"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, ShieldAlert, Cpu, ChevronRight, Loader2, Trash2 } from "lucide-react";

/**
 * ============================================================
 * COMPONENTE: NexusTerminal
 * PROPÓSITO: Proporcionar una interfaz de línea de comandos 
 * para ejecutar scripts de seguridad y pruebas de estrés.
 * ============================================================
 */

export function NexusTerminal({ adminKey }: { adminKey: string | null }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ type: "cmd" | "out", text: string }[]>([
    { type: "out", text: "Nexus_v4.5 Terminal Initialized. Secure_Link_Established." },
    { type: "out", text: "Type 'help' to see available security protocols." }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    const cleanCmd = cmd.trim().toLowerCase();
    setHistory(prev => [...prev, { type: "cmd", text: cmd }]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/admin/terminal", {
        method: "POST",
        headers: {
          "X-Admin-Key": adminKey || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ command: cleanCmd })
      });

      const data = await resp.json();
      setHistory(prev => [...prev, { type: "out", text: data.output || "No output." }]);
    } catch (err) {
      setHistory(prev => [...prev, { type: "out", text: "❌ Fatal_Error: Conexión con el núcleo perdida." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") executeCommand(input);
  };

  const clearTerminal = () => {
    setHistory([{ type: "out", text: "--- Terminal Cleared ---" }]);
  };

  return (
    <div className="w-full bg-[#05070a] border border-blue-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
      
      {/* Barra de Título Retro */}
      <div className="bg-[#0a0f18] border-b border-white/5 py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">
            Nexus_Root_Console // Kernel_Access
          </span>
        </div>
        <div className="flex items-center gap-4">
           {/* Botones de acción rápida */}
           <button 
             onClick={() => executeCommand("test_rollback")}
             className="text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 flex items-center gap-2 transition-colors border border-red-500/20 px-2 py-1 rounded"
           >
             <ShieldAlert className="w-3 h-3" />
             Chaos_Test
           </button>
           <button 
             onClick={clearTerminal}
             className="text-slate-500 hover:text-white transition-colors"
           >
             <Trash2 className="w-3 h-3" />
           </button>
        </div>
      </div>

      {/* Área de Texto del Terminal */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2"
      >
        {history.map((line, i) => (
          <div key={i} className={`flex gap-3 animate-in slide-in-from-left-2 duration-300 ${line.type === "cmd" ? "text-blue-400" : "text-slate-300"}`}>
            <span className="opacity-40">{line.type === "cmd" ? ">_" : "#"}</span>
            <pre className="whitespace-pre-wrap flex-1">{line.text}</pre>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-blue-500/60 font-mono italic animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Executing kernel process...
          </div>
        )}
      </div>

      {/* Input de Comandos */}
      <div className="p-4 bg-black/40 border-t border-white/5 flex items-center gap-3">
        <ChevronRight className="w-4 h-4 text-blue-500" />
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Escriba un comando (ej: test_rollback, help)..."
          className="bg-transparent border-none outline-none flex-1 text-white font-mono placeholder:text-slate-700 text-sm"
        />
        <div className="flex gap-1">
          <div className={`w-2 h-4 bg-blue-500/40 ${loading ? "" : "animate-[pulse_1s_infinite]"}`} />
        </div>
      </div>

      {/* Decoración Hardware */}
      <div className="bg-[#050505] py-1 px-4 flex items-center justify-between opacity-30 select-none">
        <span className="text-[8px] font-mono tracking-widest text-slate-700 uppercase">Input_Voltage: 1.2v // Core_Clock: 4.8Ghz</span>
        <div className="flex gap-4">
           <Cpu className="w-3 h-3 text-slate-800" />
        </div>
      </div>
    </div>
  );
}
