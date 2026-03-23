import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://badqkfvbymxyqtwpnejd.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo"

def check_status():
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    url = f"{SUPABASE_URL}/rest/v1/nexus_tasks?project_name=eq.ARQOVEX&select=*"
    res = requests.get(url, headers=headers).json()
    
    if res:
        task = res[0]
        print(f"📊 Proyecto: {task['project_name']}")
        print(f"📄 Error: {task['error_description']}")
        print(f"⚡ Estado: {task['status']}")
        print(f"🛠️ Acción: {task.get('action_executed', 'N/A')}")
    else:
        print("❌ No se encontró el incidente.")

if __name__ == "__main__":
    check_status()
