import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Bot, Shield, CheckCircle, Clock } from "lucide-react";

interface NexusTask {
  id: string;
  created_at: string;
  project_name: string;
  error_description: string;
  status: "pending" | "analyzing" | "resolved";
  resolution_steps: string[];
  ai_output: any;
}

export function NexusLiveMonitor({ adminKey }: { adminKey: string | null }) {
  const [tasks, setTasks] = useState<NexusTask[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // DIAGNÓSTICO DE CONEXIÓN (AXEL)
    console.log("[NEXUS] Local API Proxy Active:", !!adminKey);

    const fetchTasksFromApi = async () => {
      try {
        const response = await fetch("/api/admin/incidents", {
          headers: { "X-Admin-Key": adminKey || "" }
        });
        const data = await response.json();
        if (data.incidents) {
          setTasks(data.incidents);
        }
      } catch (err) {
        console.error("Failed to fetch Nexus incidents via local API:", err);
      }
    };

    fetchTasksFromApi();
    
    // Polling as fallback/primary if requested
    const interval = setInterval(fetchTasksFromApi, 5000);

    // 2. Subscribe to realtime changes (Optional but maintained for speed)
    const subscription = supabase
      .channel("nexus_tasks_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "nexus_tasks" },
        (payload) => {
          console.log("[NEXUS] Realtime update received");
          fetchTasksFromApi(); // Re-fetch from API to stay in sync with proxy
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, [adminKey]);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case "analyzing": return <Bot className="w-4 h-4 text-blue-400 animate-pulse" />;
      case "resolved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getStepIcon = (step: string) => {
    if (step.includes("SRE Agent")) return <Bot className="w-3 h-3 text-blue-400" />;
    if (step.includes("Security")) return <Shield className="w-3 h-3 text-purple-400" />;
    return <Clock className="w-3 h-3 text-slate-500" />;
  };

  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({});

  const toggleLogs = (id: string) => {
    setShowLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (tasks.length === 0) {
    return (
      <div className="card-premium p-12 text-center text-slate-500 w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900/20 backdrop-blur-xl">
        <Bot className="w-12 h-12 opacity-10 mb-6" />
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">Nexus Engine: Vigilancia Pasiva</p>
      </div>
    );
  }

  return (
    <div className="card-premium overflow-hidden bg-slate-900/40 backdrop-blur-2xl border-white/5">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Registro de Incidentes</h3>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">SRE_TELEMETRY_STREAM</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase font-mono">Synced</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar"
      >
        {tasks.map((task) => (
          <div key={task.id} className="p-6 space-y-4 hover:bg-white/5 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`mt-1 p-2 rounded-lg ${task.status === 'resolved' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                   {getStatusIcon(task.status)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-black text-white tracking-tight">{task.project_name}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.1em] border ${task.status === 'resolved' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono italic max-w-lg">
                    {task.error_description}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => toggleLogs(task.id)}
                className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-400 transition-colors p-2"
              >
                {showLogs[task.id] ? '[+] Hide_Telemetry' : '[-] View_Telemetry'}
              </button>
            </div>

            {/* AI Thought Logs (Toggleable) */}
            {showLogs[task.id] && task.resolution_steps && task.resolution_steps.length > 0 && (
              <div className="ml-14 p-4 bg-black/40 rounded-xl border border-white/5 space-y-2 animate-in slide-in-from-top-2 duration-300">
                {task.resolution_steps.map((step, idx) => (
                   <div key={idx} className="flex items-start gap-3 text-[10px] text-slate-500 font-mono tracking-tight leading-relaxed">
                     <div className="mt-1">{getStepIcon(step)}</div>
                     <span className="flex-1 border-b border-white/5 pb-1">{step}</span>
                   </div>
                ))}
              </div>
            )}

            {/* Final AI Output */}
            {task.status === "resolved" && task.ai_output && (
               <div className="ml-14 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-emerald-100/80 font-mono animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-emerald-500/10">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <strong className="text-[9px] uppercase tracking-[0.3em] font-black text-emerald-400">Acción de Mitigación Nexus</strong>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed italic">
                    {task.ai_output.solution}
                  </pre>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
