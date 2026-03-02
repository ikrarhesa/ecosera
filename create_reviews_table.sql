-- Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    contact_info TEXT NOT NULL, -- Private, phone or email
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read reviews
CREATE POLICY "Public reviews are viewable by everyone."
ON public.reviews FOR SELECT
USING (true);

-- Create policy to allow anonymous/guest inserts
CREATE POLICY "Anyone can insert a review."
ON public.reviews FOR INSERT
WITH CHECK (true);

-- For admins to manage reviews later (optional)
CREATE POLICY "Admins can update and delete reviews"
ON public.reviews FOR ALL
USING (auth.role() = 'authenticated');
