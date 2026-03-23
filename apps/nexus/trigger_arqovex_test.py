import os
import requests
from dotenv import load_dotenv

load_dotenv()

# --- CONFIG ---
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://badqkfvbymxyqtwpnejd.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo"

def trigger_arqovex_incident():
    print("🚀 [SIMULATION] Disparando Incidente de Prueba para ARQOVEX...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "project_name": "ARQOVEX",
        "error_description": "CRITICAL: Supabase Connection Saturation detected in Arqovex_Engine [SIMULATED_CHAOS]",
        "status": "pending",
        "resolution_steps": ["Sentinel: Detectando anomalía en el flujo de Arqovex."]
    }

    url = f"{SUPABASE_URL}/rest/v1/nexus_tasks"
    res = requests.post(url, headers=headers, json=payload)
    
    if res.status_code in [200, 201, 204]:
        print("✅ Incidente inyectado. Nexus tomará el mando en segundos.")
    else:
        print(f"❌ Error al inyectar incidente: {res.text}")

if __name__ == "__main__":
    trigger_arqovex_incident()
