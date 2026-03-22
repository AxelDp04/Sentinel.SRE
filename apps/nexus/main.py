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
    while is_polling:
        try:
            tasks = get_pending_tasks()
            for task in tasks:
                task_id = task["id"]
                project_name = task["project_name"]
                error_desc = task["error_description"]
                
                print(f"[*] New Task detected: {task_id} for project {project_name}")
                
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
                
                # Wait for completion and update Supabase with results
                for step in final_state["resolution_steps"]:
                    append_resolution_step(task_id, step)
                    
                update_task_resolved(task_id, final_state["final_output"])
                print(f"\n[{task_id}] [Updating Supabase] Resultado inyectado en la DB y listo para Sentinel.")
                
        except Exception as e:
            print(f"Error during polling: {e}")
            
        await asyncio.sleep(5)  # Poll every 5 seconds

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
