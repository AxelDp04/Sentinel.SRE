"use client";

import React, { useEffect, useState } from "react";
import { PROJECTS } from "@/constants/projects";
import { StatusCard } from "./StatusCard";

export const ServiceStatus = () => {
  const [healthData, setHealthData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Simulate real-time health data
    const interval = setInterval(() => {
      const newData: Record<string, any> = {};
      PROJECTS.forEach(p => {
        newData[p.id] = {
          status: p.id === 'arqovex' ? 'online' : (Math.random() > 0.05 ? 'online' : 'offline'),
          latency: Math.floor(Math.random() * 50) + 15,
          uptime: 99.8 + (Math.random() * 0.2)
        };
      });
      setHealthData(newData);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PROJECTS.map((project) => (
        <StatusCard 
          key={project.id}
          name={project.name}
          description={project.description}
          status={healthData[project.id]?.status || 'checking'}
          latency={healthData[project.id]?.latency}
          uptime={healthData[project.id]?.uptime}
          iconName={project.icon}
        />
      ))}
    </div>
  );
};
