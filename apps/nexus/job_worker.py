import time
import os
import json
import resend # Nuevo: Motor de correos real
from database import supabase, update_task_status
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

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

def send_real_email(target_email, job_id, job_type):
    """
    Sends a real-world email using Resend.
    """
    try:
        print(f"[*] Resend: Despachando correo real a {target_email}...")
        params = {
            "from": "Nexus SRE <onboarding@resend.dev>",
            "to": [target_email],
            "subject": f"🛰️ Nexus Sentinel: Reporte Técnico de Job [{job_type}]",
            "html": f"""
                <div style="font-family: sans-serif; background: #0a0a0c; color: #fff; padding: 40px; border-radius: 10px;">
                    <h1 style="color: #10b981; margin-bottom: 20px;">🛰️ NEXUS SENTINEL</h1>
                    <p style="font-size: 16px; color: #94a3b8;">El Almirante SRE ha solicitado el despacho de este reporte técnico.</p>
                    <div style="background: #1a1a1c; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                        <p><strong>JOB_ID:</strong> {job_id}</p>
                        <p><strong>PROTOCOLO:</strong> {job_type}</p>
                        <p><strong>ESTADO:</strong> COMPLETED</p>
                    </div>
                    <p style="margin-top: 30px; font-size: 12px; color: #475569;">Nexus Engine v5.0 - Resiliencia Autónoma Garantizada.</p>
                </div>
            """,
        }
        resend.Emails.send(params)
        return True, None
    except Exception as e:
        return False, str(e)

def process_job(job):
    job_id = job["id"]
    job_type = job["job_type"]
    attempts = job.get("attempts", 0)
    max_attempts = job.get("max_attempts", 3)
    payload = job.get("payload", {})
    target_email = payload.get("target_email")
    
    print(f"[*] Processing Job [{job_id}] | Type: {job_type} | Attempt: {attempts+1}/{max_attempts}")
    
    # Update status to running
    supabase.table("nexus_jobs").update({"status": "running", "attempts": attempts + 1}).eq("id", job_id).execute()
    
    time.sleep(2) # Simulate work latency
    
    # --- REAL/SIMULATED LOGIC ---
    success = True
    error_msg = None
    
    # Forzar error si el payload lo indica
    if payload.get("force_fail") == True and (attempts + 1) < max_attempts:
        success = False
        error_msg = "Simulated Fail: External API Timeout."
    
    # Si es un JOB de EMAIL y tenemos un correo, intentamos envío real
    if success and job_type == 'EMAIL_DISPATCH' and target_email:
        success, error_msg = send_real_email(target_email, job_id, job_type)

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
