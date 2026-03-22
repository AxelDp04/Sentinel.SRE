"use client";

import React, { useState, useEffect } from "react";
import { StatusCard } from "./StatusCard";
import { PROJECTS } from "@/constants/projects";

export const ServiceStatus = () => {
  const [healthData, setHealthData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchHealth = () => {
      const data: Record<string, any> = {};
      PROJECTS.forEach(p => {
        data[p.id] = {
           status: p.id === 'arqovex' ? 'online' : (Math.random() > 0.05 ? 'online' : 'offline'),
           latency: Math.floor(Math.random() * 50) + 15
        };
        
        // Auto-Healing Trigger Simulation
        if (data[p.id].status === 'offline') {
           triggerHealing(p.id, { message: "Internal Server Error (Simulated)", code: 500 });
        }
      });
      setHealthData(data);
    };

    const triggerHealing = async (serviceName: string, error: any) => {
       try {
         await fetch("/api/admin/healing", {
           method: "POST",
           headers: { 
             "X-Admin-Key": sessionStorage.getItem("adminKey") || "",
             "Content-Type": "application/json"
           },
           body: JSON.stringify({ service_name: serviceName, error_payload: error })
         });
       } catch (e) {
         console.error("Auto-Healing failed to trigger");
       }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PROJECTS.map((project) => (
        <StatusCard 
          key={project.id}
          id={project.id}
          name={project.name}
          url={project.url}
          status={healthData[project.id]?.status || 'checking'}
          latency={healthData[project.id]?.latency}
          onRedeploy={(id) => console.log(`Triggering redeploy for ${id}`)}
        />
      ))}
    </div>
  );
};
