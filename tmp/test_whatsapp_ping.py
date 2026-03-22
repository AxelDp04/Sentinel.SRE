import requests
import os
from dotenv import load_dotenv

load_dotenv()

def test_whatsapp_ping():
    print("🚀 Iniciando Prueba de Ping para el Vigilante (WhatsApp)...")
    
    # Simular datos de un reporte de Nexus
    sentinel_url = os.getenv("SENTINEL_API_URL") or "https://sentinel-dashboard.vercel.app"
    admin_key = os.getenv("ADMIN_KEY") or "AxelDp04"
    
    payload = {
        "isNexusReport": True,
        "incidentData": {
            "project_name": "PING_TEST_SENTINEL",
            "error_description": "Prueba de conectividad inicial del Vigilante.",
            "solution": "Conectividad verificada. El sistema de notificaciones está ACTIVO."
        }
    }
    
    headers = { "X-Admin-Key": admin_key }
    
    try:
        url = f"{sentinel_url}/api/admin/whatsapp/report"
        print(f"[*] Llamando a: {url}")
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            print(f"✅ PING EXITOSO: {response.json().get('message')}")
            print(f"📝 Preview del mensaje:\n{response.json().get('report_preview')}")
        else:
            print(f"❌ PING FALLIDO: {response.status_code}")
            print(f"📂 Detalle: {response.text}")
            
    except Exception as e:
        print(f"💥 EXCEPCIÓN: {e}")

if __name__ == "__main__":
    test_whatsapp_ping()
