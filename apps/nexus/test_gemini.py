import requests

GEMINI_KEY = "AIzaSyCKogKA1uNBBSdq5G2md2DbJ6tjqDKpxHw"
URL = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_KEY}"

def list_models():
    print(f"📡 [DEBUG] Listando modelos para: {GEMINI_KEY[:10]}...")
    try:
        res = requests.get(URL)
        if res.status_code == 200:
            models = [m['name'] for m in res.json().get('models', [])]
            print(f"✅ MODELOS DISPONIBLES: {models}")
        else:
            print(f"❌ ERROR: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    list_models()
