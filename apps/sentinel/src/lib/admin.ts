import { createClient } from "@supabase/supabase-js";

/**
 * Sentinel SRE - Multi-Project Admin Engine
 * This factory returns a Supabase Admin client for specific projects.
 */

const projectConfigs: Record<string, { url: string; key: string }> = {
  sentinel: {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://badqkfvbymxyqtwpnejd.supabase.co").trim(),
    key: (process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo").trim(),
  },
  arqovex: {
    url: "https://rdbdwvwmnozumwtxdmra.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkYmR3dndtbm96dW13dHhkbXJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MzY0NywiZXhwIjoyMDg4NzI5NjQ3fQ.DHAAEGouQWmjH8yYBsu53uTveIJxtThpOncv2e27yjY".trim(),
  },
  auditacar: {
    url: (process.env.AUDITACAR_SUPABASE_URL || "").trim(),
    key: (process.env.AUDITACAR_SUPABASE_SERVICE_ROLE_KEY || "").trim(),
  },
  agentscout: {
    url: process.env.AGENTSCOUT_SUPABASE_URL || "",
    key: process.env.AGENTSCOUT_SUPABASE_SERVICE_ROLE_KEY || "",
  }
};

const clients: Record<string, any> = {};

export const getSupabaseAdmin = (projectId: string = 'sentinel') => {
  if (clients[projectId]) return clients[projectId];

  const config = projectConfigs[projectId];
  if (!config || !config.url || !config.key) {
    if (process.env.NODE_ENV === "production" && projectId !== 'sentinel') {
      console.warn(`Credentials missing for project: ${projectId}`);
    }
    return null;
  }

  const segments = (config.key || "").split(".");
  if (segments.length !== 3) {
    console.error(`[ADMIN_DEBUG] Project ${projectId} has invalid JWT segments: ${segments.length}`);
  }

  clients[projectId] = createClient(config.url, config.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return clients[projectId];
};

export const getAllConfiguredProjects = () => {
  return Object.keys(projectConfigs).filter(id => {
     // Special case for arqovex as it's now hardcoded with the fixed key
     if (id === 'arqovex') return true;
     return projectConfigs[id].url && projectConfigs[id].key;
  });
};
