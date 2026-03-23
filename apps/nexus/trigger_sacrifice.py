import os
import json
import urllib.request
import time

# --- CONFIGURACIÓN ---
# Usamos el ADMIN_KEY que Axel tiene configurado
ADMIN_KEY = "AxelDp04"
SUPABASE_URL = "https://badqkfvbymxyqtwpnejd.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo"

def trigger_sacrifice():
    print("\n🎬 [DEMO] Disparando Trigger de Sacrificio directo a Supabase...")
    
    # Payload para el Segundo Sacrificio (Nivel Corporativo - Integridad)
    error_data = {
        "project_name": "AUDITACAR",
        "error_description": "ERROR: column 'vehicle_uuid' does not exist in table 'vehicle_logs'. Structural Integrity Failure during Red-Green Deployment.",
        "status": "pending",
        "resolution_steps": ["Sentinel: Fallo de integridad en AuditaCar detected. Initiating Critical Schema Audit."]
    }

    url = f"{SUPABASE_URL}/rest/v1/nexus_tasks"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    try:
        data = json.dumps(error_data).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            print(f"✅ SACRIFICIO INYECTADO: ID {res_data[0]['id']}")
            print("Observa el Dashboard de Sentinel en Tiempo Real...")
            return True
            
    except Exception as e:
        print(f"❌ Error inyectando sacrificio: {e}")
        return False

if __name__ == "__main__":
    trigger_sacrifice()
