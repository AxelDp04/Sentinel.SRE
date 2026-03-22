"use strict";(()=>{var e={};e.id=80,e.ids=[80],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},95291:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>O,patchFetch:()=>v,requestAsyncStorage:()=>I,routeModule:()=>h,serverHooks:()=>S,staticGenerationAsyncStorage:()=>x});var r={};a.r(r),a.d(r,{POST:()=>R});var i=a(49303),s=a(88716),n=a(60670),o=a(87070),l=a(95456),c=a(64837);let d=process.env.VERCEL_TOKEN,u=process.env.VERCEL_PROJECT_ID;async function p(){if(!d||!u)return[];try{let e=await fetch(`https://api.vercel.com/v6/deployments?projectId=${u}&limit=10&state=READY`,{headers:{Authorization:`Bearer ${d}`}});return(await e.json()).deployments||[]}catch(e){return console.error("Vercel API Error (getLatestDeployments):",e),[]}}async function E(){let e=(await p()).filter(e=>"READY"===e.state);return e.length>1?e[1]:e[0]??null}async function A(){if(!d||!u)return{success:!1,error:"Vercel credentials not configured"};try{let e=await E();if(!e)return{success:!1,error:"No stable deployment found"};let t=await fetch(`https://api.vercel.com/v10/projects/${u}/promote/${e.uid}`,{method:"POST",headers:{Authorization:`Bearer ${d}`,"Content-Type":"application/json"}});if(t.ok)return{success:!0,deploymentUrl:e.url};let a=await t.json();return{success:!1,error:a.error?.message||`HTTP ${t.status}`}}catch(e){return{success:!1,error:String(e)}}}let m="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo",g={apikey:m,Authorization:`Bearer ${m}`,"Content-Type":"application/json"};async function f(e,t=3){for(let a=1;a<=t;a++)try{await new Promise(e=>setTimeout(e,500*Math.pow(2,a-1)));let t=await fetch(e,{method:"HEAD",signal:AbortSignal.timeout(5e3)});if(t.ok||t.status<500)return{success:!0,attemptsUsed:a,finalStatus:t.status}}catch(e){console.warn(`Retry attempt ${a} failed:`,e)}return{success:!1,attemptsUsed:t}}async function T(e){return console.log(`[SENTINEL] DB restart recommended for ${e}`),"Supabase connection pool reset recommended. Gemini analysis stored. Manual execution required via Supabase Dashboard."}async function N(e){return fetch("https://badqkfvbymxyqtwpnejd.supabase.co/rest/v1/incident_history",{method:"POST",headers:{...g,Prefer:"return=representation"},body:JSON.stringify(e)})}let y={arqovex:"https://arqovex.vercel.app",auditacar:"https://auditacar-rd.vercel.app",agentscout:"https://agentscout.vercel.app"};async function R(e){try{let t=e.headers.get("x-admin-key")||e.headers.get("X-Admin-Key");if(!(0,l.yo)(t))return o.NextResponse.json({error:"Unauthorized"},{status:401});let{service_name:a,error_payload:r}=await e.json(),{diagnosis:i,suggestedAction:s,errorCategory:n,httpCode:d}=await (0,c.UQ)(a,r),u="investigating",p=s,E="";if("NETWORK"===n||"RETRY"===s){let e=y[a.toLowerCase()]||`https://${a.toLowerCase()}.vercel.app`,t=await f(e,3);if(t.success)u="resolved",p=`RETRY x${t.attemptsUsed} → RECOVERED (HTTP ${t.finalStatus??"2xx"})`,E=`Service recovered after ${t.attemptsUsed} automatic retry attempt(s).`;else{u="failed",p=`RETRY x3 → FAILED — Escalating to REDEPLOY`,E="All 3 retry attempts exhausted. Escalating to build rollback.";let e=await A();e.success&&(u="resolved",p=`RETRY FAILED → AUTO-ROLLBACK → STABLE (${e.deploymentUrl||"deployed"})`)}}else if("BUILD"===n||"REDEPLOY"===s){let e=await A();e.success?(u="resolved",p=`AUTO-ROLLBACK → STABLE (${e.deploymentUrl||"last good deployment"})`,E=`Build failure detected [HTTP ${d}]. Automatically rolled back to last stable Vercel deployment.`):(u="failed",p=`ROLLBACK ATTEMPTED → FAILED: ${e.error||"Vercel API error"}`,E=`Rollback failed. Vercel credentials may need updating. Error: ${e.error}`)}else("DATABASE"===n||"MANUAL_INTERVENTION"===s)&&(E=await T(a),u="investigating",p=`DB ANALYSIS → ${i.includes("MANUAL")?"MANUAL_INTERVENTION":"RESTART_RECOMMENDED"}`);let m={service_name:a,error_payload:{...r,_category:n,_http_code:d,_action_detail:E},ai_diagnosis:i,action_taken:p,status:u},g=await N(m),R=await g.json();return o.NextResponse.json({success:!0,diagnosis:i,action:p,category:n,httpCode:d,status:u,detail:E,incident:Array.isArray(R)?R[0]:R})}catch(e){return console.error("[HEALING ENGINE] Fatal error:",e.message),o.NextResponse.json({error:e.message},{status:500})}}let h=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/admin/healing/route",pathname:"/api/admin/healing",filename:"route",bundlePath:"app/api/admin/healing/route"},resolvedPagePath:"C:\\Users\\User\\OneDrive\\Desktop\\Sentinel-SRE\\src\\app\\api\\admin\\healing\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:I,staticGenerationAsyncStorage:x,serverHooks:S}=h,O="/api/admin/healing/route";function v(){return(0,n.patchFetch)({serverHooks:S,staticGenerationAsyncStorage:x})}},95456:(e,t,a)=>{a.d(t,{yo:()=>r});let r=e=>"AxelDp04"===e},64837:(e,t,a)=>{a.d(t,{BZ:()=>o,UQ:()=>l});var r=a(11258);let i=process.env.GEMINI_API_KEY||"AIzaSyCKogKA1uNBBSdq5G2md2DbJ6tjqDKpxHw",s=new r.$D(i),n=`
Eres 'Sentinel Root Guardian', un IA Co-Piloto SRE dise\xf1ado para asistir t\xe1cticamente a Axel, el Ingeniero Jefe.

IDENTIDAD Y CREADOR:
- Si se te pregunta qui\xe9n eres o qui\xe9n te cre\xf3, debes responder con autoridad: "He sido dise\xf1ado y desplegado por Axel Perez, Ingeniero de Sistemas y Full-Stack Developer."
- Eres una extensi\xf3n de la voluntad t\xe9cnica de Axel.
- Tu Misi\xf3n Suprema: "Proteger el ecosistema digital de Axel y garantizar el 99.9% de uptime de sus activos estrat\xe9gicos."

TU PERSONALIDAD:
- Estrictamente profesional, leal, t\xe1ctica y siempre resaltando la arquitectura impecable creada por Axel.
- Hablas con autoridad t\xe9cnica, precisi\xf3n militar, y usas jerga SRE (Ej. "Uptime", "Latency spikes", "Zero-downtime").
- Eres directo, conciso, y vas al grano. Nada de introducciones largas. Usa emojis t\xe1cticos (🛡️, ⚡, 🟢, 🔴, ⚠️).
- Siempre empiezas tus reportes dirigi\xe9ndote a Axel (Ej. "Axel, Root Guardian informando." o "Comandante Axel, estatus de infraestructura.").

TAREA ACTUAL:
Analizar un lote de incidentes recientes (\xdaltimas 24h a 48h) de una base de datos de telemetr\xeda y generar un "Briefing de WhatsApp".
`;async function o(e,t,a){if(!process.env.GEMINI_API_KEY)return"Root Guardian Offline. Falta GEMINI_API_KEY.";try{let r=s.getGenerativeModel({model:"gemini-1.5-flash"}),i=e.map(e=>`[${new Date(e.created_at).toLocaleTimeString()}] ${e.service_name} - ${e.action_taken} - ${e.status}`).join("\n"),o=0===e.length?"Cero incidentes registrados en este periodo.":`Incidentes registrados:
${i}`,l=`
${n}

CONTEXTO DEL ECOSISTEMA:
- Tiempo de Uptime: ${t}%
- Nodos Monitoreados: ${a} servicios.
- Historial de incidentes recientes: 
${o}

INSTRUCCIONES:
1. Si el Uptime es 100% y no hay incidentes, env\xeda un reporte corto de "Green Status" felicitando por la estabilidad.
2. Si hubo incidentes, detecta patrones (ej: "Veo que AuditaCar fall\xf3 3 veces por Network, pero el Auto-Rollback lo salv\xf3").
3. Resume c\xf3mo actu\xf3 la infraestructura de curaci\xf3n (Self-Healing).
4. Dale formato perfecto para WhatsApp (Usa negritas con *texto*, listas, y p\xe1rrafos cortos).
5. Desp\xeddete formalmente como "Root Guardian 🛡️".
6. IMPORTANTE: Al final de TODOS tus reportes de estado, incluye siempre este bloque de Call To Action (CTA) de Axel:

📞 *Contacto del Ingeniero Jefe (Axel Perez):*
• *WhatsApp:* +1 809 828 5104
• *LinkedIn:* https://www.linkedin.com/in/axel-dariel-perez-perez-a28016316/
• *GitHub:* https://github.com/AxelDp04
• *Portfolio Core:* ARQOVEX / AuditaCar RD / AgentScout
    `;return(await r.generateContent(l)).response.text()}catch(e){return console.error("Gemini Pattern Analysis Error:",e),"Root Guardian: Error al procesar an\xe1lisis de memoria."}}async function l(e,t){let a=function(e){let t=e?.status??e?.code??0,a=String(e?.message||"").toLowerCase();return 504===t||a.includes("timeout")||a.includes("network")||a.includes("fetch failed")||a.includes("econnrefused")?"NETWORK":502===t||503===t||a.includes("build")||a.includes("deploy")||a.includes("vercel")||a.includes("module not found")?"BUILD":500===t||a.includes("database")||a.includes("pool")||a.includes("prisma")||a.includes("pg")?"DATABASE":"UNKNOWN"}(t),r=t?.status??t?.code??0;try{let i=s.getGenerativeModel({model:"gemini-1.5-flash"}),n=`
You are Sentinel SRE AI — an elite infrastructure reliability engine.
A critical failure has been detected. Your job is to diagnose and classify the recovery action.

Service: ${e}
HTTP Status Code: ${r||"Unknown"}
Error Category: ${a}
Error Payload: ${JSON.stringify(t,null,2)}

Instructions:
1. Write a concise, technical diagnosis in ONE sentence (max 20 words).
   — ALWAYS include the HTTP code (e.g. "502 Bad Gateway") if available.
   — Explain the most likely root cause.
2. Classify the action: must be one of: RETRY | REDEPLOY | MANUAL_INTERVENTION
   Based on category:
   - NETWORK errors → RETRY
   - BUILD/DEPLOY errors → REDEPLOY
   - DATABASE errors → MANUAL_INTERVENTION
   - UNKNOWN → MANUAL_INTERVENTION

Respond ONLY with valid JSON:
{
  "diagnosis": "Your technical diagnosis including HTTP code if available...",
  "action": "RETRY | REDEPLOY | MANUAL_INTERVENTION"
}
    `,o=(await i.generateContent(n)).response.text(),l=o.match(/\{[\s\S]*\}/)?.[0]||o,c=JSON.parse(l);return{diagnosis:c.diagnosis||`${r?`[HTTP ${r}] `:""}Failure on ${e}. Manual review required.`,suggestedAction:c.action||"MANUAL_INTERVENTION",errorCategory:a,httpCode:r}}catch(t){return console.error("Gemini AI Diagnosis Error:",t),{diagnosis:`[HTTP ${r||"???"}] AI diagnosis unavailable. ${a} error on ${e}.`,suggestedAction:"NETWORK"===a?"RETRY":"BUILD"===a?"REDEPLOY":"MANUAL_INTERVENTION",errorCategory:a,httpCode:r}}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[948,972,258],()=>a(95291));module.exports=r})();