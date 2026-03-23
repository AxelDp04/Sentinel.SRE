import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

NEON_URL = "postgresql://neondb_owner:npg_ri3jqv5BzQCT@ep-sweet-forest-anvtkthr-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

def find_and_fix_table():
    print("🕵️‍♂️ [HEALING] Conectando a Neon para búsqueda de tablas...")
    try:
        conn = psycopg2.connect(NEON_URL)
        cur = conn.cursor()
        
        # 1. Listar todas las tablas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        """)
        tables = [t[0] for t in cur.fetchall()]
        print(f"📋 Tablas encontradas: {tables}")
        
        # 2. Buscar candidatos de 'vehicles'
        target_found = None
        for t in tables:
            if "vehicle" in t.lower() and t.lower() != "vehicles":
                target_found = t
                break
        
        if target_found:
            print(f"🚨 Detectada tabla huérfana: '{target_found}'. Restaurando a 'vehicles'...")
            cur.execute(f'ALTER TABLE "{target_found}" RENAME TO "vehicles";')
            conn.commit()
            print("✅ Estructura restaurada con éxito.")
        elif "vehicles" in tables:
            print("🟢 La tabla 'vehicles' ya existe y está en su lugar.")
        else:
            print("❌ No se encontró ninguna tabla similar a 'vehicles'.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"💥 Error en Healing: {e}")

if __name__ == "__main__":
    find_and_fix_table()
