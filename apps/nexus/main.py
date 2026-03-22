import asyncio
import os
from fastapi import FastAPI, BackgroundTasks
from contextlib import asynccontextmanager
from database import get_pending_tasks, update_task_status, append_resolution_step, update_task_resolved, supabase
from workflow import nexus_workflow

# Polling task flag
is_polling = False

async def poll_supabase():
    global is_polling
    print(f"[*] Motor encendido. Esperando incidentes de Sentinel...")
    iteration = 0
    while is_polling:
        try:
            # Heartbeat cada 10 segundos (2 iteraciones de 5s)
            if iteration % 2 == 0:
                print(f"[*] Buscando tareas pendientes en Supabase (status: 'pending')...")
            
            tasks = get_pending_tasks()
            if tasks:
                for task in tasks:
                    task_id = task["id"]
                    project_name = task["project_name"]
                    error_desc = task["error_description"]
                    
                    print(f"\n[DEBUG] New task detected: {task_id} for project {project_name}")
                    
                    # Update status to analyzing
                    update_task_status(task_id, "analyzing")
                    append_resolution_step(task_id, "Nexus Engine: Comenzó el análisis de la tarea.")
                    
                    # Initialize Graph State
                    initial_state = {
                        "task_id": task_id,
                        "project_name": project_name,
                        "error_description": error_desc,
                        "resolution_steps": [],
                        "proposed_solution": None,
                        "security_feedback": None,
                        "security_approved": False,
                        "final_output": None
                    }
                    
                    # Run the LangGraph workflow
                    print(f"[*] Starting LangGraph workflow for {task_id}")
                    final_state = nexus_workflow.invoke(initial_state)
                    
                    # Update resolution steps
                    for step in final_state["resolution_steps"]:
                        append_resolution_step(task_id, step)
                        
                    update_task_resolved(
                        task_id, 
                        final_state["final_output"],
                        action_executed=final_state.get("action_executed", "none"),
                        was_successful=final_state.get("was_successful", True)
                    )
                    print(f"[{task_id}] [Action Engine] Resultado inyectado: {final_state.get('action_executed')} (Success: {final_state.get('was_successful')})\n")

                    # [NEXUS VIGILANTE] - Notificación Proactiva (Gatillo Autónomo)
                    from services.whatsapp_service import send_report_to_vercel
                    send_report_to_vercel(
                        project_name=project_name,
                        error_description=error_desc,
                        solution=final_state["final_output"].get("solution", "Ver panel para detalles."),
                        was_successful=final_state.get("was_successful", True),
                        retry_count=final_state["final_output"].get("retry_count", 0),
                        recovery_time=final_state["final_output"].get("recovery_time", 0.0)
                    )
            
        except Exception as e:
            print(f"❌ Error during polling loop: {e}")
            
        iteration += 1
        await asyncio.sleep(5)  # Poll every 5 seconds as requested by Axel

@asynccontextmanager
async def lifespan(app: FastAPI):
    global is_polling
    is_polling = True
    
    # [NEXUS STARTUP DIAGNOSTIC] - Axel Perez Insight
    print("\n" + "="*50)
    print("🚀 NEXUS ENGINE STARTUP DIAGNOSTIC")
    sentinel_url = os.getenv("SENTINEL_API_URL") or os.getenv("NEXT_PUBLIC_SITE_URL") or "UNDEFINED"
    print(f"📡 SENTINEL_API_URL IS: {sentinel_url}")
    print("="*50 + "\n")

    # Immediate WhatsApp Ping Test
    try:
        import requests
        admin_key = os.getenv("ADMIN_KEY") or "AxelDp04"
        ping_payload = {
            "isNexusReport": True,
            "incidentData": {
                "project_name": "NEXUS_STARTUP_SYNC",
                "error_description": "Prueba automática de arranque del Vigilante.",
                "solution": "Si recibes esto, el puente Vercel <-> Twilio está OPERATIVO."
            }
        }
        test_headers = { "X-Admin-Key": admin_key }
        test_url = f"{sentinel_url.rstrip('/')}/api/admin/whatsapp/report"
        
        print(f"[*] Vigilante: Enviando PING de arranque a {test_url}...")
        test_res = requests.post(test_url, json=ping_payload, headers=test_headers, timeout=15)
        
        if test_res.status_code == 200:
            print(f"✅ VIGILANTE STARTUP PING: SUCCESS (200 OK)")
        else:
            print(f"❌ VIGILANTE STARTUP PING: FAILED ({test_res.status_code})")
            print(f"📂 ERROR DETAIL: {test_res.text}")
            
    except Exception as startup_err:
        print(f"💥 VIGILANTE STARTUP EXCEPTION: {startup_err}")

    asyncio.create_task(poll_supabase())
    yield
    is_polling = False

app = FastAPI(title="Nexus Engine", lifespan=lifespan)

@app.get("/")
def read_root():
    return {"status": "Nexus Engine is running! Listening to Supabase..."}

@app.post("/api/nexus/test-action")
async def test_action_trigger(background_tasks: BackgroundTasks):
    """
    Sandbox endpoint to simulate a critical error and test the Action Engine (RETRY_STRATEGY).
    """
    from database import supabase
    if not supabase: return {"error": "Supabase not connected"}
    
    test_task = {
        "project_name": "SANDBOX_TEST",
        "error_description": "CRITICAL: Connection Timeout in Nexus_Gateway. (Triggering RETRY_STRATEGY)",
        "status": "pending"
    }
    
    try:
        res = supabase.table("nexus_tasks").insert(test_task).execute()
        return {
            "status": "Sandbox trigger successful",
            "message": "Nexus Arms v1.0 will now attempt a mitigation.",
            "data": res.data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/health")
def health_check():
    return {"status": "healthy", "polling": is_polling}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
