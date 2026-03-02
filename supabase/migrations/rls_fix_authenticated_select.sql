-- ============================================================
-- Ecosera: Add SELECT policies for authenticated role
-- 
-- The original rls_admin_mvp.sql only created SELECT policies
-- for "anon". When a user logs in they become "authenticated"
-- and lose read access. This migration adds SELECT policies
-- for authenticated on all public tables + storage.
--
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ─── TABLE SELECT POLICIES FOR AUTHENTICATED ──────────────────

CREATE POLICY "Allow auth select categories"
ON categories FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow auth select products"
ON products FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow auth select product_categories"
ON product_categories FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow auth select product_variants"
ON product_variants FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow auth select sellers"
ON sellers FOR SELECT TO authenticated
USING (true);

-- ─── STORAGE SELECT POLICY FOR AUTHENTICATED ─────────────────
-- Allows authenticated users to read/view product images.

CREATE POLICY "Allow auth select product-images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images');

-- ============================================================
-- After running this, authenticated users will be able to:
-- ✅ Read categories (fixes "0 items" on Add Product page)
-- ✅ Upload images to product-images bucket (fixes RLS error)
-- ✅ Read all products, variants, and sellers
-- ============================================================
