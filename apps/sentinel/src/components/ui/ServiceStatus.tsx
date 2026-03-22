"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatusCard } from "./StatusCard";
import { PROJECTS } from "@/constants/projects";

interface ServiceStatusProps {
  adminKey: string | null;
}

interface HealthEntry {
  status: 'online' | 'offline' | 'checking';
  latency?: number;
  httpCode?: number;
  error?: string;
}

export const ServiceStatus = ({ adminKey }: ServiceStatusProps) => {
  const [healthData, setHealthData] = useState<Record<string, HealthEntry>>(
    // Start all as 'checking' while we probe
    Object.fromEntries(PROJECTS.map(p => [p.id, { status: 'checking' as const }]))
  );

  const triggerHealing = useCallback(async (serviceName: string, error: any) => {
    const key = adminKey || "AxelDp04";
    try {
      await fetch("/api/admin/healing", {
        method: "POST",
        headers: {
          "X-Admin-Key": key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ service_name: serviceName, error_payload: error })
      });
    } catch (e) {
      console.error("Auto-Healing failed to trigger");
    }
  }, [adminKey]);

  const fetchHealth = useCallback(async () => {
    const key = adminKey || "AxelDp04";
    try {
      const res = await fetch("/api/admin/health", {
        headers: { "X-Admin-Key": key }
      });

      if (!res.ok) {
        // If API fails, fall back gracefully — keep 'checking' or last known state
        console.warn("Health API returned:", res.status);
        return;
      }

      const { health } = await res.json();

      if (health) {
        setHealthData(prev => {
          const next = { ...prev };
          for (const [id, data] of Object.entries(health as Record<string, HealthEntry>)) {
            const wasOnline = prev[id]?.status === 'online';
            const isNowOffline = (data as HealthEntry).status === 'offline';

            // Auto-healing: if a service just went offline, trigger the engine
            if (wasOnline && isNowOffline) {
              const entry = data as any;
              triggerHealing(id.toUpperCase(), {
                status: entry.httpCode || 500,
                message: entry.error || "Service offline detected by Health Radar",
              });
            }

            next[id] = data as HealthEntry;
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Health fetch failed:", err);
    }
  }, [adminKey, triggerHealing]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {PROJECTS.map((project) => (
        <StatusCard
          key={project.id}
          id={project.id}
          name={project.name}
          url={project.url}
          adminKey={adminKey}
          status={healthData[project.id]?.status || 'checking'}
          latency={healthData[project.id]?.latency}
          onRedeploy={async (id) => {
            await triggerHealing(id.toUpperCase(), {
              status: 502,
              message: "Manual redeploy requested via Dashboard",
            });
          }}
        />
      ))}
    </div>
  );
};
