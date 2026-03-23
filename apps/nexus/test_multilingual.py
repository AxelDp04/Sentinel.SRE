import asyncio
from workflow import nexus_workflow

async def run_test(description, project="AUDITACAR"):
    print(f"\n--- TESTING DESCRIPTION: {description} ---")
    initial_state = {
        "task_id": "test-id",
        "project_name": project,
        "error_description": description,
        "resolution_steps": [],
        "proposed_solution": None,
        "security_feedback": None,
        "security_approved": False,
        "final_output": None
    }
    
    final_state = nexus_workflow.invoke(initial_state)
    
    print(f"Language Detected: {final_state.get('language')}")
    print(f"Proposed Solution: {final_state.get('proposed_solution')}")
    print("Resolution Steps:")
    for step in final_state["resolution_steps"]:
        print(f" - {step}")
    
    return final_state

async def main():
    import sys
    # Redirect stdout to a file
    with open("test_output.log", "w", encoding="utf-8") as f:
        sys.stdout = f
        # Test Spanish
        await run_test("Error de conexión en la base de datos de vehículos")
        
        # Test English
        await run_test("Database connection timeout in AuditaCar project")
        sys.stdout = sys.__stdout__

if __name__ == "__main__":
    asyncio.run(main())
