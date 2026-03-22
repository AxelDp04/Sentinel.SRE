from supabase import create_client, Client
import random
import os
from dotenv import load_dotenv

# Load the environment variables from the apps/nexus .env
load_dotenv(dotenv_path="C:/Users/User/OneDrive/Desktop/Nexus/apps/nexus/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Select a random project and a mock error
projects = ["AuditaCar", "ARQOVEX", "JOWILSA Platform"]
errors = [
    "Error 500: Timeout in database connection pool. Too many pending queries.",
    "Error 502: Bad Gateway from Redis cache node in us-east-1.",
    "Critical Alert: S3 Bucket API Rate limit exceeded for images bucket.",
    "Fatal Exception: Memory leak detected in worker process pid 4509."
]

project_name = random.choice(projects)
error_description = random.choice(errors)

print(f"Injecting test incident for {project_name}...")
print(f"Error: {error_description}")

response = supabase.table("nexus_tasks").insert({
    "project_name": project_name,
    "error_description": error_description,
    "status": "pending",
    "resolution_steps": ["Sentinel: Se detectó una falla crítica y se derivó a Nexus."]
}).execute()

print("Incident successfully injected!")
print(response.data)
