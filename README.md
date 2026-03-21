# 🛡️ Sentinel SRE Dashboard
**Centro de Mando de Ingeniería y Vigilancia de Infraestructura**

Sentinel SRE es un ecosistema de monitoreo distribuido de alta fidelidad, diseñado para centralizar la telemetría, el estado de salud y la métrica de disponibilidad de tres pilares críticos de infraestructura: **ARQOVEX**, **AuditaCar RD**, y **AgentScout**. Este sistema implementa principios de **Site Reliability Engineering (SRE)** para transformar el monitoreo reactivo en una vigilancia proactiva y automatizada.

## 🏗️ Arquitectura de Sistemas

La plataforma utiliza una arquitectura moderna desacoplada que garantiza resistencia y baja latencia en la visualización de datos en tiempo real.

```mermaid
graph TD
    subgraph "Clients"
        WEB[Next.js 14 Dashboard]
    end

    subgraph "Core Infrastructure"
        AL[API Layer / Edge Functions]
        SUPA[(Supabase - Telemetry & Auth)]
        NEON[(Neon.tech - Operational DB)]
    end

    subgraph "Monitored Services"
        ARQ[ARQOVEX]
        AUD[AuditaCar RD]
        ASC[AgentScout]
        VER[Vercel Deployments Status]
    end

    WEB <--> AL
    AL <--> SUPA
    AL <--> NEON
    AL <--> VER
    AL -- Periodic Health Pings --> Monitored Services
```

### Stack Tecnológico de Grado de Ingeniería
- **Frontend Core:** Next.js 14 (App Router) con tipado estricto en **TypeScript**.
- **UI Engine:** Tailwind CSS con diseño basado en **Glassmorphism** para visualización de alta densidad de datos.
- **Data Persistence:** Arquitectura híbrida entre **Neon.tech** (PostgreSQL Serverless) y **Supabase** (Real-time & Edge Computing).
- **Automation:** **Supabase Edge Functions** (Deno) para la lógica distribuida de chequeos de salud (pings).

## 🧩 Desafíos Técnicos y Soluciones de Ingeniería

### Migración Estratégica a Neon.tech
Uno de los hitos más críticos en el desarrollo de la infraestructura de este ecosistema fue la migración de la capa de bases de datos de servicios como AuditaCar desde Supabase hacia **Neon.tech**. Este cambio optimizó los tiempos de respuesta mediante su arquitectura serverless y permitió una mayor escalabilidad horizontal. Se implementó una lógica de *Connection Pooling* para manejar pings intensivos sin degradar la base de datos operativa.

### Agregación de Telemetría Multifuente (Multi-API Integration)
Consolidar datos de múltiples fuentes (**Vercel API**, pings directos, métricas de DB) requiere una capa de orquestación eficiente. Se diseñó un sistema de agregación en el backend (Edge Functions) para reducir el *overhead* en el cliente, permitiendo que el dashboard reciba un estado unificado ("Single Source of Truth") en milisegundos.

## 🛡️ Núcleo SRE (Site Reliability Engineering)

- **Health Radar:** Un sistema de sondeo asíncrono que evalúa la disponibilidad de microservicios sin impacto colateral.
- **Latency Tracker:** Implementación de análisis de series temporales para identificar degradaciones en el rendimiento antes de un fallo crítico (MTBF optimization).
- **Incident Response:** Reducción del *Mean Time To Repair* (MTTR) mediante la centralización de registros de error de múltiples plataformas en un comando único.

---
### ⚙️ Local Development
*Entorno de ingeniería:*
```bash
npm install
npm run dev
```

*Desarrollado con enfoque en Confiabilidad y Escalabilidad de Sistemas.*
