"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, ShieldAlert, LogOut, Activity, UserCheck, Globe, 
  Calendar, Mail, User, Database, LayoutGrid, ShieldCheck, 
  Key, Eye, Send, Star, ShoppingCart, CheckCircle2, XCircle
} from "lucide-react";
import { getStoredAdminKey } from "@/lib/auth";

type TabType = 'global' | 'arqovex' | 'auditacar';

export const SheriffPanel = ({ adminKey: propKey }: { adminKey?: string | null }) => {
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userActivity, setUserActivity] = useState<any | null>(null);
  const [fetchingActivity, setFetchingActivity] = useState(false);

  const adminKey = propKey || getStoredAdminKey();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "X-Admin-Key": adminKey || "" }
      });
      if (res.status === 401) {
         window.location.reload(); // Force relogin
         return;
      }
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

  const handleUserAction = async (userId: string, projectId: string, action: string) => {
    let payload = { action, projectId } as any;

    if (action === 'reset-password') {
      const newPassword = prompt(`⚠️ SOVEREIGN OVERRIDE\nEnter the exact new password for this user (min 6 chars):`);
      if (!newPassword) return; // User cancelled
      if (newPassword.length < 6) {
        alert("Operation Aborted: Password must be at least 6 characters.");
        return;
      }
      payload.newPassword = newPassword;
    } else {
      if (!confirm(`⚠️ Confirm ${action.toUpperCase()} for this user?`)) return;
    }

    try {
      const actualId = userId.split(`${projectId}-`)[1];
      const res = await fetch(`/api/admin/users/${actualId}/actions`, {
        method: "POST",
        headers: { 
          "X-Admin-Key": adminKey || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.debug_log) {
         window.dispatchEvent(new CustomEvent("sentinel-log", { 
            detail: { message: data.debug_log, type: data.success ? "success" : "error" } 
         }));
      }

      if (res.ok) {
        alert(data.message || `Action ${action} executed successfully.`);
        fetchUsers();
      } else {
        alert(`Action failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert("Action failed.");
    }
  };

  const openDrilldown = async (user: any) => {
    setSelectedUser(user);
    setFetchingActivity(true);
    setUserActivity(null);
    try {
      const actualId = user.id.split(`${user.project}-`)[1];
      const res = await fetch(`/api/admin/users/${actualId}/activity?projectId=${user.project}`, {
        headers: { "X-Admin-Key": adminKey || "" }
      });
      const data = await res.json();
      setUserActivity(data.activity);
    } catch (err) {
      console.error("Failed to fetch activity");
    } finally {
      setFetchingActivity(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = activeTab === 'global' ? users : users.filter(u => u.project === activeTab);

  return (
    <div className="glass p-6 border-red-500/20 bg-red-500/5 animate-in fade-in zoom-in-95 duration-500 relative min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg ring-1 ring-red-500/50">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white italic underline decoration-red-500/30 underline-offset-4">Identity Mastery Console</h3>
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Active Intervention & Drilldown Hub</p>
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

      <div className="flex gap-2 mb-6 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
        <TabButton active={activeTab === 'global'} onClick={() => setActiveTab('global')} icon={<LayoutGrid className="w-3 h-3" />} label="Ecosistema Global" />
        <TabButton active={activeTab === 'arqovex'} onClick={() => setActiveTab('arqovex')} icon={<Database className="w-3 h-3" />} label="ARQOVEX Admin" />
        <TabButton active={activeTab === 'auditacar'} onClick={() => setActiveTab('auditacar')} icon={<Database className="w-3 h-3" />} label="AuditaCar Admin" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Población Total" value={activeTab === 'global' ? totalCount : stats?.[activeTab]?.total || 0} icon={<Users className="w-5 h-5 text-sentinel" />} />
        <StatCard label="Sesiones Live" value={activeTab === 'global' ? liveCount : stats?.[activeTab]?.live || 0} icon={<Activity className="w-4 h-4 text-sentinel animate-pulse" />} />
        <StatCard label="Intervention" value="Sovereign" icon={<ShieldCheck className="w-4 h-4 text-blue-400" />} color="text-red-500" />
        <StatCard label="Target Base" value={activeTab.toUpperCase()} icon={<Database className="w-4 h-4 text-purple-400" />} />
      </div>

      <div className="border border-white/5 rounded overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="bg-[#0f172a] sticky top-0 backdrop-blur-sm z-10 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Identity</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold text-center">Protocol</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold">Project</th>
                <th className="px-4 py-3 text-slate-500 uppercase tracking-widest font-bold text-right">Tactical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600 animate-pulse uppercase tracking-[0.5em]">Identity Profile Scan...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className={`hover:bg-white/5 transition-colors group ${user.is_live ? 'bg-sentinel/5' : ''} ${user.is_admin ? 'border-l-2 border-red-500/50 bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                       <User className={`w-3 h-3 ${user.is_admin ? 'text-red-500' : 'opacity-50'}`} />
                       <div className="flex flex-col">
                         <span className={`font-bold ${user.is_live ? 'text-white' : 'text-slate-300'}`}>
                           {user.name}
                           {user.is_admin && <span className="ml-2 text-[7px] bg-red-600 px-1 rounded text-white font-black animate-pulse">ROOT</span>}
                         </span>
                         <span className="text-[9px] text-slate-500">{user.email}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                     <span className="flex justify-center italic text-[9px] text-slate-600 uppercase">
                        Sovereign_Node
                     </span>
                  </td>
                  <td className="px-4 py-3">
                     <span className="text-blue-400/80 font-bold tracking-tighter uppercase">{user.project}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionIconButton icon={<Eye className="w-3 h-3" />} tooltip="Ver Actividad" onClick={() => openDrilldown(user)} />
                      <ActionIconButton icon={<LogOut className="w-3 h-3" />} tooltip="Force Logout" color="hover:text-amber-500" onClick={() => handleUserAction(user.id, user.project, 'logout')} />
                      <ActionIconButton icon={<Key className="w-3 h-3" />} tooltip="Reset Password" color="hover:text-blue-500" onClick={() => handleUserAction(user.id, user.project, 'reset-password')} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRILLDOWN MODAL / PANEL */}
      {selectedUser && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md p-8 animate-in slide-in-from-right duration-500 flex flex-col">
          <div className="flex justify-between items-start mb-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <User className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Activity Drilldown: {selectedUser.name}</h2>
                <div className="flex items-center gap-3 text-slate-500 text-[10px] font-mono mt-1">
                   <span>ID: {selectedUser.id}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                   <span>PROJECT: {selectedUser.project.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 uppercase text-[10px] font-bold">Cerrar Visualizador [ESC]</button>
          </div>

          {fetchingActivity ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-4">
              <Activity className="w-10 h-10 text-sentinel animate-spin" />
              <p className="text-[10px] uppercase font-mono tracking-[0.5em] text-slate-500">Retrieving tactical session data...</p>
            </div>
          ) : userActivity ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto no-scrollbar">
              <ActivitySection 
                title="Citas Programadas" 
                icon={<Calendar className="w-4 h-4 text-amber-500" />}
                items={userActivity.appointments}
                empty="No hay citas registradas"
              />
              <ActivitySection 
                title="Favoritos Guardados" 
                icon={<Star className="w-4 h-4 text-blue-500" />}
                items={userActivity.favorites}
                renderItem={(item: any) => `Elemento ID: ${item.id_propiedad || item.id_plano || 'Desconocido'}`}
                empty="Sin favoritos guardados"
              />
              <ActivitySection 
                title="Compras Realizadas" 
                icon={<ShoppingCart className="w-4 h-4 text-purple-500" />}
                items={userActivity.sales}
                renderItem={(item: any) => `Venta: $${item.precio || '0.00'} - Ref: ${item.id?.slice(0,8)}`}
                empty="Historial de compras vacío"
              />
              
              <div className="glass bg-white/5 p-6 border-white/10 col-span-1 md:col-span-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Send className="w-5 h-5 text-sentinel" />
                       <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Newsletter Status</h4>
                    </div>
                    {userActivity.is_subscribed ? (
                      <span className="flex items-center gap-2 text-sentinel font-bold text-[10px] uppercase"><CheckCircle2 className="w-4 h-4" /> Suscripción Activa</span>
                    ) : (
                      <span className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase"><XCircle className="w-4 h-4" /> Sin Suscripción</span>
                    )}
                 </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  async function handleGlobalLogout() {
    if (!confirm("⚠️ Force EXIT of all ecosystem sessions?")) return;
    setIsInvalidating(true);
    await fetch("/api/admin/logout-all", { 
      method: "POST",
      headers: { "X-Admin-Key": adminKey || "" }
    });
    setIsInvalidating(false);
    fetchUsers();
  }
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon}{label}{active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 animate-in fade-in slide-in-from-bottom-1"></div>}
  </button>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="glass bg-white/5 p-4 border-none ring-1 ring-sentinel/30">
    <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">{label}</span>
    <div className="flex items-center gap-3">
      {icon}
      <span className={`text-xl font-bold tracking-tighter ${color || 'text-white'}`}>{value}</span>
    </div>
  </div>
);

const ActionIconButton = ({ icon, tooltip, onClick, color }: any) => (
  <button onClick={onClick} title={tooltip} className={`p-1.5 bg-white/5 hover:bg-white/10 rounded transition-all ${color || 'hover:text-sentinel'}`}>
    {icon}
  </button>
);

const ActivitySection = ({ title, icon, items, renderItem, empty }: any) => (
  <div className="glass bg-white/5 p-6 border-white/10">
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{title}</h4>
    </div>
    <div className="space-y-3">
      {items.length > 0 ? items.map((item: any, idx: number) => (
        <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-slate-400">
           {renderItem ? renderItem(item) : (item.titulo || item.fecha || JSON.stringify(item).slice(0,30) + '...')}
        </div>
      )) : <p className="text-[10px] text-slate-600 italic uppercase">{empty}</p>}
    </div>
  </div>
);
