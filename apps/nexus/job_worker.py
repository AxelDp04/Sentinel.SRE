import time
import os
import json
from database import supabase, update_task_status

def poll_nexus_jobs():
    """
    Polls the 'nexus_jobs' table for pending tasks and executes them.
    """
    if not supabase:
        print("❌ Worker: Supabase not connected.")
        return

    while True:
        try:
            # 1. Fetch pending jobs
            res = supabase.table("nexus_jobs") \
                .select("*") \
                .eq("status", "pending") \
                .limit(5) \
                .execute()
            
            jobs = res.data or []
            
            if jobs:
                print(f"[*] Worker: {len(jobs)} jobs detected. Processing...")
                
                for job in jobs:
                    process_job(job)
            
            time.sleep(5) # Poll every 5 seconds
        except Exception as e:
            print(f"❌ Worker Error: {e}")
            time.sleep(10)

def process_job(job):
    job_id = job["id"]
    job_type = job["job_type"]
    attempts = job.get("attempts", 0)
    max_attempts = job.get("max_attempts", 3)
    
    print(f"[*] Processing Job [{job_id}] | Type: {job_type} | Attempt: {attempts+1}/{max_attempts}")
    
    # Update status to running
    supabase.table("nexus_jobs").update({"status": "running", "attempts": attempts + 1}).eq("id", job_id).execute()
    
    time.sleep(2) # Simulate work
    
    # --- SIMULATED LOGIC ---
    success = True
    error_msg = None
    
    # Force failure for demo if specific payload is present
    payload = job.get("payload", {})
    if payload.get("force_fail") == True and (attempts + 1) < max_attempts:
        success = False
        error_msg = "Simulated Fail: External API Timeout."
    
    if success:
        print(f"✅ Job [{job_id}] COMPLETED.")
        supabase.table("nexus_jobs").update({
            "status": "completed", 
            "last_error": None
        }).eq("id", job_id).execute()
    else:
        print(f"⚠️ Job [{job_id}] FAILED. (Attempt {attempts + 1})")
        new_status = "pending" if (attempts + 1) < max_attempts else "failed"
        
        supabase.table("nexus_jobs").update({
            "status": new_status, 
            "last_error": error_msg
        }).eq("id", job_id).execute()
        
        # If exhausted, trigger Nexus Incident
        if new_status == "failed":
            trigger_nexus_incident(job, error_msg)

def trigger_nexus_incident(job, error):
    """
    Escalates a failed job to the Nexus SRE Engine.
    """
    print(f"🚨 EXHAUSTED: Triggering Nexus SRE Incident for Job {job['id']}")
    incident_data = {
        "project_name": "NEXUS_JOBS",
        "error_description": f"CRITICAL_JOB_FAILURE: Job '{job['job_type']}' ({job['id']}) exhausted {job['max_attempts']} retries. Last error: {error}",
        "status": "pending"
    }
    supabase.table("nexus_tasks").insert(incident_data).execute()

if __name__ == "__main__":
    print("🚀 Nexus Distributed Job Worker Started...")
    poll_nexus_jobs()
