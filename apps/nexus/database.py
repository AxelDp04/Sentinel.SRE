import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not found in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_pending_tasks():
    response = supabase.table("nexus_tasks").select("*").eq("status", "pending").execute()
    return response.data

def update_task_status(task_id: str, status: str):
    response = supabase.table("nexus_tasks").update({"status": status}).eq("id", task_id).execute()
    return response.data

def append_resolution_step(task_id: str, step: str):
    # Fetch current steps
    task_res = supabase.table("nexus_tasks").select("resolution_steps").eq("id", task_id).execute()
    current_steps = task_res.data[0].get("resolution_steps") or []
    current_steps.append(step)
    
    # Update with new step
    supabase.table("nexus_tasks").update({"resolution_steps": current_steps}).eq("id", task_id).execute()

def update_task_resolved(task_id: str, ai_output: dict):
    response = supabase.table("nexus_tasks").update({
        "status": "resolved",
        "ai_output": ai_output
    }).eq("id", task_id).execute()
    return response.data
