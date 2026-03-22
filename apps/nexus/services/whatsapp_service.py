import os
import requests

def send_report_to_vercel(project_name: str, error_description: str, solution: str, was_successful: bool = True, retry_count: int = 0, recovery_time: float = 0.0):
    """
    Función para notificar el cierre de una tarea al Dashboard de Vercel.
    """
    # [TRIGGER] Log solicitado por el Ing. Axel Perez
    print(f"\n[TRIGGER] Enviando reporte a Vercel para el proyecto: {project_name}")

    # Fallback de URLs y Keys
    sentinel_url = os.getenv("SENTINEL_API_URL") or os.getenv("NEXT_PUBLIC_SITE_URL") or "https://sentinel-dashboard.vercel.app"
    admin_key = os.getenv("ADMIN_KEY") or "AxelDp04"

    payload = {
        "isNexusReport": True,
        "incidentData": {
            "project_name": project_name,
            "error_description": error_description,
            "solution": solution,
            "was_successful": was_successful,
            "retry_count": retry_count,
            "recovery_time": recovery_time
        }
    }

    headers = { "X-Admin-Key": admin_key }
    target_endpoint = f"{sentinel_url.rstrip('/')}/api/admin/whatsapp/report"

    try:
        response = requests.post(target_endpoint, json=payload, headers=headers, timeout=15)
        if response.status_code == 200:
            print(f"✅ [WHATSAPP_SERVICE] Reporte enviado satisfactoriamente: {response.status_code}")
            return True
        else:
            print(f"❌ [WHATSAPP_SERVICE] Error en Vercel: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"💥 [WHATSAPP_SERVICE] Error de red llamando a Vercel: {e}")
        return False
