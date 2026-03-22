import asyncio
import os
from fastapi import FastAPI, BackgroundTasks
from contextlib import asynccontextmanager
from database import get_pending_tasks, update_task_status, append_resolution_step, update_task_resolved
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
                        
                    update_task_resolved(task_id, final_state["final_output"])
                    print(f"[{task_id}] [Updating Supabase] Resultado inyectado y resuelto.\n")

                    # [NEXUS VIGILANTE] - Notificación Proactiva a Axel Perez
                    try:
                        import requests
                        sentinel_url = os.getenv("SENTINEL_API_URL") or os.getenv("NEXT_PUBLIC_SITE_URL") or "https://sentinel-dashboard.vercel.app"
                        admin_key = os.getenv("ADMIN_KEY") or "AxelDp04"
                        
                        payload = {
                            "isNexusReport": True,
                            "incidentData": {
                                "project_name": project_name,
                                "error_description": error_desc,
                                "solution": final_state["final_output"].get("solution", "Ver panel para detalles.")
                            }
                        }
                        
                        headers = { "X-Admin-Key": admin_key }
                        response = requests.post(f"{sentinel_url}/api/admin/whatsapp/report", json=payload, headers=headers, timeout=10)
                        
                        if response.status_code == 200:
                            print(f"[{task_id}] [Vigilante Active] WhatsApp report sent to Axel Perez via Vercel Proxy.")
                        else:
                            print(f"[{task_id}] [Vigilante Error] Failed to send report: {response.status_code} - {response.text}")
                            
                    except Exception as we:
                        print(f"[{task_id}] [Vigilante Exception] Error calling WhatsApp API: {we}")
            
        except Exception as e:
            print(f"❌ Error during polling loop: {e}")
            
        iteration += 1
        await asyncio.sleep(5)  # Poll every 5 seconds as requested by Axel

@asynccontextmanager
async def lifespan(app: FastAPI):
    global is_polling
    is_polling = True
    asyncio.create_task(poll_supabase())
    yield
    is_polling = False

app = FastAPI(title="Nexus Engine", lifespan=lifespan)

@app.get("/")
def read_root():
    return {"status": "Nexus Engine is running! Listening to Supabase..."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "polling": is_polling}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
