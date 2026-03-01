-- ============================================================
-- Ecosera: Allow authenticated users to INSERT sellers
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Allow authenticated INSERT on sellers
CREATE POLICY "Allow auth insert sellers"
ON sellers FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated DELETE on sellers (for future use)
CREATE POLICY "Allow auth delete sellers"
ON sellers FOR DELETE TO authenticated
USING (true);
