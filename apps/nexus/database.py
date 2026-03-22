import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Prioritize SERVICE_ROLE_KEY for full write permissions (avoid RLS blocks)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = None

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"⚠️ WARNING: Supabase credentials NOT found in environment.")
    print(f"DEBUG -> URL: {'OK' if SUPABASE_URL else 'MISSING'}, KEY: {'OK' if SUPABASE_KEY else 'MISSING'}")
else:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Nexus Engine connected to Supabase successfully.")
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")

def get_pending_tasks():
    if not supabase: return []
    try:
        response = supabase.table("nexus_tasks").select("*").eq("status", "pending").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return []

def update_task_status(task_id: str, status: str):
    if not supabase: return None
    try:
        response = supabase.table("nexus_tasks").update({"status": status}).eq("id", task_id).execute()
        return response.data
    except Exception as e:
        print(f"Error updating status: {e}")

def append_resolution_step(task_id: str, step: str):
    if not supabase: return
    try:
        # Fetch current steps
        task_res = supabase.table("nexus_tasks").select("resolution_steps").eq("id", task_id).execute()
        if not task_res.data: return
        current_steps = task_res.data[0].get("resolution_steps") or []
        current_steps.append(step)
        
        # Update with new step
        supabase.table("nexus_tasks").update({"resolution_steps": current_steps}).eq("id", task_id).execute()
    except Exception as e:
        print(f"Error appending step: {e}")

def update_task_resolved(task_id: str, ai_output: dict):
    if not supabase: return None
    try:
        response = supabase.table("nexus_tasks").update({
            "status": "resolved",
            "ai_output": ai_output
        }).eq("id", task_id).execute()
        return response.data
    except Exception as e:
        print(f"Error resolving task: {e}")
