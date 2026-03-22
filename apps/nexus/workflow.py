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
    final_output: Optional[dict]

def sre_agent(state: NexusState):
    print(f"\n[{state['task_id']}] [SRE Agent Analyzing] Evaluando logs de error...")
    
    # In a real environment, we would use pgvector to retrieve past incidents here
    # For now, we simulate the SRE analysis
    
    prompt = f"""
    Eres un SRE Senior diagnosticando un error en el proyecto '{state['project_name']}'.
    Descripción del error: {state['error_description']}
    
    Pasos de resolución previos / Feedback de seguridad: {state['security_feedback'] if state.get('security_feedback') else 'Ninguno'}
    
    Genera una propuesta de solución técnica en formato texto plano, sin Markdown extraño, que sea clara y directa.
    """
    
    messages = [
        SystemMessage(content="Eres un Site Reliability Engineer Senior obsesionado con el uptime."),
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
        
        # Prepare final JSON output
        state["final_output"] = {
            "solution": state["proposed_solution"],
            "security_status": "Approved",
            "message": "Solución verificada por IA y lista para aplicarse."
        }
    else:
        state["security_approved"] = False
        state["security_feedback"] = result
        state["resolution_steps"].append(f"Security Agent: Rechazó la solución. Motivo: {result}")
    
    return state

def action_node(state: NexusState):
    print(f"\n[{state['task_id']}] [Nexus Arms] Ejecutando Action Engine...")
    
    error_desc = state["error_description"].lower()
    
    # Lógica de RETRY_STRATEGY (Punto 3 de Axel)
    if "timeout" in error_desc or "network" in error_desc or "connection" in error_desc:
        state["action_executed"] = "RETRY_STRATEGY"
        state["resolution_steps"].append("Action Engine: Detectado fallo transitorio. Iniciando RETRY_STRATEGY.")
        
        # Simulación de reintento con Backoff (en un caso real llamaríamos a una API)
        import time
        max_retries = 2
        success = False
        
        for i in range(max_retries):
            wait_time = (i + 1) * 2 # Backoff simple: 2s, 4s
            state["resolution_steps"].append(f"Retry Node: Intento {i+1} en curso (Esperando {wait_time}s)...")
            time.sleep(wait_time)
            
            # En el sandbox, simulamos que el segundo intento siempre funciona
            if i == 1 or "test-success" in error_desc:
                success = True
                break
        
        state["was_successful"] = success
        if success:
            state["resolution_steps"].append("Retry Node: Reintento EXITOSO. Sistema restablecido.")
        else:
            state["resolution_steps"].append("Retry Node: Reintento FALLIDO tras varios intentos.")
    else:
        state["action_executed"] = "NONE (Manual required)"
        state["was_successful"] = False
        state["resolution_steps"].append("Action Engine: Error complejo detectado. No se disparó mitigación automática.")

    # Update final output with real action result
    state["final_output"] = {
        "solution": state["proposed_solution"],
        "security_status": "Approved",
        "action_executed": state["action_executed"],
        "was_successful": state["was_successful"],
        "message": "Mitigación automática procesada por Nexus Arms." if state["was_successful"] else "Intervención humana requerida."
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
