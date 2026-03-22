import { diagnoseIncident } from "../lib/gemini";

async function test() {
  console.log("🚀 [SRE_SIMULATION] Starting ARQOVEX 500 Timeout Diagnosis...");
  
  const payload = {
    status: 500,
    message: "Gateway Timeout",
    source: "API_GATEWAY_IAD1",
    timestamp: new Date().toISOString()
  };

  const result = await diagnoseIncident("ARQOVEX", payload);
  
  console.log("\n--- GEMINI AI DIAGNOSIS ---");
  console.log(`CAUSE: ${result.diagnosis}`);
  console.log(`ACTION: ${result.suggestedAction}`);
  console.log("---------------------------\n");
}

test();
