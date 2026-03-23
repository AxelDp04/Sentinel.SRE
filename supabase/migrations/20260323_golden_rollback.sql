-- SQL para habilitar el Protocolo Golden Rollback en Supabase
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase

CREATE TABLE IF NOT EXISTS nexus_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES nexus_tasks(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    backup_payload JSONB NOT NULL, -- El "snapshot" del estado previo
    status TEXT DEFAULT 'active',   -- 'active', 'restored', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para seguridad
ALTER TABLE nexus_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON nexus_backups FOR ALL TO service_role USING (true);
