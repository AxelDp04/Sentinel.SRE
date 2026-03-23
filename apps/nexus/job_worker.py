# --- EXPLICACIÓN EDUCATIVA: EL WORKER DE TRABAJOS (EL OBRERO) ---
# Este script es un "Worker" que corre en segundo plano. Su única misión es
# mirar la tabla 'nexus_jobs' y ejecutar lo que encuentre ahí.
# Esto separa la "inteligencia" del Sheriff de la "ejecución" pesada.

import time
import os
import json
import resend # Motor de correos real
from database import supabase
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

def poll_nexus_jobs():
    """
    Función de sondeo (Polling). Revisa la base de datos cada 5 segundos.
    """
    if not supabase:
        print("❌ Worker: Supabase no conectado.")
        return

    while True:
        try:
            # 1. Buscamos trabajos con estado 'pending'
            res = supabase.table("nexus_jobs") \
                .select("*") \
                .eq("status", "pending") \
                .limit(5) \
                .execute()
            
            jobs = res.data or []
            
            if jobs:
                print(f"[*] Worker: {len(jobs)} trabajos detectados. Procesando...")
                for job in jobs:
                    process_job(job)
            
            time.sleep(5) # Esperamos para no saturar la DB
        except Exception as e:
            print(f"❌ Error en el Worker: {e}")
            time.sleep(10)

def send_real_email(target_email, job_id, job_type):
    """
    Usa la API de Resend para enviar un correo de verdad.
    """
    # --- PROTOCOLO DE SEGURIDAD (FREE TIER) ---
    # Resend en modo prueba solo permite enviar a la cuenta del dueño (arqovex@gmail.com).
    # Redirigimos cualquier otro correo allí para evitar errores 403/429.
    VERIFIED_EMAIL = "arqovex@gmail.com"
    if target_email != VERIFIED_EMAIL:
        print(f"⚠️ [RESEND_GUARD] Redirigiendo de {target_email} a {VERIFIED_EMAIL} (Restricción de Free Tier)")
        target_email = VERIFIED_EMAIL

    try:
        print(f"[*] Resend: Despachando correo real a {target_email}...")
        params = {
            "from": "Nexus SRE <onboarding@resend.dev>",
            "to": [target_email],
            "subject": f"🛰️ Nexus Sentinel: Alerta de Infraestructura",
            "html": f"""
                <div style="font-family: sans-serif; background: #0a0a0c; color: #fff; padding: 40px; border-radius: 10px; border: 1px solid #1e293b;">
                    <h1 style="color: #10b981; margin-bottom: 20px; font-size: 24px;">🛰️ NEXUS SENTINEL</h1>
                    <p style="font-size: 16px; color: #94a3b8;">El Almirante SRE ha generado una notificación automática.</p>
                    <div style="background: #111827; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>PROYECTO:</strong> NEXUS_ECOSYSTEM</p>
                        <p style="margin: 5px 0;"><strong>PROTOCOLO:</strong> {job_type}</p>
                        <p style="margin: 5px 0;"><strong>ESTADO:</strong> OPERATIVO / ALERTA</p>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">"Resiliencia absoluta a través de la automatización."</p>
                </div>
            """,
        }
        resend.Emails.send(params)
        return True, None
    except Exception as e:
        return False, str(e)

def process_job(job):
    """
    Lógica individual para procesar cada tarea (Job).
    """
    job_id = job["id"]
    job_type = job["job_type"]
    attempts = job.get("attempts", 0)
    max_attempts = job.get("max_attempts", 3)
    payload = job.get("payload", {})
    target_email = payload.get("target_email")
    
    # Actualizamos el estado a 'running' para que nadie más lo tome
    supabase.table("nexus_jobs").update({"status": "running", "attempts": attempts + 1}).eq("id", job_id).execute()
    
    # --- LÓGICA DE TRABAJO ---
    success = True
    error_msg = None
    
    # Si el trabajo es de tipo CORREO, lo mandamos
    if job_type == 'EMAIL_DISPATCH' and target_email:
        success, error_msg = send_real_email(target_email, job_id, job_type)

    if success:
        print(f"✅ Job [{job_id}] COMPLETADO.")
        supabase.table("nexus_jobs").update({"status": "completed"}).eq("id", job_id).execute()
    else:
        # Si falla, re-intentamos hasta el máximo permitido
        print(f"⚠️ Job [{job_id}] FALLÓ. Re-intento {(attempts + 1)}")
        new_status = "pending" if (attempts + 1) < max_attempts else "failed"
        supabase.table("nexus_jobs").update({"status": new_status, "last_error": error_msg}).eq("id", job_id).execute()

if __name__ == "__main__":
    print("🚀 Nexus Job Worker activado y vigilando la cola...")
    poll_nexus_jobs()
