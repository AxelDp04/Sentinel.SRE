"use client";

import { useEffect, useState } from "react";
import { Package, Play, RefreshCw, AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";

interface NexusJob {
  id: string;
  job_type: string;
  status: string;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  created_at: string;
}

export function JobDashboard({ adminKey }: { adminKey: string | null }) {
  const [jobs, setJobs] = useState<NexusJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchJobs = async () => {
    if (!adminKey) return;
    try {
      const res = await fetch("/api/admin/jobs", {
        headers: { "X-Admin-Key": adminKey }
      });
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const createTestJob = async (forceFail = false) => {
    if (!adminKey) return;
    setCreating(true);
    try {
      await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "X-Admin-Key": adminKey, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: forceFail ? 'CRITICAL_DATA_SYNC' : 'EMAIL_DISPATCH', 
          force_fail: forceFail 
        })
      });
      fetchJobs();
    } catch (err) {
      console.error("Failed to create job", err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [adminKey]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/90">A_Jobs_Execution_Queue</h3>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest">Distributed_Worker_Active // Polling_5s</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => createTestJob(false)}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-500 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add_Success_Job
          </button>
          <button 
            onClick={() => createTestJob(true)}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3" />}
            Trigger_Failure_Demo
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Job_ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Retries</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[10px] text-slate-600 font-mono tracking-widest uppercase italic">
                  Retrieving_Job_Data_Stream...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[10px] text-slate-600 font-mono tracking-widest uppercase italic">
                  Queue_Empty // No_Active_Background_Tasks
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                    {job.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-black text-white/80 tracking-tight">{job.job_type}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        {job.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {job.status === 'failed' && <AlertCircle className="w-3 h-3 text-red-500" />}
                        {job.status === 'running' && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                        {job.status === 'pending' && <Clock className="w-3 h-3 text-slate-500" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          job.status === 'completed' ? 'text-emerald-500' :
                          job.status === 'failed' ? 'text-red-500' :
                          job.status === 'running' ? 'text-blue-500' : 'text-slate-500'
                        }`}>
                          {job.status}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          {[...Array(job.max_attempts)].map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < job.attempts ? (job.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500') : 'bg-white/10'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-slate-600">{job.attempts}/{job.max_attempts}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-all">
                        <RefreshCw className="w-3 h-3" />
                     </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
