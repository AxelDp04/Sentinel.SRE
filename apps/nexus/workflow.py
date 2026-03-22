from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
import os

from dotenv import load_dotenv
load_dotenv()

# We can switch between Groq and Gemini easily
USE_GEMINI = os.getenv("GEMINI_API_KEY") is not None

if USE_GEMINI:
    from langchain_google_genai import ChatGoogleGenerativeAI
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
else:
    from langchain_groq import ChatGroq
    # Use the MODEL_NAME from environment variables, fallback to stable versatile
    model_name = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
    llm = ChatGroq(model=model_name)

class NexusState(TypedDict):
    task_id: str
    project_name: str
    error_description: str
    resolution_steps: list[str]
    proposed_solution: Optional[str]
    security_feedback: Optional[str]
    security_approved: bool
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

def should_continue(state: NexusState):
    if state["security_approved"]:
        return "end"
    else:
        return "sre_agent"

# Define the graph
graph_builder = StateGraph(NexusState)

graph_builder.add_node("sre_agent", sre_agent)
graph_builder.add_node("security_agent", security_agent)

graph_builder.set_entry_point("sre_agent")

graph_builder.add_edge("sre_agent", "security_agent")
graph_builder.add_conditional_edges(
    "security_agent",
    should_continue,
    {
        "end": END,
        "sre_agent": "sre_agent"
    }
)

nexus_workflow = graph_builder.compile()
