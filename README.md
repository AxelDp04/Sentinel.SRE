# 🛡️ Sentinel SRE: Infrastructure Command Center

[![Build Status](https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge&logo=next.js)](https://github.com/AxelDp04/Sentinel.SRE)
[![SRE Status](https://img.shields.io/badge/Watchman-Autonomous-blue?style=for-the-badge&logo=supabase)](https://github.com/AxelDp04/Sentinel.SRE)
[![Architecture](https://img.shields.io/badge/Architecture-Tactical-amber?style=for-the-badge)](https://github.com/AxelDp04/Sentinel.SRE)

**Sentinel SRE** is an advanced engineering ecosystem designed for the centralized supervision of digital infrastructure health, performance, and availability. It acts as a tactical mission control for high-criticality applications like ARQOVEX and AuditaCar RD.

---

## 🏛️ Engineering Architecture

The platform is built on a distributed monitoring philosophy, ensuring zero-bottleneck telemetry and persistent observability.

- **Frontend:** Next.js 14 (App Router) with a Cyberpunk-inspired Glassmorphism design system.
- **Telemetry Engine:** High-precision latency measurement using `performance.now()` with automated CORS-proxy resolution.
- **Persistence Layer:** Supabase PostgreSQL for storing high-resolution telemetry logs and mission-critical activity.
- **Automation (The Watchman):** Supabase Edge Functions executing autonomous health checks every 15 minutes, independent of the dashboard state.
- **Data Visualization:** Real-world trend analysis using Recharts, mapping 24h performance cycles.

## 🛠️ Technical Challenges & Solutions

### 📡 Multi-Database Telemetry
Managing observability across isolated platforms (**Neon.tech** for AuditaCar and **Supabase** for ARQOVEX) required a unified proxy layer. I implemented an API-based health-check system that bypasses CORS restrictions while measuring exact round-trip latency.

### 🤖 Autonomous Observability
To move beyond manual monitoring, I developed the **Watchman Engine**. Using Supabase Edge Functions and `pg_cron` concepts, the system maintains a 24/7 logging heartbeat, allowing the dashboard to calculate accurate **24h Uptime %** metrics even after long periods of inactivity.

### 🗺️ Infrastructure Topology
The **Infra Map** is a custom SVG-based visualization that reflects live system connectivity. It utilizes real-time state synchronization to animate data flows, providing immediate visual feedback of network health.

---

## 🕹️ Command & Control
The **Admin Command Center** provides a secured interface for:
- **Purge Cache:** Instant Vercel asset invalidation.
- **Force Refresh:** Manual telemetry override.
- **DB Vacuum:** Database optimization triggers.
- **Audit Logs:** Full traceability of administrative maneuvers.

---

## 🏗️ Local Development

<details>
<summary>Click to expand setup instructions</summary>

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure environment variables in `.env.local` (see `.env.local.example`).
4. Run the development server: `npm run dev`.
5. For production build: `npm run build`.

</details>

---

*Designed and Engineered for Reliability.*
