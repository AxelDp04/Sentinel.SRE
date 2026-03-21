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
    // Use a timeout to avoid hanging pings
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: "GET", // Some servers block HEAD, so we use GET
      signal: controller.signal,
      cache: "no-store", // Ensure we don't get cached results
      headers: {
        "User-Agent": "Sentinel-SRE-Monitor/1.0",
      },
    });

    clearTimeout(timeoutId);
    const end = performance.now();
    const latency = Math.round(end - start);

    return {
      status: response.ok ? "online" : "offline",
      latency,
      statusCode: response.status,
    };
  } catch (error) {
    const end = performance.now();
    return {
      status: "offline",
      latency: Math.round(end - start),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
