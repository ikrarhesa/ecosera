-- ============================================================
-- Ecosera: Tighten RLS — switch admin writes to authenticated
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── DROP OLD ANON INSERT POLICIES ────────────────────────────

DROP POLICY IF EXISTS "Allow anon insert products" ON products;
DROP POLICY IF EXISTS "Allow anon insert product_categories" ON product_categories;
DROP POLICY IF EXISTS "Allow anon insert product_variants" ON product_variants;

-- ─── AUTHENTICATED INSERT POLICIES ───────────────────────────

CREATE POLICY "Allow auth insert products"
ON products FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow auth insert product_categories"
ON product_categories FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow auth insert product_variants"
ON product_variants FOR INSERT TO authenticated
WITH CHECK (true);

-- ─── AUTHENTICATED UPDATE POLICIES ───────────────────────────

CREATE POLICY "Allow auth update products"
ON products FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow auth update product_categories"
ON product_categories FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow auth update product_variants"
ON product_variants FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

-- ─── AUTHENTICATED DELETE POLICIES ───────────────────────────

CREATE POLICY "Allow auth delete products"
ON products FOR DELETE TO authenticated
USING (true);

CREATE POLICY "Allow auth delete product_categories"
ON product_categories FOR DELETE TO authenticated
USING (true);

CREATE POLICY "Allow auth delete product_variants"
ON product_variants FOR DELETE TO authenticated
USING (true);

-- ─── STORAGE: switch to authenticated ────────────────────────

DROP POLICY IF EXISTS "Allow anon uploads to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon update product-images" ON storage.objects;

CREATE POLICY "Allow auth uploads to product-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow auth update product-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Allow auth delete product-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- ============================================================
-- NOTE: SELECT policies remain open for anon (buyers need to
-- read products, categories, and view product images).
-- Only write operations require authentication.
-- ============================================================
