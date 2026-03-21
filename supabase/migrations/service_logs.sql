-- Phase 4: Autonomous Watchman - Persistence Layer
CREATE TABLE IF NOT EXISTS public.service_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('online', 'offline')),
    latency INTEGER NOT NULL,
    status_code INTEGER,
    error_message TEXT,
    level TEXT NOT NULL DEFAULT 'INFO' CHECK (level IN ('INFO', 'CRITICAL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster uptime calculation (last 24h)
CREATE INDEX IF NOT EXISTS idx_service_logs_service_id_created_at 
ON public.service_logs (service_id, created_at DESC);

-- RLS (Row Level Security) - Basic read-only for now
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.service_logs FOR SELECT USING (true);
