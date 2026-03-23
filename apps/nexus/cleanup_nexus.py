import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def cleanup_nexus():
    print("\n🧼 [CLEANUP] Iniciando Purga Total de Nexus Sentinel...")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: Missing Supabase credentials in environment.")
        return

    # Delete all rows from nexus_tasks
    url = f"{SUPABASE_URL}/rest/v1/nexus_tasks?id=neq.0" # Match all non-zero IDs (or just id=not.is.null)
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "count=exact"
    }

    res = requests.delete(url, headers=headers)
    if res.status_code in [200, 204]:
        print("✅ NEXUS PURGE SUCCESSFUL: Historial de incidentes eliminado.")
        print("🛰️  Dashboard en CERO inminente.")
    else:
        print(f"❌ Error al purgar incidentes: {res.status_code} | {res.text}")

if __name__ == "__main__":
    cleanup_nexus()
