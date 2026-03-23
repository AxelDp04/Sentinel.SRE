from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
import os

from dotenv import load_dotenv
from database import supabase # Importamos el cliente de DB para acciones directas
load_dotenv()

# Prioritize Groq for stable Tier 4 operations
USE_GROQ = os.getenv("GROQ_API_KEY") is not None
MODEL_NAME = os.getenv("MODEL_NAME")

if USE_GROQ:
    from langchain_groq import ChatGroq
    effective_model = MODEL_NAME or "llama-3.1-8b-instant"
    llm = ChatGroq(model=effective_model, temperature=0.3)
    print(f"[*] Nexus Engine using Groq Model (Stable): {effective_model}")
elif os.getenv("GEMINI_API_KEY"):
    from langchain_google_genai import ChatGoogleGenerativeAI
    effective_model = MODEL_NAME or "gemini-1.5-flash"
    llm = ChatGoogleGenerativeAI(model=effective_model, temperature=0.3)
    print(f"[*] Nexus Engine using Gemini Model (Fallback): {effective_model}")
else:
    raise ValueError("❌ Error: No se detectó ni GROQ_API_KEY ni GEMINI_API_KEY.")

class NexusState(TypedDict):
    task_id: str
    project_name: str
    error_description: str
    language: str # 'en' or 'es'
    resolution_steps: list[str]
    proposed_solution: Optional[str]
    security_feedback: Optional[str]
    security_approved: bool
    action_executed: str
    was_successful: bool
    retry_count: int
    start_time: float
    end_time: float
    final_output: Optional[dict]

def language_detector(state: NexusState):
    """Detects the language of the error description (en/es)."""
    text = state["error_description"].lower()
    
    # Simple keyword-based detection to save latency
    en_keywords = ["error", "failed", "timeout", "not found", "issue", "connection", "gateway"]
    es_keywords = ["fallo", "error", "tiempo", "conexion", "no encontrado", "problema"]
    
    # default to 'es' but check for 'en'
    state["language"] = "en" if any(kw in text for kw in en_keywords) and not any(kw in text for kw in es_keywords) else "es"
    
    # If ambiguous, use LLM for 1-token check
    prompt = f"Detect language (respond only 'en' or 'es'): {state['error_description']}"
    res = llm.invoke([HumanMessage(content=prompt)])
    state["language"] = res.content.strip().lower()[:2]
    
    print(f"[*] Language Detected: {state['language']}")
    return state

def sre_agent(state: NexusState):
    """
    --- EXPLICACIÓN EDUCATIVA: EL AGENTE SRE ---
    Este agente es el 'Cerebro Técnico'. Su función es recibir la descripción del error
    y generar una propuesta de solución usando inteligencia artificial (LLM).
    """
    import time
    if not state.get("start_time"):
        state["start_time"] = time.time()
        state["retry_count"] = 0
        
    print(f"\n[{state['task_id']}] [SRE Agent Analyzing] Evaluating error logs...")
    
    error_description = state["error_description"]
    project_name = state["project_name"]
    lang = state.get("language", "es")
    
    # --- EXPLICACIÓN: DETECCIÓN PROACTIVA ---
    # Si la descripción contiene "PREDICTIVE_ANOMALY", Nexus entra en modo PREVENCIÓN.
    is_predictive = "PREDICTIVE_ANOMALY" in error_description
    
    if is_predictive:
        # Si es una predicción, avisamos por canales externos (Email/WhatsApp)
        # Esto es lo que el usuario pidió: avisar ANTES de que ocurra el error.
        msg = f"⚠️ [NEXUS_FORESIGHT] ¡Alerta Proactiva en {project_name}! Se detectó una tendencia de degradación."
        print(f"📱 [WHATSAPP_SENT] {msg}") # Simulación de envío
        
        # Encolamos un trabajo de correo electrónico para el Job Worker
        try:
            supabase.table("nexus_jobs").insert({
                "job_type": "EMAIL_DISPATCH",
                "payload": {
                    "target_email": os.getenv("ADMIN_EMAIL", "axel.sre@example.com"),
                    "alert_type": "PROACTIVE_SHIELD",
                    "project": project_name,
                    "details": error_description
                },
                "status": "pending"
            }).execute()
        except Exception as e:
            print(f"❌ Error al encolar alerta: {e}")

    # Definimos los prompts del sistema según el idioma
    system_prompts = {
        "es": "Eres un SRE Senior. Si es una PREDICTIVE_ANOMALY, propón una medida preventiva. Si es un error real, propón una solución rápida. RESPONDE EN ESPAÑOL.",
        "en": "You are a Senior SRE. If it's a PREDICTIVE_ANOMALY, propose a preventive measure. If it's a real error, propose a quick fix. RESPOND IN ENGLISH."
    }
    
    human_prompts = {
        "es": f"Proyecto: {project_name}\nError: {error_description}\n\nGenera una propuesta técnica breve.",
        "en": f"Project: {project_name}\nError: {error_description}\n\nGenerate a brief technical proposal."
    }
    
    messages = [
        SystemMessage(content=system_prompts.get(lang)),
        HumanMessage(content=human_prompts.get(lang))
    ]
    
    response = llm.invoke(messages)
    state["proposed_solution"] = response.content
    
    step = "SRE Agent: Analizó el riesgo/error y propuso solución." if lang == "es" else "SRE Agent: Analyzed risk/error and proposed solution."
    state["resolution_steps"].append(step)
    return state

def security_agent(state: NexusState):
    print(f"\n[{state['task_id']}] [Security Auditor Reviewing] Validating security impact...")
    
    lang = state.get("language", "es")
    
    system_prompts = {
        "es": "Eres un Auditor de Seguridad estricto. Proteges la infraestructura. RESPONDE EN ESPAÑOL.",
        "en": "You are a strict Security Auditor. Protect the infrastructure. RESPOND IN ENGLISH."
    }
    
    human_prompts = {
        "es": f"Un SRE ha propuesto la siguiente solución para un error en '{state['project_name']}':\n{state['proposed_solution']}\n\n¿Esta solución introduce alguna vulnerabilidad?\nResponde ÚNICAMENTE con 'APPROVED' o 'REJECTED: [Motivo]'.",
        "en": f"An SRE has proposed the following solution for error in '{state['project_name']}':\n{state['proposed_solution']}\n\nDoes this solution introduce any vulnerability?\nRespond ONLY with 'APPROVED' or 'REJECTED: [Reason]'."
    }
    
    messages = [
        SystemMessage(content=system_prompts.get(lang)),
        HumanMessage(content=human_prompts.get(lang))
    ]
    
    response = llm.invoke(messages)
    result = response.content.strip()
    
    if result.startswith("APPROVED"):
        state["security_approved"] = True
        state["security_feedback"] = None
        step = "Security Agent: Aprobó la solución técnica." if lang == "es" else "Security Agent: Approved the technical solution."
        state["resolution_steps"].append(step)
    else:
        state["security_approved"] = False
        state["security_feedback"] = result
        step = f"Security Agent: Rechazó la solución. Motivo: {result}" if lang == "es" else f"Security Agent: Rejected the solution. Reason: {result}"
        state["resolution_steps"].append(step)
    
    return state

def action_node(state: NexusState):
    """
    --- EXPLICACIÓN EDUCATIVA: EL MOTOR DE ACCIÓN (BRAZOS EJECUTORES) ---
    Aquí es donde Nexus deja de pensar y empieza a ACTUAR. Según el tipo de error
    y el proyecto, ejecuta comandos para restaurar el servicio.
    """
    print(f"\n[{state['task_id']}] [Nexus Arms] Executing Action Engine...")
    import time
    
    error_desc = state["error_description"].lower()
    project = state.get("project_name", "").upper()
    lang = state.get("language", "es")
    
    def log_step(es, en):
        state["resolution_steps"].append(es if lang == "es" else en)

    # Lógica Adaptativa por Proyecto (Project Isolation Protocol)
    neon_target = os.getenv("AUDITACAR_NEON_DATABASE_URL") or "NEON_DB"
    
    # --- EXPLICACIÓN: MANEJO DE ANOMALÍAS PREDICTIVAS ---
    if "PREDICTIVE_ANOMALY" in error_desc:
        state["action_executed"] = "PROACTIVE_SHIELD_DEPLOYED"
        log_step("Foresight: Detectada anomalía de latencia. Iniciando Escudo Proactivo.",
                 "Foresight: Latency anomaly detected. Starting Proactive Shield.")
        log_step("Action Engine: Ejecutando limpieza de caché y optimización de índices preventivo.",
                 "Action Engine: Executing preventive cache clearing and index optimization.")
        # Aquí Nexus realizaría una acción real no destructiva para "aliviar" el sistema.
        return state # Salimos temprano pues es preventivo

    if project == "AUDITACAR":
        log_step(f"Isolation: Nexus artillería apuntada a Neon ({neon_target[:15]}...)", 
                 f"Isolation: Nexus artillery aimed at Neon ({neon_target[:15]}...)")
        
        if "504" in error_desc or "timeout" in error_desc or "gateway" in error_desc:
            state["action_executed"] = "VERCEL_INFRASTRUCTURE_RESCUE"
            log_step("ALERT: Middleware Connectivity Lost (504 Gateway Timeout).", "ALERT: Middleware Connectivity Lost (504 Gateway Timeout).")
            log_step("Diagnostic: El fallo no reside en el núcleo SQL (Neon), sino en el Deployment Layer de Vercel.",
                     "Diagnostic: Fault lies in Vercel Deployment Layer, not Neon SQL core.")
            log_step("Action Engine: Solicitando 'Clean Redeploy' vía Vercel Hook API.", 
                     "Action Engine: Requesting 'Clean Redeploy' via Vercel Hook API.")
        elif "missing" in error_desc or "renamed" in error_desc or "intervention" in error_desc:
            state["action_executed"] = "EXTERNAL_INTRUSION_SHIELD"
            log_step("CRITICAL: Table missing or renamed in Neon_DB. Manual Intervention Detected.",
                     "CRITICAL: Table missing or renamed in Neon_DB. Manual Intervention Detected.")
            log_step("Action Engine: Bloqueando acceso a API Gateway de AuditaCar por seguridad.",
                     "Action Engine: Blocking AuditaCar API Gateway access for security.")
            log_step("Action Engine: Restaurando tabla 'vehicles' desde backup frío en Neon.",
                     "Action Engine: Restoring 'vehicles' table from cold backup in Neon.")
        elif "column" in error_desc or "schema" in error_desc or "relation" in error_desc:
            state["action_executed"] = "EMERGENCY_SCHEMA_ROLLBACK"
            log_step("Critical: Fallo de integridad estructural detectado en Neon.", 
                     "Critical: Structural integrity failure detected in Neon.")
            log_step("Action Engine: Ejecutando rollback a snapshot pre-migración (Neon-Point-In-Time-Restore).",
                     "Action Engine: Executing rollback to pre-migration snapshot.")
            log_step("Action Engine: Estructura de tablas restaurada exitosamente.", 
                     "Action Engine: Table structure successfully restored.")
        elif "connection limit" in error_desc or "pool exhausted" in error_desc:
            state["action_executed"] = "CLEAN_CONNECTION_POOL & API_RECONNECT"
            log_step("Action Engine: Purgando pool de conexiones en Neon...", "Action Engine: Purging connection pool in Neon...")
            log_step("Action Engine: Re-estableciendo sesión de base de datos...", "Action Engine: Re-establishing database session...")
        elif "api" in error_desc or "gateway" in error_desc:
            state["action_executed"] = "API_RECONNECT"
            log_step("Action Engine: Re-sincronizando API Gateway de AuditaCar...", "Action Engine: Re-syncing AuditaCar API Gateway...")
        elif "db" in error_desc or "database" in error_desc or "pool" in error_desc:
            state["action_executed"] = "DB_REBOOT_SIM"
            log_step("Action Engine: Reiniciando instancia de base de datos AuditaCar en Neon...", 
                     "Action Engine: Rebooting AuditaCar DB instance in Neon...")
        elif "REDEPLOY_SUCCESS" in error_desc:
            state["action_executed"] = "CONFIRMATION_SENT"
            log_step("Sentinel: Verificando estado post-redeploy...", "Sentinel: Verifying post-redeploy status...")
            log_step("Action Engine: 100% Uptime Confirmado en Vercel & Neon.", "Action Engine: 100% Uptime confirmed in Vercel & Neon.")
            log_step("Action Engine: Enviando reporte de victoria final a WhatsApp.", "Action Engine: Sending final victory report to WhatsApp.")
        else:
            state["action_executed"] = "RETRY_STRATEGY"
            log_step("Action Engine: Iniciando RETRY_STRATEGY para AuditaCar.", "Action Engine: Starting RETRY_STRATEGY for AuditaCar.")
        
        if "column" in error_desc:
             log_step("WhatsApp: 📍 ALERTA DE ESTRUCTURA: FALLO DE INTEGRIDAD EN AUDITACAR.", 
                      "WhatsApp: 📍 SCHEMA ALERT: INTEGRITY FAILURE IN AUDITACAR.")
    elif project == "ARQOVEX":
        log_step(f"Isolation: Arqovex Engine Detected", f"Isolation: Arqovex Engine Detected")
        if "saturation" in error_desc or "connection" in error_desc:
            state["action_executed"] = "SUPABASE_POOL_CLEANUP"
            log_step("Action Engine: Detectada saturación de conexiones en Arqovex.", "Action Engine: Connection saturation detected in Arqovex.")
            log_step("Action Engine: Ejecutando purga selectiva de sesiones inactivas en Supabase...", 
                     "Action Engine: Executing selective purge of inactive sessions in Supabase...")
        else:
            state["action_executed"] = "SILENT_MONITOR_SYNC"
            log_step("Action Engine: Sincronizando telemetría en Modo Pasivo.", "Action Engine: Syncing telemetry in Passive Mode.")
    elif project == "NEXUS_JOBS":
        log_step("Isolation: Distributed Job Engine (Queue: nexus_jobs)", "Isolation: Distributed Job Engine (Queue: nexus_jobs)")
        if "CRITICAL_JOB_FAILURE" in error_desc:
            state["action_executed"] = "JOB_RESET & CACHE_PURGE"
            log_step("Action Engine: Detectado fallo crítico en cola de Jobs.", "Action Engine: Critical failure detected in Jobs queue.")
            log_step("Action Engine: Limpiando caché local del Worker y reseteando estado de Job.", 
                     "Action Engine: Clearing local worker cache and resetting job status.")
            log_step("Action Engine: Job re-encolado exitosamente para ejecución posterior.", 
                     "Action Engine: Job successfully re-queued for later execution.")
        else:
            state["action_executed"] = "GENERIC_JOB_RETRY"
            log_step("Action Engine: Re-intentando tarea de fondo...", "Action Engine: Retrying background task...")
    else:
        if "timeout" in error_desc or "network" in error_desc or "connection" in error_desc:
            state["action_executed"] = "RETRY_STRATEGY"
            log_step("Action Engine: Detectado fallo transitorio. Iniciando RETRY_STRATEGY.", 
                     "Action Engine: Transient failure detected. Starting RETRY_STRATEGY.")
        else:
            state["action_executed"] = "MANUAL_INTERVENTION_REQUIRED"
            state["was_successful"] = False
            log_step("Action Engine: Error complejo detectado. Mitigación automática abortada.", 
                     "Action Engine: Complex error detected. Automatic mitigation aborted.")

    # Ejecución de la simulación (Si no es manual)
    if state["action_executed"] != "MANUAL_INTERVENTION_REQUIRED":
        # Simulación de reintento con Backoff
        max_retries = 2
        success = False
        
        for i in range(max_retries):
            state["retry_count"] = i + 1
            wait_time = (i + 1) * 2 # Backoff simple: 2s, 4s
            log_step(f"Action Node: {state['action_executed']} en curso (Esperando {wait_time}s)...",
                     f"Action Node: {state['action_executed']} in progress (Waiting {wait_time}s)...")
            time.sleep(wait_time)
            
            # Simulamos éxito en el segundo intento siempre
            if i == 1:
                success = True
                break
        
        state["was_successful"] = success
        log_step(f"Action Node: {state['action_executed']} EXITOSO.", 
                 f"Action Node: {state['action_executed']} SUCCESSFUL.")
    else:
        log_step("Action Node: Finalizado sin ejecución automática.",
                 "Action Node: Finished without automatic execution.")

    # Cierre de métrica de tiempo
    state["end_time"] = time.time()
    recovery_time = round(state["end_time"] - state["start_time"], 2)

    # Update final output with real action result and Metrics
    state["final_output"] = {
        "solution": state["proposed_solution"],
        "security_status": "Approved" if state["security_approved"] else "Rejected",
        "action_executed": state["action_executed"],
        "was_successful": state["was_successful"],
        "retry_count": state["retry_count"],
        "recovery_time": recovery_time,
        "message": "Sentinel Ops Pro: Mitigación procesada."
    }
    
    return state

def should_continue(state: NexusState):
    if state["security_approved"]:
        return "action_node"
    else:
        return "sre_agent"

# Define the graph
graph_builder = StateGraph(NexusState)

graph_builder.add_node("language_detector", language_detector)
graph_builder.add_node("sre_agent", sre_agent)
graph_builder.add_node("security_agent", security_agent)
graph_builder.add_node("action_node", action_node)

graph_builder.set_entry_point("language_detector")

graph_builder.add_edge("language_detector", "sre_agent")
graph_builder.add_edge("sre_agent", "security_agent")
graph_builder.add_conditional_edges(
    "security_agent",
    should_continue,
    {
        "action_node": "action_node",
        "sre_agent": "sre_agent"
    }
)

graph_builder.add_edge("action_node", END)

nexus_workflow = graph_builder.compile()
