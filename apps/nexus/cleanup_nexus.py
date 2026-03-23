from database import supabase

def cleanup_nexus():
    print("🧹 Iniciando limpieza de emergencia en Nexus...")
    
    # 1. Borrar Jobs fallidos por el tema de Resend
    try:
        res_jobs = supabase.table("nexus_jobs").delete().eq("status", "failed").execute()
        print(f"✅ Se han eliminado los Jobs fallidos.")
    except Exception as e:
        print(f"❌ Error limpiando jobs: {e}")

    # 2. Borrar Tareas de error que se generaron en bucle
    try:
        res_tasks = supabase.table("nexus_tasks").delete().eq("project_name", "NEXUS_JOBS").execute()
        print(f"✅ Se han eliminado las tareas de error cíclico.")
    except Exception as e:
        print(f"❌ Error limpiando tareas: {e}")

    print("\n✨ Nexus Dashboard restaurado. ¡Listo para operar con el nuevo parche!")

if __name__ == "__main__":
    cleanup_nexus()
