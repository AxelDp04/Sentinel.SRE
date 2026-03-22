import { GoogleGenerativeAI } from "@google/generative-ai";
import { HealingAction } from "@/types/incidents";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCKogKA1uNBBSdq5G2md2DbJ6tjqDKpxHw";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function diagnoseIncident(serviceName: string, errorPayload: any): Promise<{
  diagnosis: string;
  suggestedAction: HealingAction;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are the Sentinel SRE AI. A service failure has been detected.
      Service: ${serviceName}
      Error Payload: ${JSON.stringify(errorPayload)}
      
      Tasks:
      1. Analyze the root cause.
      2. Summarize the cause in exactly 10 words.
      3. Classify the necessary recovery action as: RETRY, REDEPLOY, or MANUAL_INTERVENTION.
      
      Response Format (JSON only):
      {
        "diagnosis": "Summary in 10 words...",
        "action": "RETRY | REDEPLOY | MANUAL_INTERVENTION"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON if needed
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    const parsed = JSON.parse(jsonStr);

    return {
      diagnosis: parsed.diagnosis || "Unknown failure detected.",
      suggestedAction: (parsed.action as HealingAction) || "MANUAL_INTERVENTION"
    };
  } catch (error) {
    console.error("Gemini AI Diagnosis Error:", error);
    return {
      diagnosis: "AI Diagnosis failed to initialize.",
      suggestedAction: "MANUAL_INTERVENTION"
    };
  }
}
