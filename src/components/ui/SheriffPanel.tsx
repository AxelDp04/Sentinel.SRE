"use client";

import React, { useState, useEffect } from "react";
import { Users, ShieldAlert, LogOut, Search, Activity, UserCheck } from "lucide-react";

export const SheriffPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvalidating, setIsInvalidating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalLogout = async () => {
    if (!confirm("⚠️ WARNING: This will force logout EVERY user across the platform. Proceed?")) return;
    
    try {
      setIsInvalidating(true);
      const res = await fetch("/api/admin/logout-all", { method: "POST" });
      if (res.ok) {
        alert("GLOBAL LOGOUT COMPLETED. All sessions invalidated.");
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
  }, []);

  return (
    <div className="glass p-6 border-red-500/20 bg-red-500/5 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg ring-1 ring-red-500/50">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white italic">Modo Sheriff</h3>
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Global Governance & Identity Control</p>
          </div>
        </div>

        <button 
          onClick={handleGlobalLogout}
          disabled={isInvalidating}
          className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] disabled:opacity-50"
        >
          <LogOut className={`w-4 h-4 ${isInvalidating ? 'animate-spin' : ''}`} />
          {isInvalidating ? "Invalidating..." : "Force Global Logout"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Total Identities</span>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xl font-bold text-white tracking-tighter">{users.length}</span>
          </div>
        </div>
        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Active Sessions (24h)</span>
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-sentinel" />
            <span className="text-xl font-bold text-sentinel tracking-tighter">
              {users.filter(u => u.is_active).length}
            </span>
          </div>
        </div>
        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Authenticated Nodes</span>
          <div className="flex items-center gap-3">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xl font-bold text-white tracking-tighter">2</span>
          </div>
        </div>
        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-sentinel/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Surveillance Status</span>
          <div className="flex items-center gap-3 italic text-[11px] text-slate-400">
             <div className="w-1.5 h-1.5 rounded-full bg-sentinel animate-pulse"></div>
             SCANNING_IDENTITIES...
          </div>
        </div>
      </div>

      <div className="border border-white/5 rounded overflow-hidden">
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="bg-white/5 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Email Identity</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Last Pulse</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                   <td colSpan={3} className="px-4 py-8 text-center text-slate-600 animate-pulse uppercase tracking-[0.5em]">Fetching identities...</td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${user.is_active ? 'bg-sentinel/20 text-sentinel ring-1 ring-sentinel/30' : 'bg-slate-500/20 text-slate-500 ring-1 ring-white/5'}`}>
                      {user.is_active ? 'Active' : 'Dormant'}
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
