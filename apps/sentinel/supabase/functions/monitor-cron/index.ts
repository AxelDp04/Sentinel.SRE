import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
const VERCEL_PROJECT_ID = Deno.env.get('VERCEL_PROJECT_ID');

const PROJECTS = [
  { id: 'arqovex', url: 'https://arqovex.com' },
  { id: 'auditacar', url: 'https://auditacar.com' },
  { id: 'agentscout', url: 'https://agentscout.com' }
];

Deno.serve(async (_req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const results = [];

  // 1. SERVICE HEALTH CHECKS
  for (const project of PROJECTS) {
    const start = performance.now();
    try {
      const res = await fetch(project.url, { method: 'HEAD' });
      const latency = Math.round(performance.now() - start);
      
      const log = {
        service_id: project.id,
        status: res.ok ? 'online' : 'offline',
        latency,
        error: res.ok ? null : `HTTP_${res.status}`
      };
      
      await supabase.from('service_logs').insert(log);
      results.push(log);
    } catch (err) {
      const log = {
        service_id: project.id,
        status: 'offline',
        latency: Math.round(performance.now() - start),
        error: err.message
      };
      await supabase.from('service_logs').insert(log);
      results.push(log);
    }
  }

  // 2. VERCEL DEPLOYMENT MONITORING
  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    try {
      const vRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1`, {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
      });
      const vData = await vRes.json();
      const latest = vData.deployments?.[0];

      if (latest && latest.state === 'ERROR') {
        // AUTO-ROLLBACK LOGIC
        // We detect an error. Log it as CRITICAL.
        await supabase.from('service_logs').insert({
          service_id: 'sentinel-watchman',
          status: 'offline',
          latency: 0,
          error: `DEPLOYMENT_ERROR: ${latest.id}`,
          metadata: { action: 'AUTO_ROLLBACK_SUGGESTED', deployment_id: latest.id }
        });

        // Trigger Rollback (Calling Vercel API)
        // Find the last SUCCESSFUL deployment to rollback to
        const historyRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&state=READY&limit=1`, {
          headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
        });
        const historyData = await historyRes.json();
        const lastStable = historyData.deployments?.[0];

        if (lastStable) {
          const rollbackRes = await fetch(`https://api.vercel.com/v2/projects/${VERCEL_PROJECT_ID}/rollback/${lastStable.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
          });
          
          if (rollbackRes.ok) {
             await supabase.from('service_logs').insert({
              service_id: 'sentinel-watchman',
              status: 'online',
              latency: 0,
              error: `ROLLBACK_EXECUTED: to ${lastStable.id}`,
              metadata: { action: 'AUTO_ROLLBACK_SUCCESS' }
            });
          }
        }
      }
    } catch (vErr) {
      console.error('Vercel Monitor Error:', vErr.message);
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
