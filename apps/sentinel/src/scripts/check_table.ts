import { getSupabaseAdmin } from "../lib/admin";

async function check() {
  console.log("🔍 Checking sentinel project connectivity...");
  const supabase = getSupabaseAdmin('sentinel');
  if (!supabase) {
    console.error("❌ Admin client NOT initialized.");
    return;
  }
  
  const { data, error } = await supabase.from('incident_history').select('*').limit(1);
  if (error) {
    console.error("❌ Table check failed:", error.message);
    if (error.message.includes("schema cache")) {
       console.log("💡 Hint: PostgREST needs to reload. Try again in 30 seconds.");
    }
  } else {
    console.log("✅ Table exists. Result count:", data?.length);
  }
}

check();
