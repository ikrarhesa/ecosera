-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    cta_text TEXT,
    text_color TEXT DEFAULT 'white',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to select active banners
CREATE POLICY "Allow anon select active banners"
ON public.banners FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow auth all on banners"
ON public.banners FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
