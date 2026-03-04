-- Migration: Add live_sessions table for Google Sheets → Supabase pipeline
-- This is purely additive. No existing tables or policies are modified.

-- Table: live_sessions
CREATE TABLE public.live_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_key TEXT        NOT NULL,
  date          TEXT        NOT NULL,
  presenter     TEXT        NOT NULL DEFAULT 'Desconhecido',
  views         NUMERIC     NOT NULL DEFAULT 0,
  leads         NUMERIC     NOT NULL DEFAULT 0,
  conversion    NUMERIC     NOT NULL DEFAULT 0,
  revenue       NUMERIC     NOT NULL DEFAULT 0,
  sales         NUMERIC     NOT NULL DEFAULT 0,
  retention     NUMERIC     NOT NULL DEFAULT 0,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT live_sessions_unique_session UNIQUE (dashboard_key, date, presenter)
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Authenticated users (dashboard viewers) can read all sessions
CREATE POLICY "Authenticated users can read live sessions"
ON public.live_sessions FOR SELECT USING (auth.role() = 'authenticated');

-- Anyone can insert and update (Google Apps Script uses anon key)
-- Acceptable: data is non-sensitive analytics, anon key is already public in VITE_ env vars
CREATE POLICY "Anyone can insert live sessions"
ON public.live_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update live sessions"
ON public.live_sessions FOR UPDATE USING (true);

-- Index for the most common query pattern: filter by dashboard_key
CREATE INDEX IF NOT EXISTS live_sessions_dashboard_key_idx ON public.live_sessions (dashboard_key);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
