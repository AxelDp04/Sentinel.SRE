from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
import os

from dotenv import load_dotenv
load_dotenv()

# We can switch between Groq and Gemini easily
USE_GEMINI = os.getenv("GEMINI_API_KEY") is not None

# Model selection is now 100% dynamic via environment variables
MODEL_NAME = os.getenv("MODEL_NAME")

if USE_GEMINI:
    from langchain_google_genai import ChatGoogleGenerativeAI
    effective_model = MODEL_NAME or "gemini-1.5-flash"
    llm = ChatGoogleGenerativeAI(model=effective_model)
    print(f"[*] Nexus Engine using Gemini Model: {effective_model}")
else:
    from langchain_groq import ChatGroq
    effective_model = MODEL_NAME or "llama-3.3-70b-versatile"
    llm = ChatGroq(model=effective_model)
    print(f"[*] Nexus Engine using Groq Model: {effective_model}")

class NexusState(TypedDict):
    task_id: str
    project_name: str
    error_description: str
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

def sre_agent(state: NexusState):
    import time
    if not state.get("start_time"):
        state["start_time"] = time.time()
        state["retry_count"] = 0
        
    print(f"\n[{state['task_id']}] [SRE Agent Analyzing] Evaluando logs de error...")
    
    prompt = f"""
    Eres un SRE Senior diagnosticando un error en el proyecto '{state['project_name']}'.
    Descripción del error: {state['error_description']}
    
    Pasos de resolución previos / Feedback de seguridad: {state['security_feedback'] if state.get('security_feedback') else 'Ninguno'}
    
    Genera una propuesta de solución técnica MUY BREVE (máximo 150 caracteres) enfocada en la causa raíz.
    """
    
    messages = [
        SystemMessage(content="Eres un Site Reliability Engineer Senior. Resuélvelo rápido y breve. Sin explicaciones innecesarias."),
        HumanMessage(content=prompt)
    ]
    
    response = llm.invoke(messages)
    solution = response.content
    
    state["proposed_solution"] = solution
    state["resolution_steps"].append("SRE Agent: Analizó el error y propuso una solución técnica.")
    return state

def security_agent(state: NexusState):
    print(f"\n[{state['task_id']}] [Security Auditor Reviewing] Validando impacto de seguridad...")
    
    prompt = f"""
    Eres un Auditor de Seguridad para el proyecto '{state['project_name']}'.
    Un SRE ha propuesto la siguiente solución para un error:
    {state['proposed_solution']}
    
    ¿Esta solución introduce alguna vulnerabilidad o riesgo grave? 
    Responde ÚNICAMENTE con 'APPROVED' si es segura, o 'REJECTED: [Motivo]' si es peligrosa.
    """
    
    messages = [
        SystemMessage(content="Eres un Auditor de Seguridad estricto. Proteges la infraestructura."),
        HumanMessage(content=prompt)
    ]
    
    response = llm.invoke(messages)
    result = response.content.strip()
    
    if result.startswith("APPROVED"):
        state["security_approved"] = True
        state["security_feedback"] = None
        state["resolution_steps"].append("Security Agent: Aprobó la solución técnica.")
    else:
        state["security_approved"] = False
        state["security_feedback"] = result
        state["resolution_steps"].append(f"Security Agent: Rechazó la solución. Motivo: {result}")
    
    return state

def action_node(state: NexusState):
    print(f"\n[{state['task_id']}] [Nexus Arms] Ejecutando Action Engine...")
    import time
    
    error_desc = state["error_description"].lower()
    project = state.get("project_name", "").upper()
    
    # Lógica Adaptativa por Proyecto (Project Isolation Protocol)
    neon_target = os.getenv("AUDITACAR_NEON_DATABASE_URL")
    arqovex_target = os.getenv("ARQOVEX_SUPABASE_URL")
    
    if project == "AUDITACAR":
        state["resolution_steps"].append(f"Isolation: Nexus artillería apuntada a Neon ({neon_target[:15]}...)")
        if "504" in error_desc or "timeout" in error_desc.lower() or "gateway" in error_desc.lower():
            state["action_executed"] = "VERCEL_INFRASTRUCTURE_RESCUE"
            state["resolution_steps"].append("ALERT: Middleware Connectivity Lost (504 Gateway Timeout).")
            state["resolution_steps"].append("Diagnostic: El fallo no reside en el núcleo SQL (Neon), sino en el Deployment Layer de Vercel.")
            state["resolution_steps"].append("Action Engine: Solicitando 'Clean Redeploy' vía Vercel Hook API.")
        elif "missing" in error_desc.lower() or "renamed" in error_desc.lower() or "intervention" in error_desc.lower():
            state["action_executed"] = "EXTERNAL_INTRUSION_SHIELD"
            state["resolution_steps"].append("CRITICAL: Table missing or renamed in Neon_DB. Manual Intervention Detected.")
            state["resolution_steps"].append("Action Engine: Bloqueando acceso a API Gateway de AuditaCar por seguridad.")
            state["resolution_steps"].append("Action Engine: Restaurando tabla 'vehicles' desde backup frío en Neon.")
        elif "column" in error_desc or "schema" in error_desc or "relation" in error_desc:
            state["action_executed"] = "EMERGENCY_SCHEMA_ROLLBACK"
            state["resolution_steps"].append("Critical: Fallo de integridad estructural detectado en Neon.")
            state["resolution_steps"].append("Action Engine: Ejecutando rollback a snapshot pre-migración (Neon-Point-In-Time-Restore).")
            state["resolution_steps"].append("Action Engine: Estructura de tablas restaurada exitosamente.")
        elif "connection limit" in error_desc or "pool exhausted" in error_desc:
            state["action_executed"] = "CLEAN_CONNECTION_POOL & API_RECONNECT"
            state["resolution_steps"].append("Action Engine: Purgando pool de conexiones en Neon...")
            state["resolution_steps"].append("Action Engine: Re-estableciendo sesión de base de datos...")
        elif "api" in error_desc or "gateway" in error_desc:
            state["action_executed"] = "API_RECONNECT"
            state["resolution_steps"].append("Action Engine: Re-sincronizando API Gateway de AuditaCar...")
        elif "db" in error_desc or "database" in error_desc or "pool" in error_desc:
            state["action_executed"] = "DB_REBOOT_SIM"
            state["resolution_steps"].append("Action Engine: Reiniciando instancia de base de datos AuditaCar en Neon...")
        elif "REDEPLOY_SUCCESS" in error_desc:
            state["action_executed"] = "CONFIRMATION_SENT"
            state["resolution_steps"].append("Sentinel: Verificando estado post-redeploy...")
            state["resolution_steps"].append("Action Engine: 100% Uptime Confirmado en Vercel & Neon.")
            state["resolution_steps"].append("Action Engine: Enviando reporte de victoria final a WhatsApp.")
        else:
            state["action_executed"] = "RETRY_STRATEGY"
            state["resolution_steps"].append("Action Engine: Iniciando RETRY_STRATEGY para AuditaCar.")
        
        # WhatsApp Tier 4 Override for Integrity
        if "column" in error_desc:
             state["resolution_steps"].append("WhatsApp: 📍 ALERTA DE ESTRUCTURA: FALLO DE INTEGRIDAD EN AUDITACAR.")
    elif project == "ARQOVEX":
        state["resolution_steps"].append("Isolation: Modo Centinela Silencioso activado para ARQOVEX.")
        state["action_executed"] = "SILENT_MONITOR_SYNC"
        state["resolution_steps"].append(f"Action Engine: Sincronizando telemetría de Supabase ({arqovex_target[:15]}...)")
    else:
        # Default RETRY_STRATEGY
        if "timeout" in error_desc or "network" in error_desc or "connection" in error_desc:
            state["action_executed"] = "RETRY_STRATEGY"
            state["resolution_steps"].append("Action Engine: Detectado fallo transitorio. Iniciando RETRY_STRATEGY.")
        else:
            state["action_executed"] = "MANUAL_INTERVENTION_REQUIRED"
            state["was_successful"] = False
            state["resolution_steps"].append("Action Engine: Error complejo detectado. Mitigación automática abortada.")

    # Ejecución de la simulación (Si no es manual)
    if state["action_executed"] != "MANUAL_INTERVENTION_REQUIRED":
        # Simulación de reintento con Backoff
        max_retries = 2
        success = False
        
        for i in range(max_retries):
            state["retry_count"] = i + 1
            wait_time = (i + 1) * 2 # Backoff simple: 2s, 4s
            state["resolution_steps"].append(f"Action Node: {state['action_executed']} en curso (Esperando {wait_time}s)...")
            time.sleep(wait_time)
            
            # Simulamos éxito en el segundo intento siempre
            if i == 1:
                success = True
                break
        
        state["was_successful"] = success
        if success:
            state["resolution_steps"].append(f"Action Node: {state['action_executed']} EXITOSO.")
        else:
            state["resolution_steps"].append(f"Action Node: {state['action_executed']} FALLIDO.")

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

graph_builder.add_node("sre_agent", sre_agent)
graph_builder.add_node("security_agent", security_agent)
graph_builder.add_node("action_node", action_node)

graph_builder.set_entry_point("sre_agent")

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
