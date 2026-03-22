from supabase import create_client, Client
import os

# Credentials found in Sentinel lib/admin.ts
SUPABASE_URL = "https://badqkfvbymxyqtwpnejd.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

test_task = {
    "project_name": "SANDBOX_OPERATIONAL_TEST",
    "error_description": "CRITICAL: Connection Timeout in Nexus_Gateway. (Triggering RETRY_STRATEGY test-success)",
    "status": "pending",
    "resolution_steps": ["Sentinel: Simulacro de error crítico inyectado para validar Nexus Arms v1.0."]
}

print(f"[*] Inyectando tarea en Supabase: {test_task['project_name']}...")

try:
    response = supabase.table("nexus_tasks").insert(test_task).execute()
    print("✅ [SUCCESS] Tarea inyectada satisfactoriamente.")
    print(f"ID de Tarea: {response.data[0]['id']}")
    print("\nEl motor de Nexus en Railway debería procesar esto en los próximos segundos.")
    print("Espera el WhatsApp con el reporte dinámico.")
except Exception as e:
    print(f"❌ [ERROR] Fallo al inyectar tarea: {e}")
