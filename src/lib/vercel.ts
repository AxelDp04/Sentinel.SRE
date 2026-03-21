/**
 * Sentinel SRE - Vercel API Bridge
 * Integration for deployment monitoring and emergency rollbacks.
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export interface VercelDeployment {
  id: string;
  url: string;
  name: string;
  state: "READY" | "ERROR" | "BUILDING" | "CANCELED";
  createdAt: number;
}

export async function getLatestDeployments(): Promise<VercelDeployment[]> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return [];

  try {
    const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=5`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });
    const data = await res.json();
    return data.deployments || [];
  } catch (error) {
    console.error("Vercel API Error:", error);
    return [];
  }
}

export async function rollbackDeployment(deploymentId: string) {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return { success: false, error: "Missing config" };

  try {
    // Vercel Rollback is typically achieved by aliasing a previous deployment 
    // or using the specific rollback endpoint if available in the API version.
    // For this implementation, we simulate the 'Alias' switch or trigger the rollback.
    const res = await fetch(`https://api.vercel.com/v2/projects/${VERCEL_PROJECT_ID}/rollback/${deploymentId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });
    
    return { success: res.ok, status: res.status };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
