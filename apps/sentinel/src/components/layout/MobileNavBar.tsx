"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Activity,
  BriefcaseBusiness,
  Shield,
  Lock, 
  Unlock,
} from "lucide-react";

interface MobileNavBarProps {
  onToggleSafeMode: (val: boolean) => void;
  isSafeMode: boolean;
  onTabChange?: (tab: string) => void;
}

const TABS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Hub" },
  { id: "vitality",  icon: Activity,         label: "Streams" },
  { id: "jobs",      icon: BriefcaseBusiness, label: "Audit" },
  { id: "sre",       icon: Shield,            label: "SRE" },
  { id: "monitor",   icon: Activity,         label: "Terminal" },
];

export const MobileNavBar = ({ onToggleSafeMode, isSafeMode, onTabChange }: MobileNavBarProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pressed, setPressed] = useState<string | null>(null);

  const handleTab = (id: string) => {
    setActiveTab(id);
    onTabChange?.(id);
    setPressed(id);
    setTimeout(() => setPressed(null), 150);
    // Scroll to section
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Frosted glass bar */}
      <div className="bg-[#070d1a]/90 backdrop-blur-2xl border-t border-white/[0.07] px-2 pt-2 pb-1 flex items-center justify-around shadow-[0_-4px_30px_rgba(0,0,0,0.6)]">
        
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          const isPress = pressed === id;
          return (
            <button
              key={id}
              onClick={() => handleTab(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 relative group"
              style={{ transform: isPress ? "scale(0.88)" : "scale(1)", transition: "transform 0.1s ease" }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-500/15" : "group-active:bg-white/5"}`}>
                <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-emerald-400" : "text-slate-500"}`} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-200 ${isActive ? "text-emerald-400" : "text-slate-600"}`}>
                {label}
              </span>
            </button>
          );
        })}

        {/* Lock/Unlock button */}
        <button
          onClick={() => onToggleSafeMode(!isSafeMode)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 transition-all duration-300 active:scale-90`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${isSafeMode ? "bg-slate-700/30" : "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]"}`}>
            {isSafeMode
              ? <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              : <Unlock className="w-5 h-5 text-red-400 animate-pulse" strokeWidth={2} />
            }
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-200 ${isSafeMode ? "text-slate-600" : "text-red-400"}`}>
            {isSafeMode ? "Locked" : "Armed"}
          </span>
        </button>

      </div>
    </nav>
  );
};
