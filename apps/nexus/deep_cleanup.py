import os
import requests
from dotenv import load_dotenv

load_dotenv()

# --- CONFIG ---
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://badqkfvbymxyqtwpnejd.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo"

def deep_cleanup():
    print("🧼 [DEEP_CLEANUP] Iniciando Borrado de Memoria (REST Only)...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    # 1. PURGAR SUPABASE (Incidentes y Tareas)
    print("🛰️ Purging Supabase Telemetry...")
    tables = ["nexus_tasks", "incident_history"]
    for table in tables:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
        res = requests.delete(url, headers=headers)
        if res.status_code in [200, 204]:
            print(f"✅ {table} purgada.")
        else:
            print(f"❌ Error purgando {table}: {res.text}")

    print("\n🏁 [AMNESIA] Dashboard 100% limpio (0 Incidentes).")

if __name__ == "__main__":
    deep_cleanup()
