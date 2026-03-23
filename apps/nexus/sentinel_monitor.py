import os
import time
import requests
import json
from dotenv import load_dotenv

load_dotenv()

# --- CONFIG ---
ADMIN_KEY = "AxelDp04"
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://badqkfvbymxyqtwpnejd.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo"

def run_sentinel_monitor():
    print("🕵️‍♂️ [MONITOR] Nexus Sentinel: Vigilancia Externa Iniciada (Tier 4)...")
    
    import psycopg2
    NEON_URL = "postgresql://neondb_owner:npg_ri3jqv5BzQCT@ep-sweet-forest-anvtkthr-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

    while True:
        try:
            print("🔍 Probing Neon Structural Integrity Directly...")
            
            # 1. Intento de conexión y consulta a la tabla crítica
            integrity_failure = False
            try:
                conn = psycopg2.connect(NEON_URL)
                cur = conn.cursor()
                cur.execute("SELECT 1 FROM vehicles LIMIT 1;")
                cur.close()
                conn.close()
                print("🟢 Structural Integrity: Healthy.")
            except psycopg2.Error as e:
                if "does not exist" in str(e):
                    print(f"🚨 ALERT: Table 'vehicles' MISSING! {e}")
                    integrity_failure = True
                else:
                    print(f"⚠️ Neon Connection Issue: {e}")

            if integrity_failure:
                # 2. Verificar si ya hay una tarea pendiente para evitar spam
                headers_supa = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
                check_url = f"{SUPABASE_URL}/rest/v1/nexus_tasks?select=id&status=eq.pending&project_name=eq.AUDITACAR"
                active_tasks = requests.get(check_url, headers=headers_supa).json()
                
                if not active_tasks:
                    print("🚨 CRITICAL: Real Integrity Failure Detected. Triggering Nexus...")
                    
                    payload = {
                        "project_name": "AUDITACAR",
                        "error_description": "CRITICAL: Table 'vehicles' missing or renamed in Neon_DB. [AUTO_DETECTED_VIA_DIRECT_PROBE]",
                        "status": "pending",
                        "resolution_steps": ["Sentinel: Detectando alteración estructural proactivamente vía Direct Probe."]
                    }
                    
                    requests.post(f"{SUPABASE_URL}/rest/v1/nexus_tasks", headers=headers_supa, json=payload)
                    print("✅ Nexus ha tomado el control del evento externo.")
                else:
                    print("⏳ Nexus ya está trabajando en este incidente.")
                
            time.sleep(5)
                
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ Monitor Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    run_sentinel_monitor()
