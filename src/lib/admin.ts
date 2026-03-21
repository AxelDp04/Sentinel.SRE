import { createClient } from "@supabase/supabase-js";

/**
 * Sentinel SRE - Multi-Project Admin Engine
 * This factory returns a Supabase Admin client for specific projects.
 */

const projectConfigs: Record<string, { url: string; key: string }> = {
  sentinel: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  arqovex: {
    url: process.env.ARQOVEX_SUPABASE_URL || "",
    key: process.env.ARQOVEX_SUPABASE_SERVICE_ROLE_KEY || "",
  },
  auditacar: {
    url: process.env.AUDITACAR_SUPABASE_URL || "",
    key: process.env.AUDITACAR_SUPABASE_SERVICE_ROLE_KEY || "",
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
    if (process.env.NODE_ENV === "production") {
      console.warn(`Credentials missing for project: ${projectId}`);
    }
    return null;
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
  return Object.keys(projectConfigs).filter(id => projectConfigs[id].url && projectConfigs[id].key);
};
