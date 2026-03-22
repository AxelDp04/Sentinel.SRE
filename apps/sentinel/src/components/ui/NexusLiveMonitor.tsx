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

export function NexusLiveMonitor() {
  const [tasks, setTasks] = useState<NexusTask[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial active/recent tasks
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("nexus_tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setTasks(data);
    };

    fetchTasks();

    // 2. Subscribe to realtime changes
    const subscription = supabase
      .channel("nexus_tasks_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "nexus_tasks" },
        (payload) => {
          setTasks((current) => {
            const newTask = payload.new as NexusTask;
            const updatedTasks = [...current];
            const index = updatedTasks.findIndex((t) => t.id === newTask.id);

            if (index !== -1) {
              updatedTasks[index] = newTask; // Update existing
            } else {
              updatedTasks.unshift(newTask); // Add new at top
            }

            return updatedTasks.slice(0, 5); // Keep top 5
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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

  if (tasks.length === 0) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center text-slate-500 w-full h-full min-h-[400px] flex flex-col items-center justify-center">
        <Bot className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-xs uppercase tracking-widest font-mono">Nexus Engine Idling</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-blue-500/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.1)]">
      <div className="bg-blue-500/10 border-b border-blue-500/20 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Nexus Live Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[8px] font-mono text-blue-400">ENGINE_SYNC</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar"
      >
        {tasks.map((task) => (
          <div key={task.id} className="border border-white/5 bg-white/5 rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-xs font-bold text-white/90">{task.project_name}</span>
                </div>
                <p className="text-[10px] text-red-400/80 font-mono mt-1 w-64 truncate">
                  {task.error_description}
                </p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-white/50 uppercase">
                {task.status}
              </span>
            </div>

            {/* AI Thought Logs */}
            {task.resolution_steps && task.resolution_steps.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-1">
                {task.resolution_steps.map((step, idx) => (
                   <div key={idx} className="flex items-start gap-2 text-[10px] text-slate-400 font-mono animate-in slide-in-from-left-2 duration-300">
                     {getStepIcon(step)}
                     <span className="flex-1">{step}</span>
                   </div>
                ))}
              </div>
            )}

            {/* Final AI Output */}
            {task.status === "resolved" && task.ai_output && (
               <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400 font-mono animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    <strong>Auto-Resolution Veredict</strong>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">
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
