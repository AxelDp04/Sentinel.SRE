"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, MessageSquare, Send, X, Terminal, Sparkles, Activity } from "lucide-react";

export const SheriffControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "sheriff"; text: string }[]>([
    { role: "sheriff", text: "Hola Axel. Soy el Nexus SRE Sheriff. Mi núcleo está sincronizado con AuditaCar, Arqovex y AgentScout. ¿En qué puedo asistirte hoy?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setChat(prev => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-key": localStorage.getItem("adminKey") || "AxelDp04"
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      setChat(prev => [...prev, { role: "sheriff", text: data.response }]);
    } catch (err) {
      setChat(prev => [...prev, { role: "sheriff", text: "Error de enlace con el núcleo Nexus." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Botón Flotante del Sheriff */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-50 p-4 rounded-full bg-sentinel/20 border border-sentinel/40 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-110 transition-transform group"
      >
        <ShieldCheck className="w-8 h-8 text-sentinel group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sentinel"></span>
        </span>
      </button>

      {/* Panel del Sheriff */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] z-[100] transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full glass border-l border-white/10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sentinel/10">
                <Terminal className="w-5 h-5 text-sentinel" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">The_Sheriff_v2</h3>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-2.5 h-2.5 text-sentinel animate-pulse" />
                  <span className="text-[9px] text-slate-500 font-mono tracking-tighter">SRE_CORE_SYNCED</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-cyber-grid bg-[size:20px_20px]">
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed border ${
                  msg.role === 'user' 
                  ? 'bg-sentinel/10 border-sentinel/20 text-white rounded-br-none' 
                  : 'bg-white/[0.03] border-white/10 text-slate-200 rounded-bl-none shadow-[2px_2px_15px_rgba(0,0,0,0.3)]'
                }`}>
                  <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-sentinel rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-sentinel rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-sentinel rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/5 bg-white/[0.01]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Consultar al SRE Sheriff..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-sentinel/50 transition-colors text-white placeholder:text-slate-600 font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!message.trim() || isTyping}
                className="absolute right-2 p-2 text-sentinel hover:scale-110 disabled:opacity-20 disabled:scale-100 transition-all"
              >
                <Send className="w-5 h-5 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
              </button>
            </div>
            <p className="mt-3 text-[9px] text-center text-slate-600 font-black uppercase tracking-[0.2em] italic">
               <Sparkles className="w-2.5 h-2.5 inline mr-1" /> Powered by Nexus_Engine_v5
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
