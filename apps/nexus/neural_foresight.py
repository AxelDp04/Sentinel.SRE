import time
import os
import random
from database import supabase
from dotenv import load_dotenv

# Cargamos las variables de entorno (.env) donde están nuestras llaves
load_dotenv()

# --- EXPLICACIÓN EDUCATIVA: ¿QUÉ ES EL NEURAL FORESIGHT? ---
# Esta es la capa "proactiva" de Nexus. Mientras que el Workflow normal espera a que algo se rompa,
# este script actúa como un "centinela" que mira las tendencias.
# Si la latencia sube demasiado rápido, predice un fallo inminente y avisa al Sheriff.

def analyze_latency_trends():
    """
    Analiza las tendencias de latencia para predecir anomalías.
    """
    if not supabase:
        print("❌ Foresight: No se pudo conectar a Supabase.")
        return

    # Proyectos que vamos a vigilar
    projects = ["AUDITACAR", "ARQOVEX", "AGENT_SCOUT"]
    
    # Simulamos una base de datos de "memoria de latencia" para este ejemplo
    # En un entorno real, esto leería una tabla de logs históricos.
    history = {p: [25, 28, 30] for p in projects} 

    print("🛰️ [NEURAL_FORESIGHT] Iniciando vigilancia proactiva...")

    while True:
        try:
            for project in projects:
                # 1. Simulamos una lectura de latencia actual
                # En producción, esto sería un ping real a la API del proyecto.
                current_latency = random.randint(20, 150) 
                
                # Guardamos en nuestra memoria efímera
                history[project].append(current_latency)
                if len(history[project]) > 5:
                    history[project].pop(0)

                # 2. Lógica de Predicción: ANÁLISIS DE TENDENCIA
                # Comparamos el promedio del pasado con la lectura actual.
                avg_latency = sum(history[project][:-1]) / (len(history[project]) - 1)
                
                # Si la latencia actual es más del doble del promedio (200% spike), es una anomalía.
                if current_latency > (avg_latency * 2):
                    trigger_proactive_alert(project, current_latency, avg_latency)
                
                print(f"[*] {project} | Latencia: {current_latency}ms (Promedio: {avg_latency:.1f}ms)")

            # Esperamos 10 segundos antes de la siguiente ronda de vigilancia
            time.sleep(10)
            
        except Exception as e:
            print(f"❌ Error en el Centinela: {e}")
            time.sleep(20)

def trigger_proactive_alert(project, current, average):
    """
    Inserta una alerta predictiva en el núcleo de Nexus.
    """
    print(f"🚨 [PREDICTIVE_ANOMALY] ¡Peligro en {project}! Latencia saltó de {average:.1f}ms a {current}ms.")
    
    # --- EXPLICACIÓN: TRIGGER ---
    # Al insertar esto en 'nexus_tasks' con el prefijo "PREDICTIVE_ANOMALY",
    # el motor de Nexus (workflow.py) sabrá que debe actuar de forma preventiva.
    
    alert_description = (
        f"PREDICTIVE_ANOMALY: Se detectó una tendencia de degradación en {project}. "
        f"La latencia actual ({current}ms) supera el promedio histórico ({average:.1f}ms). "
        f"Posible saturación de conexiones o fallo de zona inminente."
    )
    
    try:
        supabase.table("nexus_tasks").insert({
            "project_name": project,
            "error_description": alert_description,
            "status": "pending"
        }).execute()
        print("✅ Alerta enviada al Sheriff exitosamente.")
    except Exception as e:
        print(f"❌ Fallo al enviar alerta: {e}")

if __name__ == "__main__":
    analyze_latency_trends()
