import { NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/auth";

const SENTINEL_URL = "https://badqkfvbymxyqtwpnejd.supabase.co";
const SENTINEL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo";

const dbHeaders = {
  "apikey": SENTINEL_KEY,
  "Authorization": `Bearer ${SENTINEL_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(req: Request) {
  try {
    // Normalize header - Vercel can lowercase headers
    const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ 
        error: "Unauthorized",
        hint: `key_received: ${adminKey ? adminKey.substring(0,4) + "***" : "none"}`
      }, { status: 401 });
    }

    // Use direct REST to bypass PostgREST schema cache issue (PGRST205)
    const res = await fetch(
      `${SENTINEL_URL}/rest/v1/incident_history?select=*&order=created_at.desc&limit=20`,
      { headers: dbHeaders }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "DB Error", hint: err.hint }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ incidents: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(
      `${SENTINEL_URL}/rest/v1/incident_history`,
      {
        method: "POST",
        headers: { ...dbHeaders, "Prefer": "return=representation" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "DB Error" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ incident: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
