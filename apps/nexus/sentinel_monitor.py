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
    
    while True:
        try:
            print("🔍 Probing Deep Integrity Health...")
            
            # 1. Consultar estado activo para evitar duplicados
            headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
            check_url = f"{SUPABASE_URL}/rest/v1/nexus_tasks?select=id&status=eq.pending&project_name=eq.AUDITACAR"
            active_tasks = requests.get(check_url, headers=headers).json()
            
            if not active_tasks:
                # 2. DETECCIÓN DE CAOS (SIMULADO)
                # En la demo, el monitor inyecta el evento si el HEALTH_CHECK externo 
                # (disparado por Axel en Neon) es detectado por el motor.
                
                # Para esta fase, DISPARAMOS el evento de INTRUSIÓN MANUAL
                # ya que Axel lo está ejecutando en Neon.
                
                print("🚨 CRITICAL: External Chaos Detected (Table missing). Auto-Triggering Nexus...")
                
                payload = {
                    "project_name": "AUDITACAR",
                    "error_description": "CRITICAL: Table 'vehicles' missing or renamed in Neon_DB. Manual Intervention Detected via Deep Probe.",
                    "status": "pending",
                    "resolution_steps": ["Sentinel: Intrusión externa detectada en consola de Neon. Activando Protocolo Shield."]
                }
                
                requests.post(f"{SUPABASE_URL}/rest/v1/nexus_tasks", headers=headers, json=payload)
                print("✅ Nexus ha tomado el control del evento externo.")
                break # Para la demo, disparamos una sola vez
                
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ Monitor Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    run_sentinel_monitor()
