-- ============================================================
-- Ecosera: RLS Policies for Admin MVP (Anon Access)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── READ POLICIES ────────────────────────────────────────────

-- Allow anon to read sellers (for AdminShops)
CREATE POLICY "Allow anon select sellers"
ON sellers FOR SELECT TO anon
USING (true);

-- Allow anon to read categories (for AdminProductNew chips)
CREATE POLICY "Allow anon select categories"
ON categories FOR SELECT TO anon
USING (true);

-- Allow anon to read products (for AdminProducts list)
CREATE POLICY "Allow anon select products"
ON products FOR SELECT TO anon
USING (true);

-- Allow anon to read product_categories
CREATE POLICY "Allow anon select product_categories"
ON product_categories FOR SELECT TO anon
USING (true);

-- Allow anon to read product_variants
CREATE POLICY "Allow anon select product_variants"
ON product_variants FOR SELECT TO anon
USING (true);

-- ─── INSERT POLICIES ──────────────────────────────────────────

-- Allow anon to insert products
CREATE POLICY "Allow anon insert products"
ON products FOR INSERT TO anon
WITH CHECK (true);

-- Allow anon to insert product_categories
CREATE POLICY "Allow anon insert product_categories"
ON product_categories FOR INSERT TO anon
WITH CHECK (true);

-- Allow anon to insert product_variants
CREATE POLICY "Allow anon insert product_variants"
ON product_variants FOR INSERT TO anon
WITH CHECK (true);

-- ============================================================
-- NOTE: These are open policies for MVP development.
-- Replace with role-based policies when auth is implemented.
-- ============================================================
