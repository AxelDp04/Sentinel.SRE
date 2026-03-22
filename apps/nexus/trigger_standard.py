import urllib.request
import json
import sys

url = "https://badqkfvbymxyqtwpnejd.supabase.co/rest/v1/nexus_tasks"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

data = {
    "project_name": "SANDBOX_OPERATIONAL_TEST",
    "error_description": "CRITICAL: Connection Timeout in Nexus_Gateway. (Triggering RETRY_STRATEGY test-success)",
    "status": "pending",
    "resolution_steps": ["Sentinel: Simulacro de error crítico inyectado para validar Nexus Arms v1.0."]
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')

print(f"[*] Dispatching Sandbox Trigger to {url}...")

try:
    with urllib.request.urlopen(req) as response:
        print("✅ [SUCCESS] Operational Task injected into Supabase.")
        print(f"Response Code: {response.getcode()}")
        print("Content:", response.read().decode())
        print("\nNexus Engine on Railway should now pick this up and execute RETRY_STRATEGY.")
except Exception as e:
    print(f"❌ [ERROR] Failed to inject task: {e}")
    sys.exit(1)
