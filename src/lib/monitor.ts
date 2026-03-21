/**
 * Sentinel SRE - Telemetry Monitoring Library
 * Focus: High-precision latency measurement and status verification.
 */

export interface HealthCheckResult {
  status: "online" | "offline";
  latency: number;
  statusCode?: number;
  error?: string;
}

export async function checkServiceHealth(url: string): Promise<HealthCheckResult> {
  const start = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: "HEAD", // Optimized for checking availability without downloading body
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "Sentinel-SRE-Monitor/1.0",
      },
      // Handling redirects automatically
      redirect: "follow"
    });

    clearTimeout(timeoutId);
    const end = performance.now();
    const latency = Math.round(end - start);

    // Some servers might return 405 for HEAD, fallback to GET if needed
    if (response.status === 405) {
      return await checkServiceHealthWithGet(url);
    }

    return {
      status: response.ok ? "online" : "offline",
      latency,
      statusCode: response.status,
    };
  } catch (error) {
    // If HEAD fails, try one last GET fallback (common for some CDNs)
    return await checkServiceHealthWithGet(url);
  }
}

async function checkServiceHealthWithGet(url: string): Promise<HealthCheckResult> {
  const start = performance.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { "User-Agent": "Sentinel-SRE-Monitor/1.0" },
    });
    const end = performance.now();
    return {
      status: response.ok ? "online" : "offline",
      latency: Math.round(end - start),
      statusCode: response.status,
    };
  } catch (err) {
    const end = performance.now();
    return {
      status: "offline",
      latency: Math.round(end - start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
