# 🚀# 🛰️ Nexus Sentinel Ecosystem
**Status: 100% Operational | Tier 4 Operations Ready**
**Last Golden Deployment: 2026-03-23 00:15 (Final Success)**

This repository contains the unified monitoring and autonomous healing infrastructure for AuditaCar, Arqovex, and AgentScout.
> "La infraestructura que no solo vigila, sino que resuelve."

Este es un ecosistema de **IA Agéntica aplicada a AIOps/DevOps** diseñado para crear infraestructuras *Zero-Maintenance*. Combina el monitoreo avanzado de **Sentinel** con el cerebro resolutivo de **Nexus**.

---

## 🏛️ Arquitectura del Monorepo

```bash
/apps
  ├── /sentinel  # Dashboad de Observabilidad (Next.js 14 + Tailwind)
  └── /nexus     # Motor de Agentes Autónomos (Python + LangGraph + Groq)
```

### 1. 👁️ Sentinel (The Eye)
Panel de control visual que muestra el estado de salud de todos los proyectos (AuditaCar, ARQOVEX, etc.).
- **Stack:** Next.js 14, Lucide Icons, React Flow (IA Nodes Visualization).
- **Realtime:** Suscrito a eventos de Supabase para streaming de logs de la IA en vivo.

### 2. 🧠 Nexus (The Brain)
Motor de multi-agentes que procesa incidentes detectados por Sentinel.
- **Stack:** Python 3.11, LangGraph, Groq (Llama-3), Supabase (pgvector).
- **Flujo de Agentes:**
  - **SRE Senior:** Analiza errores y propone soluciones basadas en contexto histórico.
  - **Security Auditor:** Valida que las soluciones no comprometan la seguridad.

---

## 🛠️ Guía de Inicio Rápido

### Requisitos Previos
- Node.js 18+
- Python 3.11+
- Cuenta en Supabase y Groq (o Google Gemini)

### Despliegue Local
1. **Configuración de Variables:**
   - Ve a `apps/nexus` y crea un `.env` basado en `.env.example`.
   - Ve a `apps/sentinel` y crea un `.env.local` con tus claves de Supabase.

2. **Lanzar Nexus Engine:**
   ```bash
   cd apps/nexus
   # Ejecuta el script de un solo clic
   .\run_nexus.bat
   ```

3. **Lanzar Sentinel Dashboard:**
   ```bash
   cd apps/sentinel
   npm install
   npm run dev
   ```

---

## 🎯 Por qué este proyecto es Disruptivo
- **Reducción de MTTR:** La IA propone y valida soluciones en segundos, no horas.
- **Escalabilidad:** Arquitectura de agents preparada para añadir expertos en SEO, Performance o Costos.
- **DevOps 2.0:** Uso real de IA Agéntica para la resolución autónoma de incidentes de infraestructura.

---
**Desarrollado para el HUB de Antigravity.** 🚀
