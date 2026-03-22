import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# PRUEBA DIRECTA DE TWILIO (AXEL PEREZ)
def test_direct_twilio():
    # Asegúrate de que estas variables estén en Railway
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    from_whatsapp = os.getenv('TWILIO_WHATSAPP_NUMBER') # Ej: 'whatsapp:+14155238886'
    to_whatsapp = os.getenv('TWILIO_OWNER_NUMBER') or 'whatsapp:+18098285104'

    print(f"🚀 Probando Twilio directamente...")
    print(f"[*] Account SID: {account_sid[:5]}***")
    print(f"[*] Destino: {to_whatsapp}")

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            from_=from_whatsapp,
            body="🛡️ NEXUS DEBUG: Esta es una prueba directa desde Railway. Si lees esto, las llaves SID/TOKEN son VÁLIDAS.",
            to=to_whatsapp
        )
        print(f"✅ MENSAJE ENVIADO. SID: {message.sid}")
    except Exception as e:
        print(f"❌ FALLO CRÍTICO: {e}")

if __name__ == "__main__":
    test_direct_twilio()
