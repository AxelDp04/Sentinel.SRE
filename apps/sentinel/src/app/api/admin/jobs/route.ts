import { NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const SENTINEL_URL = "https://badqkfvbymxyqtwpnejd.supabase.co";
const SENTINEL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZHFrZnZieW14eXF0d3BuZWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExNzM1NSwiZXhwIjoyMDg5NjkzMzU1fQ.dtW8fcpzew8AjgFPwJ1_vXGGUoVTzO9ATx-dRY-axSo";

const dbHeaders = {
  "apikey": SENTINEL_KEY,
  "Authorization": `Bearer ${SENTINEL_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(req: Request) {
  try {
    const adminKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
    if (!isValidAdminKey(adminKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${SENTINEL_URL}/rest/v1/nexus_jobs?select=*&order=created_at.desc&limit=20`,
      { headers: dbHeaders, cache: 'no-store' }
    );

    if (!res.ok) return NextResponse.json({ error: "DB Error" }, { status: 500 });
    const data = await res.json();
    return NextResponse.json({ jobs: data });
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

    const body = await req.json(); // { type: 'EMAIL_DISPATCH', force_fail: boolean }
    
    const newJob = {
        job_type: body.type || 'SYSTEM_SYNC',
        payload: { force_fail: body.force_fail || false },
        status: 'pending',
        attempts: 0
    };

    const res = await fetch(
      `${SENTINEL_URL}/rest/v1/nexus_jobs`,
      {
        method: "POST",
        headers: { ...dbHeaders, "Prefer": "return=representation" },
        body: JSON.stringify(newJob),
      }
    );

    if (!res.ok) return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    const data = await res.json();
    return NextResponse.json({ job: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
