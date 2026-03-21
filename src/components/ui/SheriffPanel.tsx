"use client";

import React, { useState, useEffect } from "react";
import { Users, ShieldAlert, LogOut, Activity, UserCheck, Globe, Calendar, Mail, User, Database, LayoutGrid } from "lucide-react";

type TabType = 'global' | 'arqovex' | 'auditacar';

export const SheriffPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInvalidating, setIsInvalidating] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setTotalCount(data.total_count || data.users.length);
        setLiveCount(data.live_count || 0);
        setStats(data.stats);
        
        if (data.debug) {
          data.debug.forEach((msg: string) => {
            window.dispatchEvent(new CustomEvent("sentinel-log", { 
              detail: { message: msg, type: "info" } 
            }));
          });
        }
      }
    } catch (err) {
      console.error("Failed to sync sovereign users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = activeTab === 'global' ? users : users.filter(u => u.project === activeTab);

  return (
    <div className="glass p-6 border-red-500/20 bg-red-500/5 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg ring-1 ring-red-500/50">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white italic underline decoration-red-500/30 underline-offset-4">Sovereign Control Hub</h3>
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Administrative Node Mastery Active</p>
          </div>
        </div>

        <button 
          onClick={handleGlobalLogout}
          disabled={isInvalidating}
          className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] disabled:opacity-50"
        >
          <LogOut className={`w-4 h-4 ${isInvalidating ? 'animate-spin' : ''}`} />
          {isInvalidating ? "Invalidating All Nodes..." : "Emergency Kill Switch"}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
        <TabButton 
          active={activeTab === 'global'} 
          onClick={() => setActiveTab('global')}
          icon={<LayoutGrid className="w-3 h-3" />}
          label="Global View"
        />
        <TabButton 
          active={activeTab === 'arqovex'} 
          onClick={() => setActiveTab('arqovex')}
          icon={<Database className="w-3 h-3" />}
          label="ARQOVEX Control"
        />
        <TabButton 
          active={activeTab === 'auditacar'} 
          onClick={() => setActiveTab('auditacar')}
          icon={<Database className="w-3 h-3" />}
          label="AuditaCar Control"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass bg-white/5 p-4 border-none ring-1 ring-sentinel/30 relative overflow-hidden group">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Censo Real (Segmentado)</span>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-sentinel" />
            <span className="text-2xl font-black text-white tracking-tighter">
              {activeTab === 'global' ? totalCount : stats?.[activeTab]?.total || 0}
            </span>
          </div>
          <p className="text-[8px] text-sentinel/60 mt-2 uppercase font-mono italic">Headcount Verified_MASTER</p>
        </div>

        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Live Sync</span>
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-sentinel animate-pulse" />
            <span className="text-xl font-bold text-white tracking-tighter">
              {activeTab === 'global' ? liveCount : stats?.[activeTab]?.live || 0}
            </span>
          </div>
        </div>
        
        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Auth Scheme</span>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xl font-bold text-white tracking-tighter uppercase italic text-blue-400/80">Sovereign</span>
          </div>
        </div>

        <div className="glass bg-black/40 p-4 border-none ring-1 ring-white/5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Node Origin</span>
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xl font-bold text-white tracking-tighter uppercase">{activeTab}</span>
          </div>
        </div>
      </div>

      <div className="border border-white/5 rounded overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="bg-white/5 sticky top-0 backdrop-blur-sm z-20">
              <tr>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Identity</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Mailbox</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Registered</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-4 py-8 text-center text-slate-600 animate-pulse uppercase tracking-[0.5em]">Identity Census in Progress...</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className={`hover:bg-white/5 transition-colors ${user.is_live ? 'bg-sentinel/5' : ''}`}>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-2 font-bold ${user.is_live ? 'text-white' : 'text-slate-300'}`}>
                      <User className="w-3 h-3 opacity-50" /> {user.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                     <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {user.email}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 italic">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(user.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-[9px] uppercase font-bold tracking-tighter ${user.is_live ? 'bg-sentinel/20 text-sentinel' : user.is_active ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>
                      {user.is_live ? 'LIVE' : user.is_active ? 'ACTIVE' : 'SENTINEL_ARCHIVE'}
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

  async function handleGlobalLogout() {
    if (!confirm("⚠️ Force EXIT of all sessions in the ecosystem?")) return;
    setIsInvalidating(true);
    await fetch("/api/admin/logout-all", { method: "POST" });
    setIsInvalidating(false);
    fetchUsers();
  }
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {icon}
    {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 animate-in fade-in slide-in-from-bottom-1"></div>}
  </button>
);
