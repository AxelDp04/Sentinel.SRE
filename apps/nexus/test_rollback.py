import sys
import os
import time
import uuid

# Reinforcement: Asegurar que apps/nexus esté en el path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from database import supabase
from workflow import nexus_workflow

def test_golden_rollback():
    print("🚀 [TEST] Iniciando Prueba de Protocolo Golden Rollback...")
    
    # 1. Inyectamos un incidente que contiene 'CHAOS' para forzar un fallo de validación
    task_id = str(uuid.uuid4())
    project = "ARQOVEX"
    # La palabra CHAOS activará el fallo simulado en el validator_node
    error_desc = "CRITICAL: Database connection pool saturation! [SIMULATED_CHAOS_ATTACK]"
    
    print(f"[*] Inyectando incidente de Caos: {task_id}")
    supabase.table("nexus_tasks").insert({
        "id": task_id,
        "project_name": project,
        "error_description": error_desc,
        "status": "pending"
    }).execute()
    
    # 2. Ejecutamos el Workflow
    print("[*] Ejecutando Nexus Workflow con protección Rollback...")
    inputs = {
        "task_id": task_id,
        "project_name": project,
        "error_description": error_desc,
        "resolution_steps": [],
        "language": "es"
    }
    
    final_state = nexus_workflow.invoke(inputs)
    
    print("\n--- RESULTADO DEL CICLO DE SEGURIDAD ---")
    print(f"Propuesta IA: {final_state['proposed_solution']}")
    print(f"¿Validación Exitosa?: {final_state.get('action_success')}")
    print(f"Acción Final: {final_state['action_executed']}")
    
    # 3. Verificamos si existe el Snapshot en la DB
    print("\n[*] Verificando base de datos de Backups...")
    backups = supabase.table("nexus_backups").select("*").eq("task_id", task_id).execute()
    
    if backups.data:
        print(f"✅ Snapshot Encontrado: {backups.data[0]['id']} (Status: {backups.data[0]['status']})")
        if backups.data[0]['status'] == "restored":
            print("💎 ¡ÉXITO! El Protocolo Golden Rollback ha revertido el desastre automáticamente.")
        else:
            print("❌ El snapshot no se marcó como 'restored'. Revisa la lógica.")
    else:
        print("❌ Error: No se creó ningún snapshot. (Asegúrate de haber corrido el SQL migration)")

if __name__ == "__main__":
    test_golden_rollback()
