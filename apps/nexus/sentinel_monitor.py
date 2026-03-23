import os
import time
import requests
import json
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# --- CONFIG SENTINEL (Main) ---
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://badqkfvbymxyqtwpnejd.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# --- CONFIG ARQOVEX (Secondary) ---
ARQOVEX_URL = os.getenv("ARQOVEX_SUPABASE_URL")
ARQOVEX_KEY = os.getenv("ARQOVEX_SUPABASE_SERVICE_ROLE_KEY")

# --- CONFIG NEON ---
NEON_URL = "postgresql://neondb_owner:npg_ri3jqv5BzQCT@ep-sweet-forest-anvtkthr-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

def check_neon_integrity():
    """Vigila la integridad de la base de datos Neon (AuditaCar)"""
    print("🔍 [AUDITACAR] Probing Neon Structural Integrity...")
    try:
        conn = psycopg2.connect(NEON_URL)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM vehicles LIMIT 1;")
        cur.close()
        conn.close()
        print("🟢 AuditaCar: Healthy.")
        return False
    except psycopg2.Error as e:
        if "does not exist" in str(e):
            print(f"🚨 ALERT: Table 'vehicles' MISSING in AuditaCar!")
            return True
        print(f"⚠️ Neon Connection Issue: {e}")
        return False

def check_arqovex_tasks():
    """Vigila la cola de tareas de Arqovex y sincroniza con Sentinel"""
    print("🏙️ [ARQOVEX] Polling Arqovex Task Stream...")
    headers = {"apikey": ARQOVEX_KEY, "Authorization": f"Bearer {ARQOVEX_KEY}"}
    url = f"{ARQOVEX_URL}/rest/v1/nexus_tasks?status=eq.pending"
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            tasks = res.json()
            for task in tasks:
                print(f"🚨 [DETECTADO] Incidente en Arqovex: {task['error_description']}")
                mirror_to_sentinel(task)
                # Marcar como 'processing' en Arqovex
                requests.patch(f"{ARQOVEX_URL}/rest/v1/nexus_tasks?id=eq.{task['id']}", 
                               headers=headers, json={"status": "processing"})
        else:
            print(f"⚠️ Arqovex API Error: {res.status_code}")
    except Exception as e:
        print(f"⚠️ Arqovex Polling Failed: {e}")

def mirror_to_sentinel(task):
    """Sincroniza un incidente de Arqovex con el motor central de Nexus"""
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    payload = {
        "project_name": "ARQOVEX",
        "error_description": f"[REMOTE_SYNC] {task['error_description']}",
        "status": "pending",
        "resolution_steps": task.get("resolution_steps", [])
    }
    requests.post(f"{SUPABASE_URL}/rest/v1/nexus_tasks", headers=headers, json=payload)
    print("📡 [SYNC] Incidente de Arqovex enviado a Nexus Engine.")

def trigger_auditacar_incident():
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    payload = {
        "project_name": "AUDITACAR",
        "error_description": "CRITICAL: Table 'vehicles' missing or renamed in Neon_DB. [AUTO_DETECTED_VIA_MONITOR]",
        "status": "pending",
        "resolution_steps": ["Sentinel Monitor: Detectando anomalía estructural proactivamente."]
    }
    requests.post(f"{SUPABASE_URL}/rest/v1/nexus_tasks", headers=headers, json=payload)

def run_monitor():
    print("🕵️‍♂️ [MONITOR] Nexus Sentinel Multi-Project v5.0 Active.")
    while True:
        try:
            # 1. AuditaCar
            if check_neon_integrity():
                trigger_auditacar_incident()
            
            # 2. Arqovex
            if ARQOVEX_URL and ARQOVEX_KEY:
                check_arqovex_tasks()
            
            time.sleep(10)
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"❌ Monitor Main Loop Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    run_monitor()
