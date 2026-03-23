import time
import uuid
from database import supabase
from workflow import nexus_workflow

def test_full_foresight_flow():
    print("🚀 Iniciando Test de Neural Foresight & Multi-Alertas...")
    
    # 1. Simulamos que el Centinela detectó un error predictivo
    task_id = str(uuid.uuid4())
    project = "AUDITACAR"
    anomaly_desc = "PREDICTIVE_ANOMALY: Latency spike detected (145ms). High risk of Gateway Timeout."
    
    print(f"[*] Simulando anomalía en Supabase: {task_id}")
    supabase.table("nexus_tasks").insert({
        "id": task_id,
        "project_name": project,
        "error_description": anomaly_desc,
        "status": "pending"
    }).execute()
    
    # 2. Corremos el Workflow de Nexus para procesar esta anomalía
    print("[*] Ejecutando Nexus Workflow...")
    inputs = {
        "task_id": task_id,
        "project_name": project,
        "error_description": anomaly_desc,
        "resolution_steps": [],
        "language": "es"
    }
    
    final_state = nexus_workflow.invoke(inputs)
    
    print("\n--- RESULTADO DEL WORKFLOW ---")
    print(f"Propuesta SRE: {final_state['proposed_solution']}")
    print(f"Acción Ejecutada: {final_state['action_executed']}")
    print(f"Pasos de Resolución: {final_state['resolution_steps']}")
    
    # 3. Verificamos si se encoló el Job de Email
    print("\n[*] Verificando cola de JOBS para alertas de correo...")
    jobs = supabase.table("nexus_jobs").select("*").eq("status", "pending").execute()
    
    found_email = False
    for job in jobs.data:
        if job["job_type"] == "EMAIL_DISPATCH":
            print(f"✅ ¡ÉXITO! Job de email detectado para: {job['payload'].get('target_email')}")
            found_email = True
            break
            
    if not found_email:
        print("❌ Error: No se encontró el job de email en la cola.")

if __name__ == "__main__":
    test_full_foresight_flow()
