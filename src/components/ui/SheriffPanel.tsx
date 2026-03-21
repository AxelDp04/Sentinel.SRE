"use client";

import React, { useState, useEffect } from "react";
import { Users, ShieldAlert, LogOut, Activity, UserCheck, Zap, Globe } from "lucide-react";

export const SheriffPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInvalidating, setIsInvalidating] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setLiveCount(data.live_count || 0);
        
        // Dispatch debug logs to terminal
        if (data.debug) {
          data.debug.forEach((msg: string) => {
            window.dispatchEvent(new CustomEvent("sentinel-log", { 
              detail: { message: msg, type: "info" } 
            }));
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalLogout = async () => {
    if (!confirm("⚠️ WARNING: This will force logout EVERY user across ALL projects. Proceed?")) return;
    
    try {
      setIsInvalidating(true);
      const res = await fetch("/api/admin/logout-all", { method: "POST" });
      if (res.ok) {
        alert("GLOBAL LOGOUT COMPLETED. All sessions invalidated across all nodes.");
        fetchUsers();
      }
    } catch (err) {
      alert("Emergency logout failed.");
    } finally {
      setIsInvalidating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-6 border-red-500/20 bg-red-500/5 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg ring-1 ring-red-500/50">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white italic underline decoration-red-500/30 underline-offset-4">Gobernanza de Identidad (Multi-Nodo)</h3>
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Sheriff Protocol Level 7 - Cross-Project Sync</p>
          </div>
        </div>

        <button 
          onClick={handleGlobalLogout}
          disabled={isInvalidating}
          className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] disabled:opacity-50"
        >
          <LogOut className={`w-4 h-4 ${isInvalidating ? 'animate-spin' : ''}`} />
          {isInvalidating ? "Invalidating Nodes..." : "Force Global Logout"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass bg-white/5 p-4 border-none ring-1 ring-sentinel/30 relative overflow-hidden group">
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-sentinel animate-ping"></div>
            <div className="w-2 h-2 rounded-full bg-sentinel shadow-[0_0_5px_#10b981]"></div>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Usuarios en Vivo</span>
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-sentinel" />
            <span className="text-2xl font-black text-white tracking-tighter">{liveCount}</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase italic tracking-tighter">Identity Pulse: SYNCED</p>
        </div>

        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Directorio Global</span>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xl font-bold text-white tracking-tighter">{users.length}</span>
          </div>
        </div>
        
        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Sesiones Activas (24h)</span>
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-amber-500" />
            <span className="text-xl font-bold text-white tracking-tighter">
              {users.filter(u => u.is_active).length}
            </span>
          </div>
        </div>

        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5 relative overflow-hidden group">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Nodos Conectados</span>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-xl font-bold text-white tracking-tighter italic">3</span>
          </div>
        </div>
      </div>

      <div className="border border-white/5 rounded overflow-hidden">
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="bg-white/5 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Identity</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Project</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Last Access</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-4 py-8 text-center text-slate-600 animate-pulse uppercase tracking-[0.5em]">Global Audit in Progress...</td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className={`hover:bg-white/5 transition-colors ${user.is_live ? 'bg-sentinel/5' : ''}`}>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-2 ${user.is_live ? 'text-white font-bold' : 'text-slate-400'}`}>
                      {user.is_live && <div className="w-1.5 h-1.5 rounded-full bg-sentinel animate-pulse"></div>}
                      {user.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase ring-1 ring-blue-500/20">
                      {user.project}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 italic">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-tighter ${user.is_live ? 'bg-sentinel/20 text-sentinel' : 'bg-slate-500/10 text-slate-500'}`}>
                      {user.is_live ? 'LIVE' : user.is_active ? 'ACTIVE' : 'DORMANT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
