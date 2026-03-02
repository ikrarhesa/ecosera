-- Add start_date and end_date columns for banner scheduling
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Drop and recreate the anon policy to enforce date filtering
DROP POLICY IF EXISTS "Allow anon select active banners" ON public.banners;

CREATE POLICY "Allow anon select active banners"
ON public.banners FOR SELECT
TO anon, authenticated
USING (
    is_active = true 
    AND (start_date IS NULL OR now() >= start_date)
    AND (end_date IS NULL OR now() <= end_date)
);
