-- ============================================================
-- Ecosera: Extend sellers table for shop profile
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add new columns (safe to run even if they partially exist)
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS logo_url    TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS banner_url  TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS phone       TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS email       TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS address     TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';

-- social_media stores: { "instagram": "...", "facebook": "...", "tiktok": "...", "whatsapp": "..." }

-- ─── RLS: allow authenticated update on sellers ──────────────
CREATE POLICY "Allow auth update sellers"
ON sellers FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

-- ─── Storage bucket for shop logos ───────────────────────────
-- Create a public bucket called "shop-logos" in Supabase Storage UI,
-- then run:
CREATE POLICY "Allow auth uploads to shop-logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'shop-logos');

CREATE POLICY "Allow auth update shop-logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'shop-logos');

CREATE POLICY "Allow anon select shop-logos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'shop-logos');
