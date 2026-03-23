import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def send_success_redeploy():
    print("\n🚀 [INFRASTRUCTURE_RESCUE] Mandando Redeploy Exitoso a Sentinel...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    payload = {
        "project_name": "INFRASTRUCTURE_RESCUE",
        "error_description": "REDEPLOY_SUCCESS: Vercel Shield Patch active. Ghost Caching eliminated.",
        "status": "pending",
        "resolution_steps": ["Sentinel: Validando integridad del redeploy en tiempo real."]
    }

    url = f"{SUPABASE_URL}/rest/v1/nexus_tasks"
    res = requests.post(url, headers=headers, json=payload)
    
    if res.status_code == 201:
        print(f"🏁 [SUCCESS] El Dashboard ha sido notificado de la victoria.")
        print(f"Incidente: {res.json()[0]['id']}")
    else:
        print(f"❌ Error: {res.text}")

if __name__ == "__main__":
    send_success_redeploy()
