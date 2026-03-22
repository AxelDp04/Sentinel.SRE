/**
 * Sentinel SRE - Vercel API Bridge
 * Integration for deployment monitoring, rollbacks, and emergency redeploys.
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export interface VercelDeployment {
  uid: string;
  url: string;
  name: string;
  state: "READY" | "ERROR" | "BUILDING" | "CANCELED";
  createdAt: number;
}

export async function getLatestDeployments(): Promise<VercelDeployment[]> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return [];

  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=10&state=READY`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
    const data = await res.json();
    return data.deployments || [];
  } catch (error) {
    console.error("Vercel API Error (getLatestDeployments):", error);
    return [];
  }
}

/**
 * Get the last known READY deployment before the current one.
 * Used for automatic rollback to the last stable version.
 */
export async function getLastStableDeployment(): Promise<VercelDeployment | null> {
  const deployments = await getLatestDeployments();
  // Find the most recent READY deployment (skip the first which is current)
  const stable = deployments.filter((d) => d.state === "READY");
  return stable.length > 1 ? stable[1] : stable[0] ?? null;
}

/**
 * Rollback to the last stable deployment using Vercel's promote endpoint.
 */
export async function rollbackToLastStable(): Promise<{ success: boolean; deploymentUrl?: string; error?: string }> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return { success: false, error: "Vercel credentials not configured" };
  }

  try {
    const stable = await getLastStableDeployment();
    if (!stable) return { success: false, error: "No stable deployment found" };

    // Use Vercel's promote API to alias the last stable deployment as production
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/promote/${stable.uid}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {
      return { success: true, deploymentUrl: stable.url };
    }

    const err = await res.json();
    return { success: false, error: err.error?.message || `HTTP ${res.status}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/** Legacy: rollback by specific deployment ID */
export async function rollbackDeployment(deploymentId: string) {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return { success: false, error: "Missing config" };

  try {
    const res = await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/promote/${deploymentId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });
    return { success: res.ok, status: res.status };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
