"use client";

import React from "react";
import { Globe, Users, Activity, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { PROJECTS } from "@/constants/projects";

interface EcosystemTableProps {
  healthData?: Record<string, { status: string; latency?: number }>;
  users?: any[];
}

export const EcosystemTable = ({ healthData = {}, users = [] }: EcosystemTableProps) => {
  return (
    <div className="glass bg-slate-900/60 border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sentinel" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Tabla Maestra de Ecosistema</h3>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
           <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-sentinel"></div> Health_OK</span>
           <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critical_Alert</span>
        </div>
      </div>
      
      <table className="w-full text-left text-[11px] font-mono border-collapse">
        <thead className="bg-[#0f172a]/80 text-slate-500">
          <tr>
            <th className="px-6 py-4 border-b border-white/5 uppercase tracking-widest font-bold">Proyecto</th>
            <th className="px-6 py-4 border-b border-white/5 uppercase tracking-widest font-bold">Estado (Web)</th>
            <th className="px-6 py-4 border-b border-white/5 uppercase tracking-widest font-bold text-center">Usuarios en Vivo</th>
            <th className="px-6 py-4 border-b border-white/5 uppercase tracking-widest font-bold text-right">Database Node</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {PROJECTS.map((project) => {
            const status = (healthData as any)?.[project.id]?.status || 'checking';
            const projectUsers = (users || []).filter(u => u.project === project.id && u.is_live);
            
            return (
              <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${status === 'online' ? 'bg-sentinel' : 'bg-red-500'} group-hover:scale-y-110 transition-transform`}></div>
                    <div>
                      <span className="text-white font-bold block leading-none mb-1">{project.name}</span>
                      <a href={project.url} target="_blank" rel="noreferrer" className="text-[9px] text-slate-500 hover:text-sentinel flex items-center gap-1 transition-colors">
                        {project.url.replace('https://', '')} <ExternalLink className="w-2 h-2" />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {status === 'online' ? (
                      <span className="flex items-center gap-1.5 text-sentinel bg-sentinel/10 px-2 py-0.5 rounded-full ring-1 ring-sentinel/30 font-bold uppercase tracking-tighter">
                        <ShieldCheck className="w-3 h-3" /> ONLINE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full ring-1 ring-red-500/30 font-bold uppercase tracking-tighter animate-pulse">
                        <ShieldAlert className="w-3 h-3" /> OFFLINE
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                   <div className="flex flex-col items-center">
                     <span className={`text-lg font-black tracking-tighter ${projectUsers.length > 0 ? 'text-white' : 'text-slate-600'}`}>
                        {projectUsers.length}
                     </span>
                     <span className="text-[8px] text-slate-500 uppercase italic">Active_Identities</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Supabase_Main</span>
                    <span className="text-[8px] text-slate-500 italic mt-0.5 flex items-center gap-1">
                      CONNECTION: SYNCED <Activity className="w-2 h-2 text-sentinel" />
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="p-3 bg-white/5 text-[9px] text-slate-500 font-mono italic flex justify-between items-center px-6">
        <span>* El monitoreo de usuarios (Auth) persiste incluso si el dominio web reporta 404.</span>
        <span className="flex items-center gap-2">Protocolo: Eco_Master_v2.0 <div className="w-2 h-2 rounded-full bg-sentinel animate-pulse"></div></span>
      </div>
    </div>
  );
};
