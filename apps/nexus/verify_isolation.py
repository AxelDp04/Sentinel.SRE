import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def verify_isolation():
    print(f"\n🔍 [AUDIT] Verificando Protocolo de Aislamiento en Nexus...")
    print(f"Target: {SUPABASE_URL}")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: Missing Supabase credentials in environment.")
        return

    url = f"{SUPABASE_URL}/rest/v1/nexus_tasks?select=*&order=created_at.desc&limit=1"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        task = res.json()[0]
        print(f"📍 Tarea Actual: {task['id']} | Proyecto: {task['project_name']} | Status: {task['status']}")
        
        if task['project_name'] == "AUDITACAR":
            print("✅ AISLAMIENTO CONFIRMADO: El sacrificio es exclusivo para AuditaCar.")
            if "Neon" in str(task.get('resolution_steps', [])):
                print("⚡ ARTILLERÍA CONFIRMADA: Nexus apunta a Neon.")
            else:
                print("⚠️  AVISO: Esperando a que Nexus procese la artillería en resolution_steps...")
        else:
            print("❌ ERROR: El sacrificio afectó a un proyecto no autorizado.")
    else:
        print(f"❌ Error al consultar Supabase: {res.status_code}")

if __name__ == "__main__":
    verify_isolation()
