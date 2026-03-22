"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Detectamos errores de carga de chunks (Vercel/Next.js)
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      if (typeof window !== 'undefined') {
        console.warn("Sentinel: Detectado ChunkLoadError. Forzando recarga de seguridad...");
        window.location.reload();
      }
    }
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Sentinel Error Boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center">
          <div className="space-y-6 max-w-md">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">
              Sincronización Interrumpida
            </h2>
            <p className="text-slate-500 text-sm font-mono uppercase tracking-tight">
              Se detectó una inconsistencia en los módulos de Sentinel. 
              El sistema se está reajustando automáticamente...
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
            >
              Reconectar Manualmente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
