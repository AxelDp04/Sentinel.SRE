import requests

def probe_bridge():
    url = "https://sentinel-sre.vercel.app/api/admin/whatsapp/report"
    headers = {"X-Admin-Key": "AxelDp04", "Content-Type": "application/json"}
    payload = {
        "isNexusReport": True,
        "incidentData": {
            "project_name": "WHATSAPP_DIAGNOSTIC",
            "error_description": "DIAGNOSTIC: Direct Bridge Probe",
            "solution": "Testing sentinel-sre.vercel.app bridge reliability.",
            "was_successful": True,
            "action_executed": "BRIDGE_PROBE",
            "retry_count": 0,
            "recovery_time": 0.5
        }
    }

    print(f"📡 Disparando sonda a: {url}")
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=20)
        print(f"📊 Status Code: {res.status_code}")
        print(f"📄 Response: {res.text}")
    except Exception as e:
        print(f"❌ Error en la sonda: {e}")

if __name__ == "__main__":
    probe_bridge()
