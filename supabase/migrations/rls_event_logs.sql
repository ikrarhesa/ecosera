-- ============================================================
-- Ecosera: RLS Policies for event_logs table
--
-- The event_logs table stores analytics events (product_view,
-- wa_click). Anon users need INSERT (to log events from the
-- storefront) and authenticated users need SELECT (to read
-- metrics on the admin dashboard).
--
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Enable RLS if not already enabled
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to INSERT event logs (analytics from storefront)
CREATE POLICY "Allow anon insert event_logs"
ON event_logs FOR INSERT TO anon
WITH CHECK (true);

-- Allow authenticated users to INSERT event logs
CREATE POLICY "Allow auth insert event_logs"
ON event_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated users to SELECT event logs (admin dashboard)
CREATE POLICY "Allow auth select event_logs"
ON event_logs FOR SELECT TO authenticated
USING (true);

-- ============================================================
-- After running this, the admin dashboard will be able to
-- read event_logs and display product metrics correctly.
-- ============================================================
