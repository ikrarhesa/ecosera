-- Create sought_after_items table
CREATE TABLE IF NOT EXISTS public.sought_after_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    position INTEGER NOT NULL UNIQUE CHECK (position >= 1 AND position <= 6),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Note: The images will be stored in the existing 'banners' storage bucket.

-- Enable RLS
ALTER TABLE public.sought_after_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to select all items
CREATE POLICY "Allow anon select all sought_after_items"
ON public.sought_after_items FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow auth all on sought_after_items"
ON public.sought_after_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_sought_after_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sought_after_items_updated_at_trigger
BEFORE UPDATE ON public.sought_after_items
FOR EACH ROW EXECUTE FUNCTION update_sought_after_items_updated_at();

-- Insert initial empty placeholders for the 6 slots
INSERT INTO public.sought_after_items (position, title, image_url) VALUES 
(1, 'Loading...', '/images/placeholder.svg'),
(2, 'Loading...', '/images/placeholder.svg'),
(3, 'Loading...', '/images/placeholder.svg'),
(4, 'Loading...', '/images/placeholder.svg'),
(5, 'Loading...', '/images/placeholder.svg'),
(6, 'Loading...', '/images/placeholder.svg')
ON CONFLICT (position) DO NOTHING;
